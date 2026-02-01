import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { defaultConfig } from "./modules/cas-core/defaults/default-config";
import { validateConfig } from "./modules/cas-core/utils/validator";
import { CASConfiguration } from "./modules/cas-core/types";
import { calculateTerrainScore as calculateTerrainScoreUtil } from "./modules/cas-core/utils/scoring";
import * as situations from "./modules/situations";
import * as imageGeneration from "./modules/image-generation";

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// --- CORS & Request Helpers ---

const allowedOrigins = new Set([
  "https://realness-score.web.app",
  "http://localhost:5173"
]);

const applyCors = (req: functions.https.Request, res: functions.Response) => {
  const origin = req.get("origin");
  if (origin && allowedOrigins.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
};

// Helper to validate HTTP methods
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const requireMethod = (
  req: functions.https.Request,
  res: functions.Response,
  allowed: HttpMethod[]
): boolean => {
  if (!allowed.includes(req.method as HttpMethod)) {
    res.status(405).json({ 
      message: `Method ${req.method} not allowed. Use: ${allowed.join(", ")}` 
    });
    return false;
  }
  return true;
};

// --- CAS Functions ---

// Initialize CAS Config (Seed Data)
export const initCasConfig = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const docRef = db.collection("cas_config").doc("main");
    const doc = await docRef.get();
    const force = req.query.force === "true";

    if (!doc.exists || force) {
      functions.logger.info("Seeding default CAS configuration...");
      await docRef.set(defaultConfig);
      res.json({ message: "Seeded default configuration." });
    } else {
      res.json({ message: "Configuration already exists." });
    }
  } catch (error) {
    functions.logger.error("Error seeding config:", error);
    res.status(500).json({ message: "Error seeding config" });
  }
});

export const getCasConfig = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["GET"])) return;
  
  try {
    const doc = await db.collection("cas_config").doc("main").get();
    if (!doc.exists) {
      res.json(defaultConfig);
      return;
    }
    res.json(doc.data());
  } catch (error) {
    functions.logger.error("Error getting config:", error);
    res.status(500).json({ message: "Error retrieving config" });
  }
});

export const updateCasConfig = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST", "PUT"])) return;
  
  try {
    const data = req.body as CASConfiguration;
    validateConfig(data);
    await db.collection("cas_config").doc("main").set(data);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ message });
  }
});

export const calculateTerrainScore = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const answers = (req.body?.answers || {}) as Record<string, string>;
    const doc = await db.collection("cas_config").doc("main").get();
    const config = doc.exists ? (doc.data() as CASConfiguration) : defaultConfig;
    res.json(calculateTerrainScoreUtil(answers, config));
  } catch (error) {
    functions.logger.error("Error calculating score:", error);
    res.status(500).json({ message: "Error calculating score" });
  }
});

// --- Situations Functions ---

export const createSituation = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const created = await situations.createSituation(req.body);
    res.json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ message });
  }
});

export const updateSituation = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST", "PUT"])) return;
  
  try {
    const { id, ...updateData } = req.body || {};
    if (!id) {
      res.status(400).json({ message: "Missing ID" });
      return;
    }
    await situations.updateSituation(id, updateData);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ message });
  }
});

export const deleteSituation = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST", "DELETE"])) return;
  
  try {
    const id = (req.body && req.body.id) || req.query.id;
    if (!id || typeof id !== "string") {
      res.status(400).json({ message: "Missing or invalid ID" });
      return;
    }
    await situations.deleteSituation(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ message });
  }
});

export const getSituations = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["GET"])) return;
  
  try {
    const list = await situations.getSituations();
    res.json(list);
  } catch (error) {
    functions.logger.error("Error getting situations:", error);
    res.status(500).json({ message: "Error retrieving situations" });
  }
});

// --- Image Generation Functions ---

export const generateArchetypeImage = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const { archetypeId, archetypeName, prompt } = req.body || {};
    
    if (!archetypeId || !prompt) {
      res.status(400).json({ message: "Missing archetypeId or prompt" });
      return;
    }
    
    const result = await imageGeneration.createImageJob({
      archetypeId,
      archetypeName: archetypeName || "Unknown",
      prompt,
    });
    
    res.json(result);
  } catch (error) {
    functions.logger.error("Error creating image job:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message });
  }
});

export const getImageJobStatus = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["GET"])) return;
  
  try {
    const jobId = req.query.jobId as string;
    
    if (!jobId) {
      res.status(400).json({ message: "Missing jobId" });
      return;
    }
    
    const status = await imageGeneration.getJobStatus(jobId);
    res.json(status);
  } catch (error) {
    functions.logger.error("Error getting job status:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message });
  }
});

// Scheduled cleanup of old jobs (runs daily)
export const cleanupImageJobs = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const deleted = await imageGeneration.cleanupOldJobs(48);
    functions.logger.info(`Cleaned up ${deleted} old image generation jobs`);
    return null;
  });
