import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { configService } from './configService';
import { handleFirestoreError } from './errorHandling';

export interface ActivityLog {
  brokerId: string;
  brokerName: string;
  leadId: string;
  leadName: string;
  action: string;
  details: string;
  createdAt?: any;
}

export const notificationService = {
  async logAndNotify(activity: Omit<ActivityLog, 'createdAt'>) {
    try {
      // 1. Log to Firestore
      const logsRef = collection(db, 'activity_logs');
      await addDoc(logsRef, {
        ...activity,
        createdAt: serverTimestamp()
      }).catch(err => {
        handleFirestoreError(err, 'create', 'activity_logs');
      });

      // 2. Check if email notifications are enabled
      const config = await configService.getConfig();
      if (config.emailNotificationsEnabled) {
        // Since we are in a client app, we'll try to call our server endpoint
        // This will be implemented in server.ts
        await fetch('/api/notify-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adminEmail: config.adminEmail,
            activity: activity
          }),
        }).catch(err => console.error('Failed to send email notification:', err));
      }
    } catch (error) {
      console.error('Notification service error:', error);
      // Propagate the specific firestore error if it was a permission issue
      if (error instanceof Error && error.message.includes('authInfo')) {
        throw error;
      }
    }
  }
};
