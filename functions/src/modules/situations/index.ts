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

export const createSituation = async (data: Situation): Promise<Situation> => {
  const db = admin.firestore();
  const docRef = await db.collection(COLLECTION_NAME).add(data);
  return { id: docRef.id, ...data };
};

export const updateSituation = async (id: string, data: Partial<Situation>): Promise<void> => {
  const db = admin.firestore();
  await db.collection(COLLECTION_NAME).doc(id).update(data);
};

export const deleteSituation = async (id: string): Promise<void> => {
  const db = admin.firestore();
  await db.collection(COLLECTION_NAME).doc(id).delete();
};

export const getSituations = async (): Promise<Situation[]> => {
  const db = admin.firestore();
  const snapshot = await db.collection(COLLECTION_NAME).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Situation));
};
