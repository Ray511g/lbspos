import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
  tax: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  taxTotal: number;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  taxTotal: 0,
  total: 0,

  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.id === product.id);
    let newItems;
    if (existing) {
      newItems = state.items.map(i => 
        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [...state.items, { ...product, quantity: 1 }];
    }
    
    const subtotal = newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const taxTotal = newItems.reduce((acc, i) => acc + (i.price * i.tax * i.quantity), 0);
    
    return {
      items: newItems,
      subtotal,
      taxTotal,
      total: subtotal + taxTotal
    };
  }),

  removeItem: (id) => set((state) => {
    const newItems = state.items.filter(i => i.id !== id);
    const subtotal = newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const taxTotal = newItems.reduce((acc, i) => acc + (i.price * i.tax * i.quantity), 0);
    return { items: newItems, subtotal, taxTotal, total: subtotal + taxTotal };
  }),

  updateQuantity: (id, delta) => set((state) => {
    const newItems = state.items.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    });
    const subtotal = newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const taxTotal = newItems.reduce((acc, i) => acc + (i.price * i.tax * i.quantity), 0);
    return { items: newItems, subtotal, taxTotal, total: subtotal + taxTotal };
  }),

  clearCart: () => set({ items: [], subtotal: 0, taxTotal: 0, total: 0 }),
}));
