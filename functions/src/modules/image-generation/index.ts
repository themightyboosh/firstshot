import { v4 as uuidv4 } from 'uuid';
import { Worker } from 'bullmq';
import type { ImageGenerationJob, GenerateImageRequest, JobStatusResponse } from './types';
import { db, storage } from '../../lib/firebase';
import { logger } from '../../lib/logger';
import { queueService } from '../../lib/queue';

// Configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'realness-score';
const LOCATION = 'us-central1';
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'realness-score.firebasestorage.app';

// Google Vertex AI Configuration
const IMAGEN_MODEL = process.env.IMAGEN_MODEL || 'imagen-4.0-generate-001';

// Rate limiting
const MIN_DELAY_BETWEEN_JOBS = 20000; 

// Redis connection
const REDIS_URL = process.env.REDIS_URL || '';

const JOBS_COLLECTION = 'image_generation_jobs';
const QUEUE_NAME = 'archetype-image-generation';

/**
 * Update job status in Firestore
 */
async function updateJobStatus(
  jobId: string, 
  status: ImageGenerationJob['status'], 
  updates: Partial<ImageGenerationJob> = {}
): Promise<void> {
  await db.collection(JOBS_COLLECTION).doc(jobId).update({
    status,
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  logger.info(`Job ${jobId} status updated to: ${status}`);
}

/**
 * Create a new image generation job
 */
export async function createImageJob(request: GenerateImageRequest): Promise<{ jobId: string }> {
  const jobId = uuidv4();
  
  const job: ImageGenerationJob = {
    id: jobId,
    archetypeId: request.archetypeId,
    archetypeName: request.archetypeName,
    prompt: request.prompt,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await db.collection(JOBS_COLLECTION).doc(jobId).set(job);
  logger.info(`Job ${jobId} created in Firestore.`);
  
  if (REDIS_URL) {
    try {
      const queue = queueService.getQueue(QUEUE_NAME, {
        defaultJobOptions: { 
          attempts: 3, 
          backoff: { type: 'exponential', delay: 30000 }, 
          removeOnComplete: 100, 
          removeOnFail: 50 
        },
      });
      await queue.add('generate-image', { jobId, ...request }, { jobId });
      logger.info(`Job ${jobId} added to BullMQ queue`);
    } catch (error) {
      logger.error('BullMQ queue error:', error);
    }
  } else {
    logger.info(`Job ${jobId} pending. Waiting for processing trigger.`);
  }
  
  return { jobId };
}

/**
 * Get job status from Firestore
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const doc = await db.collection(JOBS_COLLECTION).doc(jobId).get();
  
  if (!doc.exists) throw new Error('Job not found');
  
  const job = doc.data() as ImageGenerationJob;
  let queuePosition: number | undefined;
  
  if (job.status === 'pending') {
    const snapshot = await db.collection(JOBS_COLLECTION).where('status', '==', 'pending').get();
    const allPending = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() } as ImageGenerationJob))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const index = allPending.findIndex(d => d.id === jobId);
    if (index >= 0) queuePosition = index + 1;
  }
  
  return {
    status: job.status,
    imageUrl: job.imageUrl,
    error: job.error,
    queuePosition,
  };
}

/**
 * Process a job directly with SERVERLESS COORDINATION
 */
export async function processJobDirectly(jobId: string): Promise<{ success: boolean; imageUrl?: string }> {
  const jobRef = db.collection(JOBS_COLLECTION).doc(jobId);
  const MAX_WAIT_TIME = 480000;
  const START_TIME = Date.now();
  
  logger.info(`Starting coordinated processing for job ${jobId}`);
  
  while (true) {
    if (Date.now() - START_TIME > MAX_WAIT_TIME) throw new Error('Timed out waiting for queue slot.');
    
    const currentDoc = await jobRef.get();
    if (!currentDoc.exists) throw new Error('Job not found');
    const jobData = currentDoc.data() as ImageGenerationJob;
    
    if (jobData.status === 'completed') return { success: true, imageUrl: jobData.imageUrl };
    if (jobData.status === 'failed') throw new Error(`Job failed: ${jobData.error}`);
    if (jobData.status === 'processing') {
       const lastUpdate = new Date(jobData.updatedAt).getTime();
       if (Date.now() - lastUpdate < 300000) { 
          // Active
       }
    }

    const processingSnapshot = await db.collection(JOBS_COLLECTION).where('status', '==', 'processing').get();
    const blockingDocs = processingSnapshot.docs.filter(d => d.id !== jobId);
    let activeBlocker = false;
    
    if (blockingDocs.length > 0) {
      for (const doc of blockingDocs) {
        const data = doc.data() as ImageGenerationJob;
        const lastUpdate = new Date(data.updatedAt).getTime();
        if (Date.now() - lastUpdate > 300000) {
          logger.warn(`Found zombie job ${doc.id}, marking failed.`);
          await db.collection(JOBS_COLLECTION).doc(doc.id).update({ status: 'failed', error: 'Timeout/Zombie detected', updatedAt: new Date().toISOString() });
        } else {
          activeBlocker = true;
          logger.info(`Job ${jobId} waiting: Queue blocked by ${doc.id}`);
        }
      }
      if (activeBlocker) {
        await sleep(5000);
        continue;
      }
    }
    
    const allPendingSnapshot = await db.collection(JOBS_COLLECTION).where('status', '==', 'pending').get();
    const sortedPending = allPendingSnapshot.docs
      .map(d => ({ id: d.id, ...d.data() } as ImageGenerationJob))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
    if (sortedPending.length > 0 && sortedPending[0].id !== jobId) {
      logger.info(`Job ${jobId} waiting: Not oldest pending (Oldest: ${sortedPending[0].id})`);
      await sleep(5000);
      continue;
    }
    
    const completedSnapshot = await db.collection(JOBS_COLLECTION).where('status', '==', 'completed').orderBy('updatedAt', 'desc').limit(1).get().catch(async () => ({ empty: true, docs: [] }));
    if (!completedSnapshot.empty) {
      // @ts-ignore
      const lastJob = completedSnapshot.docs[0].data() as ImageGenerationJob;
      const lastFinished = new Date(lastJob.updatedAt).getTime();
      const timeSince = Date.now() - lastFinished;
      if (timeSince < MIN_DELAY_BETWEEN_JOBS) {
        const waitTime = MIN_DELAY_BETWEEN_JOBS - timeSince;
        logger.info(`Job ${jobId} waiting: Rate limit (${(waitTime/1000).toFixed(1)}s)`);
        await sleep(waitTime);
      }
    }
    
    try {
      await jobRef.update({ status: 'processing', updatedAt: new Date().toISOString() });
      logger.info(`Job ${jobId} claimed lock.`);
      break;
    } catch (e) {
      logger.error(`Failed to claim lock`, e);
      await sleep(1000);
      continue;
    }
  }
  
  try {
    const job = (await jobRef.get()).data() as ImageGenerationJob;
    logger.info(`Job ${jobId} generating with Imagen 4...`);
    const imageBuffer = await generateImageWithImagen(job.prompt);
    
    logger.info(`Job ${jobId} uploading...`);
    const imageUrl = await uploadToGCS(imageBuffer, job.archetypeId, job.archetypeName);
    
    logger.info(`Job ${jobId} complete: ${imageUrl}`);
    await updateJobStatus(jobId, 'completed', { imageUrl });

    // AUTO-SAVE to CAS Config
    try {
      const configRef = db.collection('cas_config').doc('main');
      const configDoc = await configRef.get();
      if (configDoc.exists) {
        const config = configDoc.data() as any;
        if (config.archetypes && Array.isArray(config.archetypes)) {
           const updatedArchetypes = config.archetypes.map((a: any) => {
             if (a.id === job.archetypeId) return { ...a, imageUrl: imageUrl };
             return a;
           });
           await configRef.update({ archetypes: updatedArchetypes });
           logger.info(`Auto-saved image to CAS Config for ${job.archetypeId}`);
        }
      }
    } catch (err) {
      logger.error('Failed to auto-save to config:', err);
    }
    
    return { success: true, imageUrl };
  } catch (error) {
    logger.error(`Job ${jobId} failed:`, error);
    await updateJobStatus(jobId, 'failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateImageWithImagen(prompt: string, retryCount = 0): Promise<Buffer> {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 30000;
  
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const accessToken = await auth.getAccessToken();
  if (!accessToken) throw new Error('Failed to get access token');
  
  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${IMAGEN_MODEL}:predict`;
  
  const requestBody = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: '1:1',
      personGeneration: 'allow_adult',
      safetySetting: 'block_medium_and_above',
      addWatermark: true,
      outputOptions: { mimeType: 'image/png' },
    },
  };
  
  logger.info(`Calling Imagen API...`);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  
  if (response.status === 429) {
    if (retryCount < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, retryCount);
      logger.warn(`Rate limited. Retry ${retryCount + 1}`);
      await sleep(delay);
      return generateImageWithImagen(prompt, retryCount + 1);
    }
    throw new Error('Rate limit exceeded.');
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Imagen API error (${response.status}): ${errorText}`);
  }
  
  const data = await response.json();
  if (data.predictions?.[0]?.bytesBase64Encoded) {
    return Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64');
  }
  throw new Error('No image data in response');
}

async function uploadToGCS(imageBuffer: Buffer, archetypeId: string, archetypeName: string): Promise<string> {
  const bucket = storage.bucket(BUCKET_NAME);
  const filename = `archetype-images/${archetypeId}_${Date.now()}.png`;
  const file = bucket.file(filename);
  
  await file.save(imageBuffer, {
    metadata: {
      contentType: 'image/png',
      metadata: { archetypeId, archetypeName, generatedAt: new Date().toISOString(), model: IMAGEN_MODEL, provider: 'google' },
    },
  });
  
  await file.makePublic();
  return `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;
}

export async function cleanupOldJobs(hoursOld = 48): Promise<number> {
  const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000).toISOString();
  const snapshot = await db.collection(JOBS_COLLECTION).where('createdAt', '<', cutoff).get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  return snapshot.size;
}

export function startImageWorker(): Worker { throw new Error('Not supported'); }
export async function closeConnections(): Promise<void> { await queueService.close(); }
