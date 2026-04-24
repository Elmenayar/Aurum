import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { StaffMember, Permission } from '../types';
import { handleFirestoreError } from './errorHandling';

const COLLECTION_NAME = 'admins';

export const staffService = {
  async addStaff(staff: StaffMember) {
    try {
      const docRef = doc(db, COLLECTION_NAME, staff.uid);
      await setDoc(docRef, {
        ...staff,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'create', COLLECTION_NAME);
    }
  },

  async updateStaff(uid: string, updates: Partial<StaffMember>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, uid);
      await setDoc(docRef, updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, 'update', `${COLLECTION_NAME}/${uid}`);
    }
  },

  async deleteStaff(uid: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, uid));
    } catch (error) {
      handleFirestoreError(error, 'delete', `${COLLECTION_NAME}/${uid}`);
    }
  },

  subscribeToStaff(callback: (staff: StaffMember[]) => void) {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(colRef, (snapshot) => {
      const staff = snapshot.docs.map(doc => doc.data() as StaffMember);
      callback(staff);
    });
  }
};
