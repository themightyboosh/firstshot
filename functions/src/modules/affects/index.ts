import { db } from "../../lib/firebase";
import { Affect } from "../cas-core/types";
import { defaultAffects } from "./defaults";

const COLLECTION_NAME = "affects";

export const initAffects = async (force = false): Promise<void> => {
  const batch = db.batch();
  
  for (const affect of defaultAffects) {
    const docRef = db.collection(COLLECTION_NAME).doc(affect.id);
    if (force) {
        batch.set(docRef, affect);
    } else {
        const doc = await docRef.get();
        if (!doc.exists) {
            batch.set(docRef, affect);
        }
    }
  }
  
  await batch.commit();
};

export const getAffects = async (): Promise<Affect[]> => {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  
  if (snapshot.empty) {
    await initAffects(true);
    return defaultAffects;
  }
  
  // Sort by name or some order? Default order is better (as defined in defaults).
  // I'll assume alphabetical or just return list.
  const affects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Affect));
  
  // Optional: sort to match default order
  const orderMap = new Map(defaultAffects.map((a, i) => [a.id, i]));
  return affects.sort((a, b) => {
      const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999;
      const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999;
      return idxA - idxB;
  });
};

export const updateAffect = async (id: string, data: Partial<Affect>): Promise<void> => {
  if (!id) throw new Error("ID required");
  
  const updateData: Partial<Affect> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.interactionGuidance !== undefined) updateData.interactionGuidance = data.interactionGuidance;
  if (data.iconUrl !== undefined) updateData.iconUrl = data.iconUrl;
  
  await db.collection(COLLECTION_NAME).doc(id).update(updateData);
};
