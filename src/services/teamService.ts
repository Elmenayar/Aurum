import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { TeamMember } from '../types';
import { handleFirestoreError } from './errorHandling';

const COLLECTION_NAME = 'team';

export const teamService = {
  subscribeToTeam(callback: (members: TeamMember[]) => void, onError?: (error: any) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
      callback(members);
    }, (error) => {
      console.error("Team Subscribe Error:", error);
      handleFirestoreError(error, 'list', COLLECTION_NAME);
      if (onError) onError(error);
    });
  },

  async addMember(member: Omit<TeamMember, 'id'>) {
    try {
      return await addDoc(collection(db, COLLECTION_NAME), {
        ...member,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'create', COLLECTION_NAME);
    }
  },

  async updateMember(id: string, data: Partial<TeamMember>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      return await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'update', COLLECTION_NAME);
    }
  },

  async deleteMember(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      return await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, 'delete', COLLECTION_NAME);
    }
  }
};
