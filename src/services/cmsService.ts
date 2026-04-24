import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  getDocs,
  collection,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { handleFirestoreError } from './errorHandling';

export interface SiteContent {
  value: string;
  updatedBy: string;
  updatedAt: any;
}

const COLLECTION_NAME = 'site_content';

export const cmsService = {
  async getContent(key: string): Promise<string | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return (docSnap.data() as SiteContent).value;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, 'get', `${COLLECTION_NAME}/${key}`);
    }
  },

  async saveContent(key: string, value: string | null | undefined) {
    if (value === undefined) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, key);
      const user = auth.currentUser;
      return await setDoc(docRef, {
        value: value ?? '',
        updatedBy: user?.email || 'Admin',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `${COLLECTION_NAME}/${key}`);
    }
  },

  subscribeToContent(key: string, callback: (value: string | null) => void, onError?: (error: any) => void) {
    const docRef = doc(db, COLLECTION_NAME, key);
    return onSnapshot(docRef, {
      next: (docSnap) => {
        if (docSnap.exists()) {
          callback((docSnap.data() as SiteContent).value);
        } else {
          callback(null);
        }
      },
      error: (error) => {
        try {
          handleFirestoreError(error, 'get', `${COLLECTION_NAME}/${key}`);
        } catch (e) {
          console.error(`CMS Content Subscribe Error for key [${key}]:`, e);
          if (onError) onError(e);
        }
      }
    });
  },

  async getAllContent(): Promise<Record<string, string>> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const content: Record<string, string> = {};
      querySnapshot.forEach((doc) => {
        content[doc.id] = (doc.data() as SiteContent).value;
      });
      return content;
    } catch (error) {
      handleFirestoreError(error, 'list', COLLECTION_NAME);
    }
  },

  subscribeToAllContent(callback: (content: Record<string, string>) => void, onError?: (error: any) => void) {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(colRef, {
      next: (snapshot) => {
        const content: Record<string, string> = {};
        snapshot.forEach((doc) => {
          content[doc.id] = (doc.data() as SiteContent).value;
        });
        callback(content);
      },
      error: (error) => {
        try {
          handleFirestoreError(error, 'list', COLLECTION_NAME);
        } catch (e) {
          console.error("CMS All Content Subscribe Error:", e);
          if (onError) onError(e);
        }
      }
    });
  }
};
