
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";

const firebaseAdminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });

const admin = {
  messaging: () => getMessaging(firebaseAdminApp),
  firestore: () => getFirestore(firebaseAdminApp),
};

// Default export for existing API routes
export default admin;

// Named exports for other files
export const messaging = getMessaging(firebaseAdminApp);
export const adminDb = getFirestore(firebaseAdminApp);
