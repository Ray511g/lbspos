import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BusinessType = 'LIQUOR_STORE' | 'BAR_RESTAURANT' | 'WHOLESALE';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  volume: string;
  type?: string;
}

export interface Order {
  id: string;
  waiterId: string;
  waiterName: string;
  items: any[];
  total: number;
  status: 'PENDING' | 'DISPATCHED' | 'PAID' | 'VOID';
  timestamp: string;
}

interface BusinessState {
  businessName: string;
  businessType: BusinessType;
  currency: string;
  taxRate: number;
  products: Product[];
  activeOrders: Order[];
  completedOrders: Order[];
  
  // Configuration Functions
  updateSettings: (settings: Partial<{ businessName: string; businessType: BusinessType; currency: string; taxRate: number }>) => void;
  
  // Product Management
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (productId: string, quantity: number) => void;
  
  // Order Management
  createOrder: (order: Order) => void;
  dispatchOrder: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  voidOrder: (orderId: string) => void;
  
  // Reporting & Stats
  getSalesByWaiter: () => Record<string, number>;
  getWaiterStats: (waiterId: string) => { settled: number; unsettled: number; total: number };
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      businessName: 'Kenya Liquor Master',
      businessType: 'LIQUOR_STORE',
      currency: 'KES',
      taxRate: 16,
      products: [
        { id: 'L1', name: 'Johnnie Walker Black 750ml', price: 4200, category: 'Whiskey', stock: 24, volume: '750ml' },
        { id: 'L2', name: 'Gilbeys Gin 750ml', price: 1450, category: 'Gin', stock: 112, volume: '750ml' },
        { id: 'L3', name: 'Tusker Lager 500ml', price: 230, category: 'Beer', stock: 450, volume: '500ml', type: 'Returnable' },
        { id: 'L4', name: 'White Cap 500ml', price: 240, category: 'Beer', stock: 320, volume: '500ml', type: 'Returnable' },
        { id: 'L5', name: 'Hennessy VS 700ml', price: 6800, category: 'Cognac', stock: 12, volume: '700ml' },
        { id: 'M1', name: 'Coca Cola 1.25L', price: 140, category: 'Mixers', stock: 80, volume: '1.25L' },
      ],
      activeOrders: [],
      completedOrders: [],

      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),

      // Product Actions
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      updateStock: (productId, quantity) => set((state) => ({
        products: state.products.map(p => p.id === productId ? { ...p, stock: p.stock - quantity } : p)
      })),

      // Order Actions
      createOrder: (order) => set((state) => ({ 
        activeOrders: [...state.activeOrders, order] 
      })),

      dispatchOrder: (orderId) => set((state) => ({
        activeOrders: state.activeOrders.map(o => o.id === orderId ? { ...o, status: 'DISPATCHED' } : o)
      })),

      completeOrder: (orderId) => {
        const order = get().activeOrders.find(o => o.id === orderId);
        if (order) {
          // Deduct stock for each item in the order
          order.items.forEach(item => {
            get().updateStock(item.id, item.quantity);
          });
          
          set((state) => ({
            activeOrders: state.activeOrders.filter(o => o.id !== orderId),
            completedOrders: [...state.completedOrders, { ...order, status: 'PAID' }]
          }));
        }
      },

      voidOrder: (orderId) => set((state) => ({
        activeOrders: state.activeOrders.filter(o => o.id !== orderId)
      })),

      getSalesByWaiter: () => {
        const completed = get().completedOrders;
        const sales: Record<string, number> = {};
        completed.forEach(o => {
          sales[o.waiterName] = (sales[o.waiterName] || 0) + o.total;
        });
        return sales;
      },

      getWaiterStats: (waiterId) => {
        const completed = get().completedOrders.filter(o => o.waiterId === waiterId);
        const pending = get().activeOrders.filter(o => o.waiterId === waiterId);
        
        const settled = completed.reduce((sum, o) => sum + o.total, 0);
        const unsettled = pending.reduce((sum, o) => sum + o.total, 0);
        
        return {
          settled,
          unsettled,
          total: settled + unsettled
        };
      }
    }),
    { name: 'business-storage' }
  )
);
