import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, addDoc, getDoc } from 'firebase/firestore';

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

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'STOCK_ADD' | 'ALERT' | 'INFO';
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
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
  notifications: Notification[];
  auditTrail: AuditEntry[];
  paybill?: string;
  businessTill?: string;
  
  // Real-time Sync (Used by SyncManager)
  setFirestoreState: (state: Partial<BusinessState>) => void;
  
  // Configuration Functions
  updateSettings: (settings: Partial<{ businessName: string; businessType: BusinessType; currency: string; taxRate: number; paybill: string; businessTill: string }>) => void;
  
  // Product Management
  addProduct: (product: Product, adminName: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>, adminName: string) => Promise<void>;
  deleteProduct: (id: string, adminName: string) => Promise<void>;
  updateStock: (productId: string, quantity: number, action: 'SALE' | 'MANUAL', initiator: string) => Promise<void>;
  
  // Order Management
  createOrder: (order: Order) => Promise<void>;
  dispatchOrder: (orderId: string, initiator: string) => Promise<void>;
  completeOrder: (orderId: string, initiator: string) => Promise<void>;
  voidOrder: (orderId: string) => Promise<void>;
  recordSale: (items: any[], total: number, initiator: string) => Promise<void>;
  
  // Reporting & Stats
  getSalesByWaiter: () => Record<string, number>;
  getWaiterStats: (waiterId: string) => { settled: number; unsettled: number; total: number };
  
  // Internal Utility
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  addAudit: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => Promise<void>;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      businessName: 'Business HQ',
      businessType: 'LIQUOR_STORE',
      currency: 'KES',
      taxRate: 16,
      products: [],
      activeOrders: [],
      completedOrders: [],
      notifications: [],
      auditTrail: [],
      paybill: '',
      businessTill: '',

      setFirestoreState: (state) => set((s) => ({ ...s, ...state })),

      updateSettings: async (settings) => {
          set((state) => ({ ...state, ...settings }));
          await setDoc(doc(db, "settings", "global"), {
              businessName: get().businessName,
              currency: get().currency,
              taxRate: get().taxRate,
              paybill: get().paybill || '',
              businessTill: get().businessTill || '',
              updatedAt: new Date().toISOString()
          }, { merge: true });
      },

      addNotification: async (n) => {
          const newNotif = {
              ...n,
              timestamp: new Date().toISOString(),
              read: false
          };
          await addDoc(collection(db, "notifications"), newNotif);
      },

      markNotificationsRead: async () => {
          const unread = get().notifications.filter(n => !n.read);
          for (const n of unread) {
              await updateDoc(doc(db, "notifications", n.id), { read: true });
          }
      },

      addAudit: async (a) => {
          await addDoc(collection(db, "auditTrail"), {
              ...a,
              timestamp: new Date().toISOString()
          });
      },

      // Product Actions
      addProduct: async (product, adminName) => {
        await setDoc(doc(db, "products", product.id), product);
        await get().addNotification({
          title: 'Stock Addition',
          message: `${adminName} added ${product.name} to inventory.`,
          type: 'STOCK_ADD'
        });
        await get().addAudit({
          userId: 'ADMIN',
          userName: adminName,
          action: 'ADD_PRODUCT',
          details: `Added ${product.name} at ${product.price}`
        });
      },

      updateProduct: async (id, updates, adminName) => {
        await updateDoc(doc(db, "products", id), updates);
        await get().addAudit({
          userId: 'ADMIN',
          userName: adminName,
          action: 'UPDATE_PRODUCT',
          details: `Updated ${id}: ${JSON.stringify(updates)}`
        });
      },

      deleteProduct: async (id, adminName) => {
        const product = get().products.find(p => p.id === id);
        await deleteDoc(doc(db, "products", id));
        await get().addAudit({
          userId: 'ADMIN',
          userName: adminName,
          action: 'DELETE_PRODUCT',
          details: `Deleted ${product?.name || id}`
        });
      },

      updateStock: async (productId, quantity, action, initiator) => {
        const product = get().products.find(p => p.id === productId);
        if (!product) return;

        const newStock = action === 'SALE' ? product.stock - quantity : product.stock + quantity;
        await updateDoc(doc(db, "products", productId), { stock: newStock });
        
        if (action === 'MANUAL') {
          await get().addNotification({
            title: 'Stock Updated',
            message: `${initiator} updated ${product?.name} stock by ${quantity}.`,
            type: 'STOCK_ADD'
          });
          await get().addAudit({
            userId: 'ADMIN',
            userName: initiator,
            action: 'MANUAL_STOCK_UPDATE',
            details: `Updated ${product?.name} by ${quantity}`
          });
        }
      },

      // Order Actions
      createOrder: async (order) => {
          await setDoc(doc(db, "activeOrders", order.id), order);
      },

      dispatchOrder: async (orderId, initiator) => {
        const order = get().activeOrders.find(o => o.id === orderId);
        if (order && order.status === 'PENDING') {
          for (const item of order.items) {
            await get().updateStock(item.id, item.quantity, 'SALE', initiator);
          }
          await updateDoc(doc(db, "activeOrders", orderId), { status: 'DISPATCHED' });
          await get().addAudit({
            userId: 'COUNTER',
            userName: initiator,
            action: 'DISPATCH_ORDER',
            details: `Dispatched order ${orderId} - Stock reduced.`
          });
        }
      },

      completeOrder: async (orderId, initiator) => {
        const order = get().activeOrders.find(o => o.id === orderId);
        if (order) {
          if (order.status === 'PENDING') {
            for (const item of order.items) {
               await get().updateStock(item.id, item.quantity, 'SALE', initiator);
            }
          }
          await deleteDoc(doc(db, "activeOrders", orderId));
          await setDoc(doc(db, "completedOrders", orderId), { ...order, status: 'PAID' });
          await get().addAudit({
            userId: 'COUNTER',
            userName: initiator,
            action: 'ORDER_PAID',
            details: `Settled order ${orderId}`
          });
        }
      },

      recordSale: async (items, total, initiator) => {
        for (const item of items) {
          await get().updateStock(item.id, item.quantity, 'SALE', initiator);
        }
        const orderId = `INV-${Date.now()}`;
        const newOrder: Order = {
          id: orderId,
          waiterId: 'COUNTER',
          waiterName: initiator,
          items: [...items],
          total,
          status: 'PAID',
          timestamp: new Date().toISOString()
        };
        await setDoc(doc(db, "completedOrders", orderId), newOrder);
        await get().addAudit({
          userId: 'COUNTER',
          userName: initiator,
          action: 'DIRECT_SALE',
          details: `Direct sale - Stock reduced.`
        });
      },

      voidOrder: async (orderId) => {
        const order = get().activeOrders.find(o => o.id === orderId);
        if (order && order.status === 'DISPATCHED') {
          for (const item of order.items) {
            await get().updateStock(item.id, item.quantity, 'MANUAL', 'SYSTEM_VOID');
          }
        }
        await deleteDoc(doc(db, "activeOrders", orderId));
      },

      getSalesByWaiter: () => {
        const sales: Record<string, number> = {};
        get().completedOrders.forEach(o => {
          sales[o.waiterName] = (sales[o.waiterName] || 0) + (Number(o.total) || 0);
        });
        return sales;
      },

      getWaiterStats: (waiterId) => {
        const completed = get().completedOrders.filter(o => o.waiterId === waiterId);
        const pending = get().activeOrders.filter(o => o.waiterId === waiterId);
        const settled = completed.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const unsettled = pending.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        return { settled, unsettled, total: settled + unsettled };
      }
    }),
    { name: 'business-storage' }
  )
);
