import * as functions from "firebase-functions";
import { defaultConfig } from "./modules/cas-core/defaults/default-config";
import { validateConfig } from "./modules/cas-core/utils/validator";
import { CASConfiguration } from "./modules/cas-core/types";
import { calculateTerrainScore as calculateTerrainScoreUtil } from "./modules/cas-core/utils/scoring";
import * as situations from "./modules/situations";
import * as affects from "./modules/affects";
import * as cms from "./modules/cms";
import * as imageGeneration from "./modules/image-generation";
import * as gemini from "./modules/gemini";
import * as users from "./modules/users";
import * as usage from "./modules/usage";
import * as feedback from "./modules/feedback";
import * as responses from "./modules/responses";
import { logger } from "./lib/logger";
import { db } from "./lib/firebase";

// --- CORS & Request Helpers ---

const allowedOrigins = new Set([
  "https://realness-score.web.app",
  "https://realness-score-admin.web.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
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
      logger.info("Seeding default CAS configuration...");
      await docRef.set(defaultConfig);
      res.json({ message: "Seeded default configuration." });
    } else {
      res.json({ message: "Configuration already exists." });
    }
  } catch (error) {
    logger.error("Error seeding config:", error);
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
    logger.error("Error getting config:", error);
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
    logger.error("Error updating config:", error);
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
    logger.error("Error calculating score:", error);
    res.status(500).json({ message: "Error calculating score" });
  }
});

// --- Affects Functions ---

export const getAffects = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["GET"])) return;
  
  try {
    const list = await affects.getAffects();
    res.json(list);
  } catch (error) {
    logger.error("Error getting affects:", error);
    res.status(500).json({ message: "Error retrieving affects" });
  }
});

export const updateAffect = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST", "PUT"])) return;
  
  try {
    const { id, ...data } = req.body || {};
    if (!id) {
      res.status(400).json({ message: "Missing ID" });
      return;
    }
    await affects.updateAffect(id, data);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error updating affect:", error);
    res.status(500).json({ message: "Error updating affect" });
  }
});

export const resetAffects = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    await affects.initAffects(true);
    res.json({ success: true, message: "Affects reset to defaults" });
  } catch (error) {
    logger.error("Error resetting affects:", error);
    res.status(500).json({ message: "Error resetting affects" });
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
    logger.error("Error creating situation:", error);
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
    logger.error("Error updating situation:", error);
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
    logger.error("Error deleting situation:", error);
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
    logger.error("Error getting situations:", error);
    res.status(500).json({ message: "Error retrieving situations" });
  }
});

// --- Users Functions ---

export const getUsers = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  // TODO: Add auth check here (only admins can list users)
  
  try {
    const result = await users.getUsers();
    res.json(result);
  } catch (error) {
    logger.error("Error getting users:", error);
    res.status(500).json({ message: "Error retrieving users" });
  }
});

export const createUser = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const { email, password, role, displayName, generateInviteLink } = req.body || {};
    if (!email || (!password && !generateInviteLink)) {
      res.status(400).json({ message: "Email is required. Provide password or select generate invite link." });
      return;
    }
    
    const result = await users.createUser({ email, password, role, displayName, generateInviteLink });
    res.json({ success: true, user: result, inviteLink: result.inviteLink });
  } catch (error: any) {
    logger.error("Error creating user:", error);
    res.status(400).json({ message: error.message });
  }
});

export const generateUserResetLink = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const { uid } = req.body || {};
    if (!uid) {
      res.status(400).json({ message: "UID is required" });
      return;
    }
    const link = await users.generateResetLink(uid);
    res.json({ success: true, link });
  } catch (error) {
    logger.error("Error generating reset link:", error);
    res.status(500).json({ message: "Error generating reset link" });
  }
});

export const updateUserRole = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST", "PUT"])) return;
  
  try {
    const { uid, role } = req.body || {};
    if (!uid || !role) {
      res.status(400).json({ message: "UID and role are required" });
      return;
    }
    
    await users.updateUserRole(uid, role);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error updating user role:", error);
    res.status(500).json({ message: "Error updating user role" });
  }
});

