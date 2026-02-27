import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAITER';

export interface User {
  id: string;
  name: string;
  pin: string;
  role: UserRole;
}

interface AuthState {
  currentUser: User | null;
  users: User[];
  login: (pin: string) => boolean;
  logout: () => void;
  addUser: (user: User) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  updateUserPin: (id: string, newPin: string) => Promise<void>;
  
  // Real-time Sync
  setFirestoreUsers: (users: User[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [
        { id: 'master-admin', name: 'Super Admin', pin: '0000', role: 'ADMIN' },
      ],
      
      setFirestoreUsers: (syncedUsers) => {
        const masterAdmin: User = { id: 'master-admin', name: 'Super Admin', pin: '0000', role: 'ADMIN' };
        // Ensure master admin is ALWAYS present and filter out duplicates
        const filteredSynced = syncedUsers.filter(u => u.id !== 'master-admin');
        set({ users: [masterAdmin, ...filteredSynced] });
      },

      login: (pin) => {
        // Fail-safe: Always allow 0000 if not in list
        if (pin === '0000') {
          const masterAdmin: User = { id: 'master-admin', name: 'Super Admin', pin: '0000', role: 'ADMIN' };
          set({ currentUser: masterAdmin });
          return true;
        }

        const user = get().users.find((u) => u.pin === pin);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null }),

      addUser: async (user) => {
          await setDoc(doc(db, "users", user.id), user);
      },

      removeUser: async (id) => {
          await deleteDoc(doc(db, "users", id));
      },

      updateUserPin: async (id, newPin) => {
          await updateDoc(doc(db, "users", id), { pin: newPin });
      },
    }),
    { name: 'auth-storage' }
  )
);
