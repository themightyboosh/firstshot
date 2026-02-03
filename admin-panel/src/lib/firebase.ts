import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGmrIiMvmykwtTCvTs6yrxTlR3yiMfdyc",
  authDomain: "realness-score.firebaseapp.com",
  projectId: "realness-score",
  storageBucket: "realness-score.firebasestorage.app",
  messagingSenderId: "427953838028",
  appId: "1:427953838028:web:e5757f2aa3d8697335af69",
  measurementId: "G-86Q3LSV247"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');
export const storage = getStorage(app);
export const auth = getAuth(app);

// Only connect to emulators if explicitly enabled via env var
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

if (useEmulators && location.hostname === "localhost") {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectAuthEmulator(auth, "http://localhost:9099");
  console.log("Connected to Firebase Emulators");
} else {
  console.log("Connected to Production Firebase");
}