export const deleteUser = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST", "DELETE"])) return;
  
  try {
    const { uid } = req.body || {};
    if (!uid) {
      res.status(400).json({ message: "UID is required" });
      return;
    }
    
    await users.deleteUser(uid);
    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// --- Response Functions ---

export const submitUserResponse = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const { answers } = req.body;
    
    // Fetch Config to score against
    const doc = await db.collection("cas_config").doc("main").get();
    const config = doc.data() as CASConfiguration;
    
    // Calculate Result
    const result = calculateTerrainScoreUtil(answers, config);
    
    // Save Response with Result
    const responseData = { ...req.body, result };
    const savedResponse = await responses.submitResponse(responseData);
    
    res.json({ success: true, response: savedResponse });
  } catch (error: any) {
    logger.error("Error submitting response:", error);
    res.status(400).json({ message: error.message });
  }
});

export const getUserResponses = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["GET"])) return;
  
  try {
    const list = await responses.getResponses();
    res.json(list);
  } catch (error) {
    logger.error("Error getting responses:", error);
    res.status(500).json({ message: "Error retrieving responses" });
  }
});

export const clearResponses = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST", "DELETE"])) return;

  try {
    const result = await responses.clearResponses();
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error("Error clearing responses:", error);
    res.status(500).json({ message: "Error clearing responses" });
  }
});

// --- Feedback Functions ---

export const submitFeedback = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    // Use queue-based processing for fast response
    const result = await feedback.queueFeedback(req.body);
    res.json({ success: true, ...result });
  } catch (error: any) {
    logger.error("Error submitting feedback:", error);
    res.status(400).json({ message: error.message });
  }
});

export const getFeedback = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["GET"])) return;
  
  try {
    const list = await feedback.getFeedback();
    res.json(list);
  } catch (error) {
    logger.error("Error getting feedback:", error);
    res.status(500).json({ message: "Error retrieving feedback" });
  }
});

export const clearFeedback = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST", "DELETE"])) return;
  
  try {
    const result = await feedback.clearFeedback();
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error("Error clearing feedback:", error);
    res.status(500).json({ message: "Error clearing feedback" });
  }
});

// Process feedback job (called by BullMQ worker)
export const processFeedbackJob = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const result = await feedback.processFeedbackJob(req.body);
    res.json({ success: true, feedback: result });
  } catch (error: any) {
    logger.error("Error processing feedback job:", error);
    res.status(500).json({ message: error.message });
  }
});

// --- Usage/Billing Functions ---

export const getUsageStats = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  
  try {
    const stats = await usage.getUsageStats();
    res.json(stats);
  } catch (error) {
    logger.error("Error getting usage stats:", error);
    res.status(500).json({ message: "Error retrieving usage stats" });
  }
});

export const getUserUsageStats = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  
  try {
    const uid = req.query.uid as string;
    if (!uid) {
      res.status(400).json({ message: "UID is required" });
      return;
    }
    const stats = await usage.getUserUsageStats(uid);
    res.json(stats);
  } catch (error) {
    logger.error("Error getting user usage:", error);
    res.status(500).json({ message: "Error retrieving user usage" });
  }
});

// --- Gemini Functions ---

export const debugGeminiConnection = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  
  try {
    const text = await gemini.generateContent("Hello, are you working?");
    res.json({ success: true, text });
  } catch (error) {
    logger.error("Debug Gemini failed:", error);
    res.status(500).json({ 
      message: "Debug failed", 
      error: error instanceof Error ? error.message : "Unknown",
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

export const runGeminiPrompt = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const { prompt } = req.body || {};
    if (!prompt) {
      res.status(400).json({ message: "Missing prompt" });
      return;
    }
    
    const text = await gemini.generateContent(prompt);
    logger.info("Gemini generation successful");
    res.json({ success: true, text });
  } catch (error) {
    logger.error("Error running Gemini:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message });
  }
});

// --- CMS Functions ---

export const getCMSItems = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["GET"])) return;
  
  try {
    const list = await cms.getCMSItems();
    res.json(list);
  } catch (error) {
    logger.error("Error getting CMS items:", error);
    res.status(500).json({ message: "Error retrieving CMS items" });
  }
});

export const createCMSItem = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const created = await cms.createCMSItem(req.body);
    res.json(created);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error creating CMS item:", error);
    res.status(400).json({ message });
  }
});

export const updateCMSItem = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST", "PUT"])) return;
  
  try {
    const { id, ...data } = req.body || {};
    if (!id) {
      res.status(400).json({ message: "Missing ID" });
      return;
    }
    await cms.updateCMSItem(id, data);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error updating CMS item:", error);
    res.status(400).json({ message });
  }
});

