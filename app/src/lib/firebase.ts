import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

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
export const auth = getAuth(app);
export const storage = getStorage(app);
