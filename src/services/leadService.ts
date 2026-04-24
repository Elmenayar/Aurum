import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Lead } from '../types';
import { handleFirestoreError } from './errorHandling';

const LEADS_COLLECTION = 'leads';

export const leadService = {
  async addLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      return await addDoc(collection(db, LEADS_COLLECTION), {
        ...lead,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'create', LEADS_COLLECTION);
    }
  },

  async updateLead(id: string, updates: Partial<Lead>) {
    try {
      const leadRef = doc(db, LEADS_COLLECTION, id);
      return await updateDoc(leadRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `${LEADS_COLLECTION}/${id}`);
    }
  },

  subscribeToBrokerLeads(brokerId: string, callback: (leads: Lead[]) => void) {
    const q = query(
      collection(db, LEADS_COLLECTION), 
      where('brokerId', '==', brokerId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, {
      next: (snapshot) => {
        const leads = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (doc.data().updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Lead));
        callback(leads);
      },
      error: (error) => {
        try {
          handleFirestoreError(error, 'list', LEADS_COLLECTION);
        } catch (e) {
          console.error("Leads subscription error:", e);
        }
      }
    });
  },

  subscribeToAllLeads(callback: (leads: Lead[]) => void) {
    const q = query(
      collection(db, LEADS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, {
      next: (snapshot) => {
        const leads = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (doc.data().updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Lead));
        callback(leads);
      },
      error: (error) => {
        try {
          handleFirestoreError(error, 'list', LEADS_COLLECTION);
        } catch (e) {
          console.error("All Leads subscription error:", e);
        }
      }
    });
  }
};
