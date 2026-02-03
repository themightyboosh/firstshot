import { db } from "../../lib/firebase";
import { ScoringResult } from "../cas-core/types";

export interface UserResponse {
  id?: string;
  userId?: string;
  sessionId?: string;
  answers: Record<string, any>;
  result: ScoringResult;
  timestamp: string;
}

const COLLECTION_NAME = "user_responses";

export const submitResponse = async (data: any): Promise<UserResponse> => {
  const response: UserResponse = {
    userId: data.userId || 'anonymous',
    sessionId: data.sessionId,
    answers: data.answers,
    result: data.result,
    timestamp: new Date().toISOString()
  };

  const docRef = await db.collection(COLLECTION_NAME).add(response);
  return { id: docRef.id, ...response };
};

export const getResponses = async (limit = 100): Promise<UserResponse[]> => {
  const snapshot = await db.collection(COLLECTION_NAME)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserResponse));
};

export const clearResponses = async (): Promise<{ deletedCount: number }> => {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  
  if (snapshot.empty) {
    return { deletedCount: 0 };
  }

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
  return { deletedCount };
};
