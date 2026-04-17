import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App | undefined;
let auth: Auth | undefined;

// Only initialize Firebase Admin if we have the required environment variables
const hasFirebaseConfig = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
  (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

if (hasFirebaseConfig && !getApps().length) {
  try {
    // Initialize Firebase Admin with service account
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

    app = initializeApp({
      credential: cert(serviceAccount),
    });

    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase Admin initialization failed during build:', error);
  }
} else if (getApps().length > 0) {
  app = getApps()[0];
  auth = getAuth(app);
}

export { auth };
export default app;