export const deleteCMSItem = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST", "DELETE"])) return;
  
  try {
    const id = (req.body && req.body.id) || req.query.id;
    if (!id || typeof id !== "string") {
      res.status(400).json({ message: "Missing or invalid ID" });
      return;
    }
    await cms.deleteCMSItem(id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error deleting CMS item:", error);
    res.status(400).json({ message });
  }
});

// --- Image Generation Functions ---

// Queue an image generation job (uses BullMQ if REDIS_URL is set)
export const generateArchetypeImage = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const { archetypeId, archetypeName, situationId, situationName, cmsId, cmsName, prompt } = req.body || {};
    
    if ((!archetypeId && !situationId && !cmsId) || !prompt) {
      res.status(400).json({ message: "Missing ID (archetypeId or situationId or cmsId) or prompt" });
      return;
    }
    
    // Check if the request is for clearing the queue
    if (prompt === 'CLEAR_QUEUE_COMMAND') {
      const deleted = await imageGeneration.clearQueue();
      res.json({ message: `Queue cleared. ${deleted} jobs removed.` });
      return;
    }
    
    const result = await imageGeneration.createImageJob({
      archetypeId,
      archetypeName: archetypeName || "Unknown",
      situationId,
      situationName: situationName || "Unknown",
      cmsId,
      cmsName: cmsName || "Unknown",
      prompt,
    });
    
    res.json(result);
  } catch (error) {
    logger.error("Error creating image job:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message });
  }
});

// Clear Queue Function (Exposed via special prompt or separate endpoint)
// I'll make a separate endpoint for clarity and security if needed, but reusing is easier for now.
// Actually, let's export a separate function.

export const clearImageJobQueue = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const deleted = await imageGeneration.clearQueue();
    res.json({ success: true, count: deleted });
  } catch (error) {
    logger.error("Error clearing queue:", error);
    res.status(500).json({ message: "Failed to clear queue" });
  }
});

// Get job status
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
    logger.error("Error getting job status:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message });
  }
});

// Process a specific job (called by BullMQ worker or Cloud Tasks)
export const processImageJob = functions
  .runWith({ timeoutSeconds: 540, memory: "2GB" }) // 9 min timeout, 2GB RAM
  .https.onRequest(async (req, res) => {
    if (applyCors(req, res)) return;
    if (!requireMethod(req, res, ["POST"])) return;
    
    try {
      const { jobId } = req.body || {};
      
      if (!jobId) {
        res.status(400).json({ message: "Missing jobId" });
        return;
      }
      
      const result = await imageGeneration.processJobDirectly(jobId);
      res.json(result);
    } catch (error) {
      logger.error("Error processing image job:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message });
    }
  });

// Scheduled cleanup of old jobs (runs daily)
export const cleanupImageJobs = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const deleted = await imageGeneration.cleanupOldJobs(48);
    logger.info(`Cleaned up ${deleted} old image generation jobs`);
    return null;
  });

// Temporary function to update prompt schema (can be removed after use)
export const updatePromptSchema = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;
  
  try {
    const IMPROVED_OUTPUT_FORMAT_SECTION = `#OUTPUT FORMAT#

You MUST return valid JSON only. No markdown code blocks, no markdown formatting, no explanatory text before or after the JSON.

The response must be an array containing a single object with exactly these three keys:
- "What to Say" (maximum 500 characters)
- "What to Do" (maximum 500 characters)  
- "What Next" (maximum 300 characters)

Example format:
[
  {
    "What to Say": "Your exact words to say...",
    "What to Do": "Specific actions to take...",
    "What Next": "Next steps to consider..."
  }
]

CRITICAL: Return ONLY the JSON array. No markdown, no code blocks, no additional text.`;

    const docRef = db.collection('global_settings').doc('main');
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).json({ message: 'global_settings/main document does not exist' });
      return;
    }

    const data = doc.data();
    if (!data) {
      res.status(404).json({ message: 'global_settings/main document has no data' });
      return;
    }

    const currentMasterPrompt = data.masterPrompt || '';
    logger.info(`Current masterPrompt length: ${currentMasterPrompt.length} characters`);

    // Find and replace the #OUTPUT FORMAT# section
    const outputFormatRegex = /#OUTPUT\s+FORMAT#[\s\S]*?(?=#|$)/i;
    
    let updatedMasterPrompt: string;
    
    if (outputFormatRegex.test(currentMasterPrompt)) {
      updatedMasterPrompt = currentMasterPrompt.replace(
        outputFormatRegex,
        IMPROVED_OUTPUT_FORMAT_SECTION
      );
      logger.info('Found existing #OUTPUT FORMAT# section, replacing it...');
    } else {
      updatedMasterPrompt = currentMasterPrompt + '\n\n' + IMPROVED_OUTPUT_FORMAT_SECTION;
      logger.info('No existing #OUTPUT FORMAT# section found, appending new section...');
    }

    await docRef.update({
      masterPrompt: updatedMasterPrompt,
      updatedAt: new Date().toISOString()
    });

    logger.info('Successfully updated masterPrompt in global_settings/main');
    res.json({ 
      success: true, 
      message: 'Updated masterPrompt successfully',
      newLength: updatedMasterPrompt.length
    });
  } catch (error) {
    logger.error('Error updating prompt schema:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message });
  }
});

