// firebase-config.js - Configuration Firebase centralisée
// ⚠️ IMPORTANT: Ce fichier contient des clés sensibles
// Ne jamais commiter ce fichier avec de vraies clés en production
// Utiliser les variables d'environnement ou un gestionnaire de secrets

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCuFgzytJXD6jt4HUW9LVSD_VpGuFfcEAk",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "electroino-app.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "electroino-app",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "electroino-app.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "864058526638",
    appId: process.env.FIREBASE_APP_ID || "1:864058526638:web:17b821633c7cc99be1563f"
};

// Validation en développement
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔧 Mode développement Firebase détecté');
}

export { firebaseConfig };
