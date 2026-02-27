import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, addDoc, query, orderBy, limit } from "firebase/firestore";

// To make this work in production, you MUST add your Firebase credentials to your Vercel Environment Variables:
// NEXT_PUBLIC_FIREBASE_API_KEY
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
// NEXT_PUBLIC_FIREBASE_PROJECT_ID
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
// NEXT_PUBLIC_FIREBASE_APP_ID

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Collection References
export const collections = {
    products: collection(db, "products"),
    activeOrders: collection(db, "activeOrders"),
    completedOrders: collection(db, "completedOrders"),
    notifications: collection(db, "notifications"),
    auditTrail: collection(db, "auditTrail"),
    settings: collection(db, "settings")
};
