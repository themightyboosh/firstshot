/**
 * Script to update the #OUTPUT FORMAT# section in the masterPrompt
 * within global_settings/main document.
 * 
 * This script:
 * 1. Fetches the current global_settings document
 * 2. Locates the #OUTPUT FORMAT# section in masterPrompt
 * 3. Replaces it with improved instructions
 * 4. Saves the updated masterPrompt back to Firestore
 */

import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '../lib/logger';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'realness-score';
  admin.initializeApp({
    projectId: projectId,
  });
}

const db = getFirestore();

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

async function updatePromptSchema() {
  try {
    logger.info('Starting updatePromptSchema script...');

    // Fetch current global_settings
    const docRef = db.collection('global_settings').doc('main');
    const doc = await docRef.get();

    if (!doc.exists) {
      logger.error('global_settings/main document does not exist');
      process.exit(1);
    }

    const data = doc.data();
    if (!data) {
      logger.error('global_settings/main document has no data');
      process.exit(1);
    }

    const currentMasterPrompt = data.masterPrompt || '';
    logger.info(`Current masterPrompt length: ${currentMasterPrompt.length} characters`);

    // Find and replace the #OUTPUT FORMAT# section
    // Look for the section marker (case-insensitive, with optional variations)
    const outputFormatRegex = /#OUTPUT\s+FORMAT#[\s\S]*?(?=#|$)/i;
    
    let updatedMasterPrompt: string;
    
    if (outputFormatRegex.test(currentMasterPrompt)) {
      // Replace existing section
      updatedMasterPrompt = currentMasterPrompt.replace(
        outputFormatRegex,
        IMPROVED_OUTPUT_FORMAT_SECTION
      );
      logger.info('Found existing #OUTPUT FORMAT# section, replacing it...');
    } else {
      // Append new section if not found
      updatedMasterPrompt = currentMasterPrompt + '\n\n' + IMPROVED_OUTPUT_FORMAT_SECTION;
      logger.info('No existing #OUTPUT FORMAT# section found, appending new section...');
    }

    // Save updated masterPrompt back to Firestore
    await docRef.update({
      masterPrompt: updatedMasterPrompt,
      updatedAt: new Date().toISOString()
    });

    logger.info('Successfully updated masterPrompt in global_settings/main');
    logger.info(`Updated masterPrompt length: ${updatedMasterPrompt.length} characters`);
    
    console.log('\n✅ Update completed successfully!');
    console.log(`\nUpdated masterPrompt preview (first 500 chars):`);
    console.log(updatedMasterPrompt.substring(0, 500) + '...\n');

  } catch (error) {
    logger.error('Error updating prompt schema:', error);
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the script
updatePromptSchema()
  .then(() => {
    logger.info('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Script failed:', error);
    process.exit(1);
  });