// One-time update to add descriptions to archetypes
export const updateArchetypeDescriptions = functions.https.onRequest(async (req, res) => {
  if (applyCors(req, res)) return;
  if (!requireMethod(req, res, ["POST"])) return;

  const archetypeDescriptions: Record<string, string> = {
    "grounded_navigator": "You are someone who stays oriented when things get emotional. When connection intensifies or distance appears, you do not immediately panic or shut down. Feelings move through you without fully taking over. You can stay connected to yourself and to others at the same time. You are able to feel discomfort without assuming something is wrong. You can experience closeness without losing yourself, and you can tolerate space without imagining abandonment.\n\nYour steadiness comes from flexibility. You do not rely on one strategy to stay safe. You allow emotion, but you do not let it run the whole system. You trust that tension can be worked through, and that repair is possible.\n\nUnder stress, though, you may quietly take on more than you admit. You might delay asking for support because you assume you can handle it. You can look composed while carrying more weight than you need to. You resist extremes — panic, collapse, chaos — because they feel unnecessary. Your strength is range. You function best when you can stay balanced, responsive, and open without losing your center.",
    "emotional_enthusiast": "You are someone who moves toward connection quickly and fully. When something feels off, you notice it immediately. When someone pulls away, you feel the gap in your body. Your emotions are alive and present, and you do not pretend you do not care. When connection matters, you lean in.\n\nYour system is built to protect closeness. You track shifts in tone, distance, and warmth with precision. You believe that relationships are worth tending in real time. You want repair now, not later. Your caring is not weakness — it is your strength. People often feel deeply valued around you.\n\nUnder stress, urgency can take over. You may over-check, over-interpret, or seek reassurance in ways that leave you feeling exposed. If repair is slow, your system can treat it like danger. Emotional distance feels threatening, even if nothing catastrophic is happening.\n\nWhat feels least like you is detachment. Pulling back, acting indifferent, or going quiet feels wrong or even cruel. You are wired for connection, and you feel most yourself when bonds are warm, alive, and responsive.",
    "passionate_pilgrim": "You are someone who keeps caring even when caring has cost you. You can hold longing without collapsing. You stay emotionally attached over time, even when closeness is uncertain. Hope and ache often live side by side in you. Your emotional world has depth and gravity.\n\nYou protect meaning. You do not reduce connection to a quick transaction. You preserve it internally — through memory, devotion, and endurance. You can carry love quietly and faithfully. You do not abandon what matters simply because it is complicated or slow to arrive.\n\nUnder stress, though, you may find yourself living in waiting. Joy can feel fragile. Present satisfaction may be hard to trust. You might accept too little for too long, holding onto the idea of what could be. Over time, the ache can start to feel like identity.\n\nWhat feels most foreign to you is shallow ease. Quick fixes, surface reassurance, or \"just move on\" energy can feel invalidating. You value emotional depth. You feel most yourself when connection has weight, meaning, and devotion.",
    "heartfelt_defender": "You are someone who shows care through action. When something destabilizes, you become competent and useful. You move toward the problem. You manage emotion. You organize, protect, and stabilize. You often carry the load so others do not have to.\n\nYour system learned that reliability creates safety. You keep relationships functioning. You are steady in chaos. People lean on you when things get messy because you know how to hold structure.\n\nUnder stress, though, you may over-function. You can perform strength while feeling alone inside it. You may manage everyone else's feelings and neglect your own. Shame can creep in as the belief that you must stay \"on\" to deserve care. Raw need can feel unsafe or irresponsible.\n\nDepending fully or falling apart feels least like you. You resist vulnerability that could leave you exposed. You feel most secure when you are strong, capable, and holding things together — even if part of you quietly longs to be held instead.",
    "lone_wolf": "You are someone who pulls inward when intensity rises. Distance gives you control. You process privately and often feel safest when you are not emotionally exposed. Even when something affects you, you can remain composed and functional.\n\nYour system protects autonomy. You reduce overwhelm by limiting dependency. You are steady under pressure, capable in crisis, and rarely swept up in relational chaos. Independence feels clean and manageable.\n\nUnder stress, distance can become disconnection. You may downplay your needs or delay repair. Silence can feel easier than vulnerability. Over time, loneliness can grow quietly because your system treats needing as risk.\n\nWhat feels most unlike you is emotional pursuit. Repeated reaching, insistence on closeness, or overt reassurance-seeking can feel destabilizing. You feel most secure when you can maintain your space and regulate internally without being pulled into intensity.",
    "independent_icon": "You are someone who presents as self-contained. Autonomy, competence, and composure matter to you. Even when something is important, you may appear unaffected. You prefer strength to exposure.\n\nYour system protects pride and self-definition. You maintain control by not showing too much. You often succeed, lead, and move forward without asking for much. Safety feels like standing on your own terms.\n\nUnder stress, the gap between what you feel and what you show can widen. You may dismiss needs or turn vulnerability into performance. You can feel unseen while also staying hidden. Resentment can build when others want more closeness than you can tolerate.\n\nWhat feels most foreign is visible dependency. Needing openly or admitting uncertainty can feel humiliating. You feel most secure when you remain composed, capable, and emotionally contained.",
    "chill_conductor": "You are someone who regulates through calm. When intensity rises, you smooth it. You stay thoughtful, organized, and measured. You can understand complex emotions without spiraling. People often experience you as steady and reasonable.\n\nYour system protects coherence. You prevent overwhelm by analyzing, reframing, and staying composed. You are good at de-escalation and problem-solving. You keep the system from tipping into chaos.\n\nUnder stress, composure can become distance from feeling. You may move quickly into logic or restraint and miss what your body is asking for. Others may feel you are present but not fully reachable.\n\nWhat feels most unlike you is unfiltered intensity. Big emotional displays or messy need can feel unsafe. You feel most secure when things remain clear, organized, and under control.",
    "mystery_mosaic": "You are someone whose system shifts quickly. You can feel drawn toward closeness and then suddenly need distance. Relief can appear and disappear fast. Your internal world is layered and moving.\n\nYour system protects you by keeping multiple strategies available. You learned early that no single approach was fully reliable. Switching helps you avoid overwhelm or exposure when safety feels uncertain.\n\nUnder stress, the shifts can speed up. You may feel confused about which feeling to trust. Calm can feel unfamiliar. Closeness can be both deeply wanted and deeply unsettling.\n\nWhat feels least like you is steady ease. Sustained safety can trigger suspicion. You do not interrupt calm because you want chaos. You interrupt it because calm has not always felt safe to trust."
  };

  try {
    const docRef = db.collection("cas_config").doc("main");
    const doc = await docRef.get();
    
    if (!doc.exists) {
      res.status(404).json({ message: "CAS config not found" });
      return;
    }

    const config = doc.data() as CASConfiguration;
    
    // Update each archetype with its description
    const updatedArchetypes = config.archetypes.map(archetype => ({
      ...archetype,
      description: archetypeDescriptions[archetype.id] || archetype.description || ""
    }));

    await docRef.update({
      archetypes: updatedArchetypes
    });

    logger.info(`Updated descriptions for ${updatedArchetypes.length} archetypes`);
    res.json({ 
      success: true, 
      message: `Updated ${updatedArchetypes.length} archetype descriptions`,
      archetypes: updatedArchetypes.map(a => ({ id: a.id, name: a.name, hasDescription: !!a.description }))
    });
  } catch (error) {
    logger.error("Error updating archetype descriptions:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message });
  }
});
