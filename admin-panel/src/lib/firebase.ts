import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

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

// Connect to emulators in development
if (location.hostname === "localhost" && import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log("Connected to Firebase Emulators");
}
