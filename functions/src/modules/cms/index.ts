import { db } from "../../lib/firebase";

export interface CMSItem {
  id: string; // name_id
  title: string;
  copy: string;
  imageUrl: string;
  imageDescription?: string;
  buttonText: string;
  buttonAction: string;
  description: string;
}

const COLLECTION_NAME = "cms_content";

export const getCMSItems = async (): Promise<CMSItem[]> => {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CMSItem));
};

export const createCMSItem = async (data: any): Promise<CMSItem> => {
  // Validate ID is snake_case
  const id = data.id;
  if (!id || !/^[a-z0-9_]+$/.test(id)) {
    throw new Error("ID must be non-empty snake_case (lowercase letters, numbers, underscores)");
  }
  
  // Check if exists
  const docRef = db.collection(COLLECTION_NAME).doc(id);
  const doc = await docRef.get();
  if (doc.exists) {
    throw new Error(`CMS Item with ID '${id}' already exists`);
  }
  
  const item: CMSItem = {
    id,
    title: data.title || "",
    copy: data.copy || "",
    imageUrl: data.imageUrl || "",
    buttonText: data.buttonText || "",
    buttonAction: data.buttonAction || "",
    description: data.description || "",
    imageDescription: data.imageDescription || ""
  };
  
  await docRef.set(item);
  return item;
};

export const updateCMSItem = async (id: string, data: Partial<CMSItem>): Promise<void> => {
  if (!id) throw new Error("ID required");
  await db.collection(COLLECTION_NAME).doc(id).update(data);
};

export const deleteCMSItem = async (id: string): Promise<void> => {
  if (!id) throw new Error("ID required");
  await db.collection(COLLECTION_NAME).doc(id).delete();
};
