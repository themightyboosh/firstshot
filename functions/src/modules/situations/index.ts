import * as admin from "firebase-admin";

export interface Situation {
  id?: string;
  name: string;
  squarePngUrl: string;
  shortDescription: string;
  longDescription: string;
  promptFragment: string;
}

const COLLECTION_NAME = "situations";

// Get shared Firestore instance
const getDb = () => admin.firestore();

// Validation helper
export function validateSituation(data: unknown): asserts data is Omit<Situation, 'id'> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid situation data: expected an object');
  }

  const situation = data as Record<string, unknown>;

  if (typeof situation.name !== 'string' || !situation.name.trim()) {
    throw new Error('Situation name is required and must be a non-empty string');
  }

  if (typeof situation.shortDescription !== 'string' || !situation.shortDescription.trim()) {
    throw new Error('Short description is required and must be a non-empty string');
  }

  if (typeof situation.longDescription !== 'string' || !situation.longDescription.trim()) {
    throw new Error('Long description is required and must be a non-empty string');
  }

  if (typeof situation.promptFragment !== 'string' || !situation.promptFragment.trim()) {
    throw new Error('Prompt fragment is required and must be a non-empty string');
  }

  // squarePngUrl is optional but must be a string if provided
  if (situation.squarePngUrl !== undefined && typeof situation.squarePngUrl !== 'string') {
    throw new Error('Image URL must be a string');
  }

  // Sanitize string lengths to prevent abuse
  if (situation.name.length > 200) {
    throw new Error('Name must be 200 characters or less');
  }
  if (situation.shortDescription.length > 500) {
    throw new Error('Short description must be 500 characters or less');
  }
  if (situation.longDescription.length > 5000) {
    throw new Error('Long description must be 5000 characters or less');
  }
  if (situation.promptFragment.length > 2000) {
    throw new Error('Prompt fragment must be 2000 characters or less');
  }
  if (situation.squarePngUrl && (situation.squarePngUrl as string).length > 2000) {
    throw new Error('Image URL must be 2000 characters or less');
  }
}

export const createSituation = async (data: unknown): Promise<Situation> => {
  validateSituation(data);
  
  const db = getDb();
  const situationData: Omit<Situation, 'id'> = {
    name: (data as Situation).name.trim(),
    shortDescription: (data as Situation).shortDescription.trim(),
    longDescription: (data as Situation).longDescription.trim(),
    promptFragment: (data as Situation).promptFragment.trim(),
    squarePngUrl: ((data as Situation).squarePngUrl || '').trim(),
  };
  
  const docRef = await db.collection(COLLECTION_NAME).add(situationData);
  return { id: docRef.id, ...situationData };
};

export const updateSituation = async (id: string, data: Partial<Situation>): Promise<void> => {
  if (!id || typeof id !== 'string') {
    throw new Error('Valid situation ID is required');
  }

  // Validate fields that are being updated
  const updateData: Partial<Omit<Situation, 'id'>> = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      throw new Error('Name must be a non-empty string');
    }
    if (data.name.length > 200) {
      throw new Error('Name must be 200 characters or less');
    }
    updateData.name = data.name.trim();
  }

  if (data.shortDescription !== undefined) {
    if (typeof data.shortDescription !== 'string' || !data.shortDescription.trim()) {
      throw new Error('Short description must be a non-empty string');
    }
    if (data.shortDescription.length > 500) {
      throw new Error('Short description must be 500 characters or less');
    }
    updateData.shortDescription = data.shortDescription.trim();
  }

  if (data.longDescription !== undefined) {
    if (typeof data.longDescription !== 'string' || !data.longDescription.trim()) {
      throw new Error('Long description must be a non-empty string');
    }
    if (data.longDescription.length > 5000) {
      throw new Error('Long description must be 5000 characters or less');
    }
    updateData.longDescription = data.longDescription.trim();
  }

  if (data.promptFragment !== undefined) {
    if (typeof data.promptFragment !== 'string' || !data.promptFragment.trim()) {
      throw new Error('Prompt fragment must be a non-empty string');
    }
    if (data.promptFragment.length > 2000) {
      throw new Error('Prompt fragment must be 2000 characters or less');
    }
    updateData.promptFragment = data.promptFragment.trim();
  }

  if (data.squarePngUrl !== undefined) {
    if (typeof data.squarePngUrl !== 'string') {
      throw new Error('Image URL must be a string');
    }
    if (data.squarePngUrl.length > 2000) {
      throw new Error('Image URL must be 2000 characters or less');
    }
    updateData.squarePngUrl = data.squarePngUrl.trim();
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update');
  }

  const db = getDb();
  await db.collection(COLLECTION_NAME).doc(id).update(updateData);
};

export const deleteSituation = async (id: string): Promise<void> => {
  if (!id || typeof id !== 'string') {
    throw new Error('Valid situation ID is required');
  }
  
  const db = getDb();
  await db.collection(COLLECTION_NAME).doc(id).delete();
};

export const getSituations = async (): Promise<Situation[]> => {
  const db = getDb();
  const snapshot = await db.collection(COLLECTION_NAME).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Situation));
};
