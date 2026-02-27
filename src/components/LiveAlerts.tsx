"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ShoppingCart, Clock } from 'lucide-react';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';

export function LiveAlerts() {
    const { notifications } = useBusinessStore();
    const { currentUser } = useAuthStore();
    const [visibleNotifs, setVisibleNotifs] = useState<any[]>([]);

    // Only Cashiers and Admins see live alerts
    const canSeeAlerts = currentUser?.role === 'CASHIER' || currentUser?.role === 'ADMIN';

    useEffect(() => {
        if (!canSeeAlerts) return;

        // Get notifications from the last 10 seconds that haven't been shown yet
        const now = new Date();
        const freshNotifs = notifications.filter(n => {
            const nTime = new Date(n.timestamp);
            const diff = now.getTime() - nTime.getTime();
            return diff < 10000 && !visibleNotifs.some(v => v.id === n.id);
        });

        if (freshNotifs.length > 0) {
            setVisibleNotifs(prev => [...prev, ...freshNotifs]);
            
            // Auto close after 5 seconds
            freshNotifs.forEach(fn => {
                setTimeout(() => {
                    setVisibleNotifs(prev => prev.filter(v => v.id !== fn.id));
                }, 6000);
            });
        }
    }, [notifications, canSeeAlerts]);

    if (!canSeeAlerts) return null;

    return (
        <div className="fixed top-6 right-6 z-[300] flex flex-col gap-4 pointer-events-none">
            <AnimatePresence>
                {visibleNotifs.map((notif) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
                        className="pointer-events-auto w-80 glass-card bg-navy-900/90 border-brand-blue/30 p-5 rounded-[2rem] shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue" />
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                                <ShoppingCart size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-black text-sm uppercase tracking-tighter truncate">{notif.title}</h4>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                                <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <Clock size={10} /> Just Now
                                </div>
                            </div>
                            <button 
                                onClick={() => setVisibleNotifs(prev => prev.filter(v => v.id !== notif.id))}
                                className="text-slate-600 hover:text-white transition-colors p-1"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
