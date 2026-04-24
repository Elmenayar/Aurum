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
import { Project } from '../types';
import { handleFirestoreError } from './errorHandling';

const COLLECTION_NAME = 'projects';

export const projectService = {
  subscribeToProjects(callback: (projects: Project[]) => void, onError?: (error: any) => void) {
    // Ordering by createdAt since 'id' field is removed before saving to Firestore
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      callback(projects);
    }, (error) => {
      console.error("Projects Subscribe Error:", error);
      handleFirestoreError(error, 'list', COLLECTION_NAME);
      if (onError) onError(error);
    });
  },

  async addProject(project: Omit<Project, 'id'>) {
    try {
      return await addDoc(collection(db, COLLECTION_NAME), {
        ...project,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'create', COLLECTION_NAME);
    }
  },

  async updateProject(id: string, data: Partial<Project>) {
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

  async deleteProject(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      return await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, 'delete', COLLECTION_NAME);
    }
  }
};
