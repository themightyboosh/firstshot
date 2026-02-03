/**
 * Script to upload affect icons to Firebase Storage and update Firestore
 * 
 * Run with: node scripts/upload-affect-icons.js
 * 
 * Requires: GOOGLE_APPLICATION_CREDENTIALS environment variable
 * or run: gcloud auth application-default login
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (uses application default credentials)
admin.initializeApp({
  projectId: 'realness-score',
  storageBucket: 'realness-score.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Map icon filenames to affect IDs (from defaults.ts)
const iconToAffectIdMap = {
  'surprise.png': 'startled',     // Startled
  'joy.png': 'warmth',            // Warmth  
  'interest.png': 'curiosity',    // Curiosity
  'anger.png': 'frustration',     // Frustration
  'fear.png': 'fear',             // Fear
  'sadness.png': 'heaviness',     // Heaviness
  'disgust.png': 'revulsion',     // Revulsion
  'withdrawing.png': 'aversion',  // Aversion
  'dropping.png': 'shame'         // Shame
};

async function uploadAndLinkIcons() {
  const iconsDir = path.join(__dirname, '..', '..', 'icons');
  
  // Read all icon files
  const iconFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));
  
  console.log('Found icons:', iconFiles);
  console.log('');
  
  for (const iconFile of iconFiles) {
    const affectId = iconToAffectIdMap[iconFile];
    if (!affectId) {
      console.log(`No mapping for ${iconFile}, skipping`);
      continue;
    }
    
    console.log(`Uploading ${iconFile} for affect ID: ${affectId}`);
    
    // Upload to Firebase Storage
    const filePath = path.join(iconsDir, iconFile);
    const destination = `affect-icons/${affectId}_${iconFile}`;
    
    try {
      await bucket.upload(filePath, {
        destination,
        metadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000',
        }
      });
      
      // Make public and get URL
      const file = bucket.file(destination);
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
      
      // Update Firestore with the icon URL
      await db.collection('affects').doc(affectId).update({
        iconUrl: publicUrl
      });
      
      console.log(`  ✓ ${publicUrl}`);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }
  
  console.log('\nDone!');
  process.exit(0);
}

uploadAndLinkIcons().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
