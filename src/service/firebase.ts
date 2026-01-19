import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBVl073Qu6-G1NlC40YfM_fZsjFo1qPeO8",
  authDomain: "pmftci360-ff82a.firebaseapp.com",
  projectId: "pmftci360-ff82a",

  // 🔴 FIXED: correct storage bucket
  storageBucket: "pmftci360-ff82a.firebasestorage.app",

  messagingSenderId: "286700206631",
  appId: "1:286700206631:web:75809c8b51b19467442c02",
  measurementId: "G-6EELG471HV",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// 🔴 FIXED: explicitly bind correct bucket
export const storage = getStorage(
  app,
  "gs://pmftci360-ff82a.firebasestorage.app",
);
