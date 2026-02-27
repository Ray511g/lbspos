import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ADMIN' | 'CASHIER' | 'WAITER';

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
  addUser: (user: User) => void;
  removeUser: (id: string) => void;
  updateUserPin: (id: string, newPin: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [
        { id: '1', name: 'Super Admin', pin: '0000', role: 'ADMIN' },
        { id: '2', name: 'Main Cashier', pin: '1234', role: 'CASHIER' },
        { id: '3', name: 'Waiter John', pin: '1111', role: 'WAITER' },
        { id: '4', name: 'Waitress Mercy', pin: '2222', role: 'WAITER' },
      ],
      login: (pin: string) => {
        const user = get().users.find((u) => u.pin === pin);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },
      logout: () => set({ currentUser: null }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      removeUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
      updateUserPin: (id, newPin) => set((state) => ({
        users: state.users.map((u) => u.id === id ? { ...u, pin: newPin } : u)
      })),
    }),
    { name: 'auth-storage' }
  )
);
