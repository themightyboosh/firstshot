import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import type { ImageGenerationJob, GenerateImageRequest, JobStatusResponse } from './types';

// Initialize Google Cloud Storage
const storage = new Storage();
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'realness-score.firebasestorage.app';

// Get Firestore instance
const getDb = () => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
};

// Job collection in Firestore (BullMQ-like queue stored in Firestore for simplicity with Cloud Functions)
const JOBS_COLLECTION = 'image_generation_jobs';

/**
 * Create a new image generation job
 */
export async function createImageJob(request: GenerateImageRequest): Promise<{ jobId: string }> {
  const db = getDb();
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
  
  // In a production setup, you would trigger processing here via Cloud Tasks or Pub/Sub
  // For now, we'll process immediately (or you can set up a separate worker)
  processJob(jobId).catch(err => {
    console.error(`Error processing job ${jobId}:`, err);
  });
  
  return { jobId };
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const db = getDb();
  const doc = await db.collection(JOBS_COLLECTION).doc(jobId).get();
  
  if (!doc.exists) {
    throw new Error('Job not found');
  }
  
  const job = doc.data() as ImageGenerationJob;
  
  return {
    status: job.status,
    imageUrl: job.imageUrl,
    error: job.error,
  };
}

/**
 * Process an image generation job
 * This uses Google's Vertex AI Imagen API
 */
async function processJob(jobId: string): Promise<void> {
  const db = getDb();
  const jobRef = db.collection(JOBS_COLLECTION).doc(jobId);
  
  try {
    // Update status to processing
    await jobRef.update({
      status: 'processing',
      updatedAt: new Date().toISOString(),
    });
    
    const jobDoc = await jobRef.get();
    const job = jobDoc.data() as ImageGenerationJob;
    
    // Generate image using Vertex AI Imagen
    const imageBuffer = await generateImageWithVertexAI(job.prompt);
    
    // Upload to Google Cloud Storage
    const imageUrl = await uploadToGCS(imageBuffer, job.archetypeId, job.archetypeName);
    
    // Update job with success
    await jobRef.update({
      status: 'completed',
      imageUrl,
      updatedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    
    // Update job with failure
    await jobRef.update({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Generate image using Google Vertex AI Imagen
 */
async function generateImageWithVertexAI(prompt: string): Promise<Buffer> {
  // Import dynamically to avoid issues if not configured
  const { VertexAI } = await import('@google-cloud/vertexai');
  
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'realness-score';
  const location = 'us-central1';
  
  const vertexAI = new VertexAI({ project: projectId, location });
  
  // Use Imagen model for image generation
  // Note: You may need to enable the API and have proper permissions
  const model = vertexAI.preview.getGenerativeModel({
    model: 'imagegeneration@006', // Imagen 3
  });
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  
  const response = result.response;
  
  // Extract image data from response
  // The actual response structure depends on the API version
  if (response.candidates && response.candidates[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if ('inlineData' in part && part.inlineData) {
        return Buffer.from(part.inlineData.data, 'base64');
      }
    }
  }
  
  throw new Error('No image data in response');
}

/**
 * Alternative: Generate image using Imagen API directly via AI Platform
 * Export for potential use as fallback
 */
export async function generateImageWithImagenAPI(prompt: string): Promise<Buffer> {
  const { PredictionServiceClient } = await import('@google-cloud/aiplatform');
  
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'realness-score';
  const location = 'us-central1';
  const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006`;
  
  const client = new PredictionServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  });
  
  const instances = [
    {
      prompt: prompt,
    },
  ];
  
  const parameters = {
    sampleCount: 1,
    aspectRatio: '1:1',
    safetyFilterLevel: 'block_few',
    personGeneration: 'allow_adult',
  };
  
  const [response] = await client.predict({
    endpoint,
    instances: instances.map(i => ({ structValue: { fields: { prompt: { stringValue: i.prompt } } } })),
    parameters: { structValue: { fields: Object.fromEntries(
      Object.entries(parameters).map(([k, v]) => [k, typeof v === 'number' ? { numberValue: v } : { stringValue: String(v) }])
    ) } },
  });
  
  if (response.predictions && response.predictions.length > 0) {
    const prediction = response.predictions[0];
    if (prediction.structValue?.fields?.bytesBase64Encoded?.stringValue) {
      return Buffer.from(prediction.structValue.fields.bytesBase64Encoded.stringValue, 'base64');
    }
  }
  
  throw new Error('No image generated');
}

/**
 * Upload image buffer to Google Cloud Storage
 */
async function uploadToGCS(imageBuffer: Buffer, archetypeId: string, archetypeName: string): Promise<string> {
  const bucket = storage.bucket(BUCKET_NAME);
  const filename = `archetype-images/${archetypeId}_${Date.now()}.png`;
  const file = bucket.file(filename);
  
  await file.save(imageBuffer, {
    metadata: {
      contentType: 'image/png',
      metadata: {
        archetypeId,
        archetypeName,
        generatedAt: new Date().toISOString(),
      },
    },
  });
  
  // Make the file publicly accessible
  await file.makePublic();
  
  // Return public URL
  return `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;
}

/**
 * Delete all jobs older than specified hours (cleanup)
 */
export async function cleanupOldJobs(hoursOld = 24): Promise<number> {
  const db = getDb();
  const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000).toISOString();
  
  const snapshot = await db.collection(JOBS_COLLECTION)
    .where('createdAt', '<', cutoff)
    .get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  return snapshot.size;
}
