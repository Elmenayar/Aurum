import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError } from './errorHandling';

const INQUIRIES_COLLECTION = 'inquiries';

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  projectId?: string;
  projectName?: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: any;
}

export const inquiryService = {
  async submitInquiry(data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>) {
    try {
      const docRef = collection(db, INQUIRIES_COLLECTION);
      return await addDoc(docRef, {
        ...data,
        status: 'new',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'create', INQUIRIES_COLLECTION);
    }
  },

  subscribeToInquiries(callback: (inquiries: Inquiry[]) => void, onError?: (error: any) => void) {
    const q = query(
      collection(db, INQUIRIES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, {
      next: (snapshot) => {
        const inquiries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Inquiry[];
        callback(inquiries);
      },
      error: (error) => {
        try {
          handleFirestoreError(error, 'list', INQUIRIES_COLLECTION);
        } catch (e) {
          console.error("Inquiry Subscribe Error:", e);
          if (onError) onError(e);
        }
      }
    });
  },

  async updateInquiryStatus(id: string, status: Inquiry['status']) {
    try {
      const docRef = doc(db, INQUIRIES_COLLECTION, id);
      return await setDoc(docRef, { status }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, 'update', `${INQUIRIES_COLLECTION}/${id}`);
    }
  }
};
