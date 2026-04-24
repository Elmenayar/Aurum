import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// CRITICAL: Must use firestoreDatabaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection Test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'init'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Firebase is offline. Check your network or configuration.");
    }
  }
}
testConnection();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => auth.signOut();
