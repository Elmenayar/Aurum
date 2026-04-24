import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import { Broker, InteractionType, CommunicationLog } from '../types';
import { handleFirestoreError } from './errorHandling';

const BROKERS_COLLECTION = 'brokers';

export const brokerService = {
  // Register from website (Public)
  async registerBroker(data: Omit<Broker, 'id' | 'createdAt' | 'updatedAt' | 'source' | 'status'>) {
    try {
      return await addDoc(collection(db, BROKERS_COLLECTION), {
        ...data,
        source: 'website',
        status: 'New',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'create', BROKERS_COLLECTION);
    }
  },

  // Admin bulk import or manual add
  async addBroker(broker: Omit<Broker, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      return await addDoc(collection(db, BROKERS_COLLECTION), {
        ...broker,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'create', BROKERS_COLLECTION);
    }
  },

  async updateBroker(id: string, updates: Partial<Broker>) {
    try {
      const brokerRef = doc(db, BROKERS_COLLECTION, id);
      return await updateDoc(brokerRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `${BROKERS_COLLECTION}/${id}`);
    }
  },

  async recordCommunication(brokerId: string, type: InteractionType, performedBy: string) {
    try {
      const brokerRef = doc(db, BROKERS_COLLECTION, brokerId);
      const newLog: CommunicationLog = {
        id: Math.random().toString(36).substring(7),
        type,
        timestamp: new Date().toISOString(),
        performedBy
      };
      return await updateDoc(brokerRef, {
        logs: arrayUnion(newLog),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `${BROKERS_COLLECTION}/${brokerId}`);
    }
  },

  async deleteBroker(id: string) {
    try {
      const brokerRef = doc(db, BROKERS_COLLECTION, id);
      return await deleteDoc(brokerRef);
    } catch (error) {
      handleFirestoreError(error, 'delete', `${BROKERS_COLLECTION}/${id}`);
    }
  },

  // Real-time listener
  subscribeToBrokers(callback: (brokers: Broker[]) => void, onError?: (error: any) => void) {
    const q = query(collection(db, BROKERS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, {
      next: (snapshot) => {
        const brokers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Handle timestamps
          createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (doc.data().updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Broker));
        callback(brokers);
      },
      error: (error) => {
        try {
          handleFirestoreError(error, 'list', BROKERS_COLLECTION);
        } catch (e) {
          console.error("Brokers subscription error:", e);
          if (onError) onError(e);
        }
      }
    });
  }
};
