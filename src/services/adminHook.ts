import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Permission } from '../types';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Hardcoded primary admin
        if (u.email === 'elmenayar123@gmail.com') {
          setIsAdmin(true);
          setIsSuperAdmin(true);
          setPermissions([
            'manage_brokers', 'manage_projects', 'manage_team', 
            'manage_content', 'manage_inquiries', 'manage_leads'
          ]);
          setLoading(false);
          return;
        }

        // Check firestore admins collection (which now stores staff/admins)
        try {
          const adminDoc = await getDoc(doc(db, 'admins', u.uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            setIsAdmin(true);
            setPermissions(data.permissions || []);
            setIsSuperAdmin(data.isSuperAdmin || false);
          } else {
            setIsAdmin(false);
            setPermissions([]);
            setIsSuperAdmin(false);
          }
        } catch (err) {
          console.error("Admin check failed:", err);
          setIsAdmin(false);
          setPermissions([]);
        }
      } else {
        setIsAdmin(false);
        setPermissions([]);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const hasPermission = (perm: Permission) => {
    return isSuperAdmin || permissions.includes(perm);
  };

  return { isAdmin, isSuperAdmin, permissions, hasPermission, loading, user };
}
