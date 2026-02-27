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
        { id: '1', name: 'Super Admin', pin: '0000', role: 'ADMIN' },
        { id: '2', name: 'Main Cashier', pin: '1234', role: 'CASHIER' },
      ],
      
      setFirestoreUsers: (users) => set({ users: users.length > 0 ? users : get().users }),

      login: (pin) => {
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
