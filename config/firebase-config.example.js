// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "VOTRE_API_KEY",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "VOTRE_AUTH_DOMAIN",
    projectId: process.env.FIREBASE_PROJECT_ID || "VOTRE_PROJECT_ID",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "VOTRE_STORAGE_BUCKET",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "VOTRE_MESSAGING_SENDER_ID",
    appId: process.env.FIREBASE_APP_ID || "VOTRE_APP_ID"
};

if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔧 Mode développement Firebase détecté');
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export { firebaseConfig };
