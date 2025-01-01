import { initializeApp } from "firebase/app";
import env from "./env";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: env.firebase.FIREBASE_API_KEY,
  authDomain: env.firebase.FIREBASE_AUTH_DOMAIN,
  projectId: env.firebase.FIREBASE_PROJECT_ID,
  storageBucket: env.firebase.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.firebase.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.firebase.FIREBASE_APP_ID,
  databaseURL: env.firebase.FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
