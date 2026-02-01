import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { defaultConfig } from "./modules/cas-core/defaults/default-config";
import { validateConfig } from "./modules/cas-core/utils/validator";
import { CASConfiguration } from "./modules/cas-core/types";
import { calculateTerrainScore as calculateTerrainScoreUtil } from "./modules/cas-core/utils/scoring";
import * as situations from "./modules/situations";

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// --- CAS Functions ---

// Initialize CAS Config (Seed Data)
export const initCasConfig = functions.https.onCall(async (data, context) => {
  try {
    const docRef = db.collection("cas_config").doc("main");
    const doc = await docRef.get();

    if (!doc.exists || data.force === true) {
      functions.logger.info("Seeding default CAS configuration...");
      await docRef.set(defaultConfig);
      return { message: "Seeded default configuration." };
    } else {
      return { message: "Configuration already exists." };
    }
  } catch (error) {
    functions.logger.error("Error seeding config:", error);
    throw new functions.https.HttpsError("internal", "Error seeding config");
  }
});

export const getCasConfig = functions.https.onCall(async (data, context) => {
  const doc = await db.collection("cas_config").doc("main").get();
  if (!doc.exists) {
    return defaultConfig;
  }
  return doc.data();
});

export const updateCasConfig = functions.https.onCall(async (data: CASConfiguration, context) => {
  try {
    validateConfig(data);
    await db.collection("cas_config").doc("main").set(data);
    return { success: true };
  } catch (error: any) {
    throw new functions.https.HttpsError("invalid-argument", error.message);
  }
});

export const calculateTerrainScore = functions.https.onCall(async (data, context) => {
  const { answers } = data; // { q1: optionId, q2: optionId, ... }
  
  // Get current config
  const doc = await db.collection("cas_config").doc("main").get();
  const config = doc.exists ? doc.data() as CASConfiguration : defaultConfig;

  return calculateTerrainScoreUtil(answers, config);
});

// --- Situations Functions ---

export const createSituation = functions.https.onCall(async (data, context) => {
  return await situations.createSituation(data);
});

export const updateSituation = functions.https.onCall(async (data, context) => {
  const { id, ...updateData } = data;
  if (!id) throw new functions.https.HttpsError("invalid-argument", "Missing ID");
  await situations.updateSituation(id, updateData);
  return { success: true };
});

export const deleteSituation = functions.https.onCall(async (data, context) => {
  const { id } = data;
  if (!id) throw new functions.https.HttpsError("invalid-argument", "Missing ID");
  await situations.deleteSituation(id);
  return { success: true };
});

export const getSituations = functions.https.onCall(async (data, context) => {
  return await situations.getSituations();
});
