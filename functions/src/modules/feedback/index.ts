import { db } from "../../lib/firebase";
import { queueService } from "../../lib/queue";
import { logger } from "../../lib/logger";

export interface FeedbackItem {
  id?: string;
  score: number;
  comment?: string;
  timestamp: string;
  recommendationType?: string;
  sessionId?: string;
  appVersion?: string;
  userId?: string;
}

const COLLECTION_NAME = "feedback";
const FEEDBACK_QUEUE_NAME = "feedback-submission";

/**
 * Validates feedback data and returns a clean FeedbackItem
 */
const validateAndPrepare = (data: any): FeedbackItem => {
  if (!data.score) {
    throw new Error("Score is required");
  }
  
  const score = Number(data.score);
  if (isNaN(score) || score < 1 || score > 5) {
    throw new Error("Score must be a number between 1 and 5");
  }

  return {
    score,
    comment: data.comment ? String(data.comment).substring(0, 500) : undefined,
    timestamp: new Date().toISOString(),
    recommendationType: data.recommendationType,
    sessionId: data.sessionId,
    appVersion: data.appVersion,
    userId: data.userId || 'anonymous'
  };
};

/**
 * Queue feedback for async processing (fast response to client)
 * Falls back to direct write if Redis is not available
 */
export const queueFeedback = async (data: any): Promise<{ queued: boolean; feedbackId?: string }> => {
  // Validate first so we fail fast on bad data
  const feedback = validateAndPrepare(data);
  const jobId = `feedback-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const REDIS_URL = process.env.REDIS_URL;
  
  if (REDIS_URL) {
    try {
      const queue = queueService.getQueue(FEEDBACK_QUEUE_NAME);
      await queue.add('submit-feedback', { jobId, ...feedback }, { jobId });
      logger.info(`Feedback ${jobId} added to BullMQ queue`);
      return { queued: true };
    } catch (error) {
      logger.error('BullMQ queue error, falling back to direct write:', error);
      // Fall through to direct write
    }
  }
  
  // No Redis or queue failed - write directly
  const result = await writeFeedback(feedback);
  return { queued: false, feedbackId: result.id };
};

/**
 * Direct write to Firestore (used by queue worker or as fallback)
 */
export const writeFeedback = async (feedback: FeedbackItem): Promise<FeedbackItem> => {
  const docRef = await db.collection(COLLECTION_NAME).add(feedback);
  return { id: docRef.id, ...feedback };
};

/**
 * Process a queued feedback job
 */
export const processFeedbackJob = async (data: any): Promise<FeedbackItem> => {
  const { jobId, ...feedback } = data;
  logger.info(`Processing feedback job: ${jobId}`);
  return writeFeedback(feedback);
};

/**
 * Submit feedback directly (legacy - validates and writes synchronously)
 */
export const submitFeedback = async (data: any): Promise<FeedbackItem> => {
  const feedback = validateAndPrepare(data);
  const docRef = await db.collection(COLLECTION_NAME).add(feedback);
  return { id: docRef.id, ...feedback };
};

export const getFeedback = async (limit = 100): Promise<FeedbackItem[]> => {
  const snapshot = await db.collection(COLLECTION_NAME)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedbackItem));
};

/**
 * Clear all feedback from the collection
 */
export const clearFeedback = async (): Promise<{ deletedCount: number }> => {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  
  if (snapshot.empty) {
    return { deletedCount: 0 };
  }
  
  // Delete in batches of 500 (Firestore limit)
  const batchSize = 500;
  let deletedCount = 0;
  
  const batches: FirebaseFirestore.WriteBatch[] = [];
  let currentBatch = db.batch();
  let opCount = 0;
  
  snapshot.docs.forEach(doc => {
    currentBatch.delete(doc.ref);
    opCount++;
    deletedCount++;
    
    if (opCount >= batchSize) {
      batches.push(currentBatch);
      currentBatch = db.batch();
      opCount = 0;
    }
  });
  
  if (opCount > 0) {
    batches.push(currentBatch);
  }
  
  await Promise.all(batches.map(batch => batch.commit()));
  
  logger.info(`Cleared ${deletedCount} feedback items`);
  return { deletedCount };
};
