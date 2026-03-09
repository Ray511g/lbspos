"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Clock, AlertTriangle, Package } from 'lucide-react';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';

export function LiveAlerts() {
    const { notifications, products } = useBusinessStore();
    const { currentUser } = useAuthStore();
    const [visibleNotifs, setVisibleNotifs] = useState<any[]>([]);
    const shownStockAlerts = useRef<Set<string>>(new Set());

    // Only Cashiers and Admins see live alerts
    const canSeeAlerts = currentUser?.role === 'CASHIER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

    // --- NEW: Stock Reorder Alerts ---
    useEffect(() => {
        if (!canSeeAlerts) return;

        const LOW_STOCK_THRESHOLD = 10;

        products.forEach(p => {
            const alertKey = `stock-${p.id}-${p.stock}`;
            // Only alert once per product per stock level
            if (p.stock <= LOW_STOCK_THRESHOLD && p.stock > 0 && !shownStockAlerts.current.has(alertKey)) {
                shownStockAlerts.current.add(alertKey);
                const stockAlert = {
                    id: `stock-alert-${p.id}-${Date.now()}`,
                    title: `⚠️ Low Stock: ${p.name}`,
                    message: `Only ${p.stock} units remaining. Reorder required immediately.`,
                    type: 'STOCK',
                    timestamp: new Date().toISOString(),
                };
                setVisibleNotifs(prev => [...prev, stockAlert]);
                setTimeout(() => {
                    setVisibleNotifs(prev => prev.filter(v => v.id !== stockAlert.id));
                }, 8000);
            }
            // Out of stock alert
            if (p.stock === 0) {
                const outKey = `out-${p.id}`;
                if (!shownStockAlerts.current.has(outKey)) {
                    shownStockAlerts.current.add(outKey);
                    const outAlert = {
                        id: `out-alert-${p.id}-${Date.now()}`,
                        title: `🚫 Out of Stock: ${p.name}`,
                        message: `This item is now completely out of stock!`,
                        type: 'OUT_OF_STOCK',
                        timestamp: new Date().toISOString(),
                    };
                    setVisibleNotifs(prev => [...prev, outAlert]);
                    setTimeout(() => {
                        setVisibleNotifs(prev => prev.filter(v => v.id !== outAlert.id));
                    }, 10000);
                }
            }
        });
    }, [products, canSeeAlerts]);

    // --- Existing: Order Notifications ---
    useEffect(() => {
        if (!canSeeAlerts) return;

        const now = new Date();
        const freshNotifs = notifications.filter(n => {
            const nTime = new Date(n.timestamp);
            const diff = now.getTime() - nTime.getTime();
            return diff < 10000 && !visibleNotifs.some(v => v.id === n.id);
        });

        if (freshNotifs.length > 0) {
            setVisibleNotifs(prev => [...prev, ...freshNotifs]);
            freshNotifs.forEach(fn => {
                setTimeout(() => {
                    setVisibleNotifs(prev => prev.filter(v => v.id !== fn.id));
                }, 6000);
            });
        }
    }, [notifications, canSeeAlerts]);

    if (!canSeeAlerts) return null;

    return (
        <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none max-w-xs w-full">
            <AnimatePresence>
                {visibleNotifs.map((notif) => {
                    const isStockAlert = notif.type === 'STOCK' || notif.type === 'OUT_OF_STOCK';
                    const isOutOfStock = notif.type === 'OUT_OF_STOCK';
                    return (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
                            className={`pointer-events-auto glass-card border p-4 rounded-[1.5rem] shadow-2xl relative overflow-hidden ${isOutOfStock ? 'bg-red-950/90 border-red-500/30' :
                                    isStockAlert ? 'bg-orange-950/90 border-orange-500/30' :
                                        'bg-navy-900/90 border-brand-blue/30'
                                }`}
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full ${isOutOfStock ? 'bg-red-500' : isStockAlert ? 'bg-orange-500' : 'bg-brand-blue'
                                }`} />
                            <div className="flex items-start gap-3 pl-1">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isOutOfStock ? 'bg-red-500/20 text-red-400' :
                                        isStockAlert ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-brand-blue/10 text-brand-blue'
                                    }`}>
                                    {isStockAlert ? <Package size={18} /> : <ShoppingCart size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black text-xs uppercase tracking-tight truncate">{notif.title}</h4>
                                    <p className="text-slate-300 text-[10px] mt-0.5 leading-relaxed">{notif.message}</p>
                                    <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                        <Clock size={9} /> Just Now
                                    </div>
                                </div>
                                <button
                                    onClick={() => setVisibleNotifs(prev => prev.filter(v => v.id !== notif.id))}
                                    className="text-slate-600 hover:text-white transition-colors p-1 shrink-0"
                                    title="Dismiss"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
