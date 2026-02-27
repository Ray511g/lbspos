import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, addDoc, query, orderBy, limit } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCUHdE8rBLlq5XWngPyUZ-KHut1oWHTcU",
  authDomain: "barpos-2d71d.firebaseapp.com",
  projectId: "barpos-2d71d",
  storageBucket: "barpos-2d71d.firebasestorage.app",
  messagingSenderId: "608502673189",
  appId: "1:608502673189:web:f110c0aeec19daea40b4cc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Collection References for easy access throughout the app
export const collections = {
    products: collection(db, "products"),
    activeOrders: collection(db, "activeOrders"),
    completedOrders: collection(db, "completedOrders"),
    notifications: collection(db, "notifications"),
    auditTrail: collection(db, "auditTrail"),
    settings: collection(db, "settings"),
    users: collection(db, "users")
};
