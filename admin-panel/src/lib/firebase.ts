import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  // TODO: Replace with your actual Firebase config from the console
  // For local development with emulators, these values don't matter much
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "realness-score",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (location.hostname === "localhost") {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log("Connected to Firebase Emulators");
}
