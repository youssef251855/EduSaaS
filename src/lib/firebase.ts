import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
// Request YouTube upload scope
googleProvider.addScope('https://www.googleapis.com/auth/youtube.upload');
// Request YouTube readonly scope to fetch channel info
googleProvider.addScope('https://www.googleapis.com/auth/youtube.readonly');
// Force account selection to ensure fresh tokens
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

