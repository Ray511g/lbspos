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
  
  // Configuration Functions
  updateSettings: (settings: Partial<{ businessName: string; businessType: BusinessType; currency: string; taxRate: number }>) => void;
  
  // Product Management
  addProduct: (product: Product, adminName: string) => void;
  updateProduct: (id: string, updates: Partial<Product>, adminName: string) => void;
  deleteProduct: (id: string, adminName: string) => void;
  updateStock: (productId: string, quantity: number, action: 'SALE' | 'MANUAL', initiator: string) => void;
  
  // Order Management
  createOrder: (order: Order) => void;
  dispatchOrder: (orderId: string, initiator: string) => void;
  completeOrder: (orderId: string, initiator: string) => void;
  voidOrder: (orderId: string) => void;
  recordSale: (items: any[], total: number, initiator: string) => void;
  
  // Reporting & Stats
  getSalesByWaiter: () => Record<string, number>;
  getWaiterStats: (waiterId: string) => { settled: number; unsettled: number; total: number };
  
  // Internal Utility
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationsRead: () => void;
  addAudit: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
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
      notifications: [],
      auditTrail: [],

      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),

      addNotification: (n) => set((state) => ({
        notifications: [{ 
          ...n, 
          id: `NT-${Date.now()}`, 
          timestamp: new Date().toISOString(), 
          read: false 
        }, ...state.notifications].slice(0, 50)
      })),

      markNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),

      addAudit: (a) => set((state) => ({
        auditTrail: [{
          ...a,
          id: `AU-${Date.now()}`,
          timestamp: new Date().toISOString()
        }, ...state.auditTrail].slice(0, 500)
      })),

      // Product Actions
      addProduct: (product, adminName) => {
        set((state) => ({ products: [...state.products, product] }));
        get().addNotification({
          title: 'Stock Addition',
          message: `${adminName} added ${product.name} to inventory.`,
          type: 'STOCK_ADD'
        });
        get().addAudit({
          userId: 'ADMIN',
          userName: adminName,
          action: 'ADD_PRODUCT',
          details: `Added ${product.name} at ${product.price}`
        });
      },

      updateProduct: (id, updates, adminName) => {
        set((state) => ({
          products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
        get().addAudit({
          userId: 'ADMIN',
          userName: adminName,
          action: 'UPDATE_PRODUCT',
          details: `Updated ${id}: ${JSON.stringify(updates)}`
        });
      },

      deleteProduct: (id, adminName) => {
        const product = get().products.find(p => p.id === id);
        set((state) => ({
          products: state.products.filter(p => p.id !== id)
        }));
        get().addAudit({
          userId: 'ADMIN',
          userName: adminName,
          action: 'DELETE_PRODUCT',
          details: `Deleted ${product?.name || id}`
        });
      },

      updateStock: (productId, quantity, action, initiator) => {
        set((state) => ({
          products: state.products.map(p => p.id === productId ? { ...p, stock: action === 'SALE' ? p.stock - quantity : p.stock + quantity } : p)
        }));
        
        if (action === 'MANUAL') {
          const product = get().products.find(p => p.id === productId);
          get().addNotification({
            title: 'Stock Updated',
            message: `${initiator} updated ${product?.name} stock by ${quantity}.`,
            type: 'STOCK_ADD'
          });
          get().addAudit({
            userId: 'ADMIN',
            userName: initiator,
            action: 'MANUAL_STOCK_UPDATE',
            details: `Updated ${product?.name} by ${quantity}`
          });
        }
      },

      // Order Actions
      createOrder: (order) => set((state) => ({ 
        activeOrders: [...state.activeOrders, order] 
      })),

      dispatchOrder: (orderId, initiator) => {
        const order = get().activeOrders.find(o => o.id === orderId);
        if (order && order.status === 'PENDING') {
          // Deduct stock when dispatched
          order.items.forEach(item => {
            get().updateStock(item.id, item.quantity, 'SALE', initiator);
          });
          
          set((state) => ({
            activeOrders: state.activeOrders.map(o => o.id === orderId ? { ...o, status: 'DISPATCHED' } : o)
          }));

          get().addAudit({
            userId: 'COUNTER',
            userName: initiator,
            action: 'DISPATCH_ORDER',
            details: `Dispatched order ${orderId} - Stock reduced.`
          });
        }
      },

      completeOrder: (orderId, initiator) => {
        const order = get().activeOrders.find(o => o.id === orderId);
        if (order) {
          // If it was still pending for some reason, deduct stock now
          if (order.status === 'PENDING') {
            order.items.forEach(item => {
              get().updateStock(item.id, item.quantity, 'SALE', initiator);
            });
          }
          
          set((state) => ({
            activeOrders: state.activeOrders.filter(o => o.id !== orderId),
            completedOrders: [...state.completedOrders, { ...order, status: 'PAID' }]
          }));

          get().addAudit({
            userId: 'COUNTER',
            userName: initiator,
            action: 'ORDER_PAID',
            details: `Settled order ${orderId} - ${get().currency} ${order.total}`
          });
        }
      },

      recordSale: (items, total, initiator) => {
        // Direct counter sale - deduct stock immediately
        items.forEach(item => {
          get().updateStock(item.id, item.quantity, 'SALE', initiator);
        });

        const newOrder: Order = {
          id: `INV-${Date.now()}`,
          waiterId: 'COUNTER',
          waiterName: initiator,
          items: [...items],
          total,
          status: 'PAID',
          timestamp: new Date().toISOString()
        };

        set((state) => ({
          completedOrders: [...state.completedOrders, newOrder]
        }));

        get().addAudit({
          userId: 'COUNTER',
          userName: initiator,
          action: 'DIRECT_SALE',
          details: `Direct counter sale - ${get().currency} ${total} - Stock reduced.`
        });
      },

      voidOrder: (orderId) => {
        const order = get().activeOrders.find(o => o.id === orderId);
        if (order && order.status === 'DISPATCHED') {
          // If it was already dispatched (stock deducted), add stock back
          order.items.forEach(item => {
            get().updateStock(item.id, item.quantity, 'MANUAL', 'SYSTEM_VOID');
          });
        }
        set((state) => ({
          activeOrders: state.activeOrders.filter(o => o.id !== orderId)
        }));
      },

      getSalesByWaiter: () => {
        const completed = get().completedOrders;
        const sales: Record<string, number> = {};
        completed.forEach(o => {
          sales[o.waiterName] = (sales[o.waiterName] || 0) + (Number(o.total) || 0);
        });
        return sales;
      },

      getWaiterStats: (waiterId) => {
        const completed = get().completedOrders.filter(o => o.waiterId === waiterId);
        const pending = get().activeOrders.filter(o => o.waiterId === waiterId);
        
        const settled = completed.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const unsettled = pending.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        
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
