import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { collection, addDoc } from "@firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_COM_API_KEY,
    authDomain: import.meta.env.VITE_COM_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_COM_PROJECT_ID,
    storageBucket: import.meta.env.VITE_COM_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_COM_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_COM_APP_ID,
    measurementId: import.meta.env.VITE_COM_MEASUREMENT_ID
};

// Initialize with a unique name
const app = initializeApp(firebaseConfig, 'comments-app');
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, addDoc };