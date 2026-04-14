import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let auth: Auth;

if (!getApps().length) {
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
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

export { auth };
export default app;
