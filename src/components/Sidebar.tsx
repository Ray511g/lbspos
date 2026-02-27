"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Settings, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  AppWindow,
  Wine,
  Menu,
  X,
  Bell,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '@/store/authStore';
import { useBusinessStore } from '@/store/businessStore';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/', roles: ['ADMIN', 'MANAGER', 'CASHIER', 'WAITER'] },
  { icon: ShoppingCart, label: 'Counter POS', path: '/pos', roles: ['ADMIN', 'MANAGER', 'CASHIER', 'WAITER'] },
  { icon: Package, label: 'Inventory Vault', path: '/inventory', roles: ['ADMIN', 'MANAGER', 'CASHIER'], group: 'Operation' },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['ADMIN', 'MANAGER'], group: 'Admin' },
  { icon: Activity, label: 'Nightly Audit', path: '/audit', roles: ['ADMIN', 'MANAGER'], group: 'Admin' },
  { icon: AppWindow, label: 'Admin Engine', path: '/admin', roles: ['ADMIN', 'MANAGER'], group: 'Admin' },
];

export default function Sidebar() {
  const { currentUser, logout } = useAuthStore();
  const { notifications, markNotificationsRead, businessName } = useBusinessStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();

  const unreadCount = notifications.filter(n => !n.read).length;

  const eligibleItems = useMemo(() => {
    return menuItems.filter(item => item.roles.includes(currentUser?.role || ''));
  }, [currentUser?.role]);

  return (
    <>
      {/* Mobile Header Overlay (Small Devices Only) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-navy-950/80 backdrop-blur-xl border-b border-white/5 h-16 z-[55] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
            <Wine className="text-brand-blue" size={20} />
            <span className="font-black text-sm text-white uppercase tracking-tighter">
                {businessName.split(' ')[0]}<span className="text-brand-blue">{businessName.split(' ')[1] || 'POS'}</span>
            </span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.aside
          key={currentUser?.id}
          initial={mobileOpen ? { x: -300 } : undefined}
          animate={{ 
            x: 0, 
            width: mobileOpen ? '280px' : (collapsed ? '90px' : '280px'),
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            "h-screen bg-navy-950 border-r border-white/10 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-2xl overflow-visible",
            mobileOpen ? "fixed top-0 left-0" : "hidden lg:flex sticky top-0"
          )}
        >
          {/* Logo Section */}
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center shrink-0 border border-brand-blue/20">
              <Wine className="text-brand-blue" size={28} />
            </div>
            {(!collapsed || mobileOpen) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-black text-2xl tracking-tight text-white whitespace-nowrap uppercase italic"
              >
                {businessName.split(' ')[0]}<span className="text-brand-blue">{businessName.split(' ')[1] || 'POS'}</span>
              </motion.div>
            )}
          </div>

          {/* User Status Strip */}
           {(!collapsed || mobileOpen) && (
             <div className="px-8 mb-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{currentUser?.role} LEVEL ACCESS</span>
                </div>
             </div>
           )}

          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
            <div className="space-y-8">
              {['Operation', 'Admin'].map(group => {
                const groupItems = eligibleItems.filter(item => (item.group === group) || (!item.group && group === 'Operation'));
                if (groupItems.length === 0) return null;

                return (
                  <div key={group} className="space-y-3">
                    {(!collapsed || mobileOpen) && (
                      <div className="px-4 py-2 flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[3px]">{group}</span>
                        <div className="h-[1px] flex-1 bg-white/5" />
                      </div>
                    )}
                    {groupItems.map((item) => {
                      const active = pathname === item.path;
                      const showLabel = !collapsed || mobileOpen;
                      return (
                        <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)}>
                          <div
                            className={cn(
                              "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative mx-2",
                              active 
                                ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/20" 
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <item.icon size={22} className={cn(active ? "text-white" : "group-hover:text-white transition-colors")} />
                            {showLabel && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-bold text-sm whitespace-nowrap"
                              >
                                {item.label}
                              </motion.span>
                            )}
                            
                            {/* Tooltip for Collapsed State */}
                            {collapsed && !mobileOpen && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-navy-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-2xl">
                                    {item.label}
                                </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Footer Area */}
          <div className="p-6 mt-auto">
            <div className={cn(
                "bg-navy-900/50 border border-white/5 rounded-[2rem] overflow-hidden transition-all",
                collapsed && !mobileOpen ? "p-2" : "p-4"
            )}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-brand-blue font-black shrink-0 border border-white/5">
                  {currentUser?.name.charAt(0)}
                </div>
                {(!collapsed || mobileOpen) && (
                  <div className="min-w-0 pr-4">
                    <p className="text-white font-bold text-xs truncate uppercase tracking-tighter">{currentUser?.name}</p>
                    <button 
                        onClick={() => { logout(); window.location.href = '/login'; }}
                        className="text-[10px] text-red-400 font-black uppercase tracking-widest hover:text-red-300 transition-colors flex items-center gap-1 mt-1"
                    >
                        <LogOut size={10} /> TERMINAL LOCK
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Toggle Button for Desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex absolute -right-4 top-12 w-8 h-8 bg-brand-blue rounded-xl items-center justify-center text-white border-4 border-navy-950 hover:scale-110 transition-transform z-50 shadow-xl"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </motion.aside>
      </AnimatePresence>

      {/* Mobile Backdrop */}
      <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}
      </AnimatePresence>
    </>
  );
}
