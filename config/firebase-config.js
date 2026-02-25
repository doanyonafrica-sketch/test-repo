// firebase-config.js
// ⚠️ Ce fichier ne contient AUCUNE clé sensible
// Les valeurs sont injectées par Vite au moment du build depuis Vercel

export const firebaseConfig = {
    apiKey: __FIREBASE_API_KEY__,
    authDomain: __FIREBASE_AUTH_DOMAIN__,
    projectId: __FIREBASE_PROJECT_ID__,
    storageBucket: __FIREBASE_STORAGE_BUCKET__,
    messagingSenderId: __FIREBASE_MESSAGING_SENDER_ID__,
    appId: __FIREBASE_APP_ID__
};