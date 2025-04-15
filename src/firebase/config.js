import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyC_ZyvwItEuxXXtfg4fmYwH8HClQIokcpg",
  authDomain: "crypt-webapp.firebaseapp.com",
  projectId: "crypt-webapp",
  storageBucket: "crypt-webapp.firebasestorage.app",
  messagingSenderId: "983439797957",
  appId: "1:983439797957:web:e4af071c4ba7a312d98aac",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);