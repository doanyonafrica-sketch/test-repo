const firebaseConfig = {
  apiKey: CONFIG.FIREBASE_API_KEY
,
  authDomain: CONFIG.FIREBASE_AUTH_DOMAIN,
  projectId: CONFIG.FIREBASE_PROJECT_ID,
  storageBucket: CONFIG.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: CONFIG.FIREBASE_MESSAGING_SENDER_ID,
  appId: CONFIG.FIREBASE_APP_ID
};

export const ENV = {
    isProduction: true,
    isDevelopment: false
};

export const devLog = (message, data = null) => {
    if (ENV.isDevelopment) {
        console.log(message, data);
    }
};