"use client";

import { useEffect } from 'react';
import { onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';

export function SyncManager() {
  const { setFirestoreState } = useBusinessStore();
  const { setFirestoreUsers } = useAuthStore();

  useEffect(() => {
    // 1. Sync Products
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
        const prods = snap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any;
        setFirestoreState({ products: prods });
    });

    // 2. Sync Active Orders
    const unsubActive = onSnapshot(collection(db, "activeOrders"), (snap) => {
        const orders = snap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any;
        setFirestoreState({ activeOrders: orders });
    });

    // 3. Sync Completed Orders (Last 500)
    const qCompleted = query(collection(db, "completedOrders"), orderBy("timestamp", "desc"), limit(500));
    const unsubCompleted = onSnapshot(qCompleted, (snap) => {
        const orders = snap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any;
        setFirestoreState({ completedOrders: orders });
    });

    // 4. Sync Notifications
    const qNotifications = query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(50));
    const unsubNotifications = onSnapshot(qNotifications, (snap) => {
        const notifs = snap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any;
        setFirestoreState({ notifications: notifs });
    });

    // 5. Sync Audit (Last 100)
    const qAudit = query(collection(db, "auditTrail"), orderBy("timestamp", "desc"), limit(100));
    const unsubAudit = onSnapshot(qAudit, (snap) => {
        const audit = snap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any;
        setFirestoreState({ auditTrail: audit });
    });

    // 6. Sync Business Settings
    const unsubSettings = onSnapshot(collection(db, "settings"), (snap) => {
        if (!snap.empty) {
            const settings = snap.docs[0].data();
            setFirestoreState({ 
                businessName: settings.businessName, 
                currency: settings.currency, 
                taxRate: settings.taxRate 
            });
        }
    });

    // 7. Sync Staff/Users
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        const users = snap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any;
        setFirestoreUsers(users);
    });

    return () => {
        unsubProducts();
        unsubActive();
        unsubCompleted();
        unsubNotifications();
        unsubAudit();
        unsubSettings();
        unsubUsers();
    };
  }, []);

  return null; // Invisible component
}
