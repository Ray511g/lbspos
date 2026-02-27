"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
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

  // Filter items based on CURRENT user role immediately
  const eligibleItems = useMemo(() => {
    return menuItems.filter(item => item.roles.includes(currentUser?.role || ''));
  }, [currentUser?.role]);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-[60] flex gap-2">
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-12 h-12 bg-navy-900 border border-white/10 rounded-2xl flex items-center justify-center text-white shadow-2xl"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.aside
          key={currentUser?.id} // Force re-render on user shift
          initial={mobileOpen ? { x: -300 } : undefined}
          animate={{ 
            x: 0, 
            width: mobileOpen ? '280px' : (collapsed ? '80px' : '280px'),
            position: mobileOpen ? 'fixed' : 'relative'
          }}
          className={cn(
            "h-screen bg-navy-950 border-r border-white/10 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-2xl",
            mobileOpen && "fixed top-0 left-0"
          )}
        >
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shrink-0 shadow-lg shadow-brand-blue/20">
              <Wine className="text-white" size={24} />
            </div>
            {(!collapsed || mobileOpen) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-black text-xl tracking-tight text-white whitespace-nowrap uppercase"
              >
                {businessName.split(' ')[0]}<span className="text-brand-blue">{businessName.split(' ')[1] || 'POS'}</span>
              </motion.div>
            )}
          </div>

          {/* Notifications */}
          {currentUser?.role === 'CASHIER' && (
            <div className="px-6 mb-4">
               <button 
                onClick={() => { setShowNotifications(!showNotifications); markNotificationsRead(); }}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center relative text-slate-400 hover:text-white transition-all"
               >
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                  {(!collapsed || mobileOpen) && <span className="ml-3 font-bold text-xs uppercase tracking-widest italic">Alerts</span>}
               </button>
            </div>
          )}

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {/* Navigation Groups */}
            <div className="space-y-6">
              {['Operation', 'Admin'].map(group => {
                const groupItems = eligibleItems.filter(item => (item.group === group) || (!item.group && group === 'Operation'));
                if (groupItems.length === 0) return null;

                return (
                  <div key={group} className="space-y-2">
                    {(!collapsed || mobileOpen) && group === 'Admin' && (
                      <div className="px-4 py-2 flex items-center gap-2">
                        <ShieldAlert size={12} className="text-brand-blue" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Admin Control</span>
                      </div>
                    )}
                    {groupItems.map((item) => {
                      const active = pathname === item.path;
                      const showLabel = !collapsed || mobileOpen;
                      return (
                        <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)}>
                          <div
                            className={cn(
                              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative",
                              active 
                                ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20" 
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <item.icon size={22} className={cn(active ? "text-brand-blue" : "group-hover:text-white")} />
                            {showLabel && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-semibold text-sm whitespace-nowrap"
                              >
                                {item.label}
                              </motion.span>
                            )}
                            {active && showLabel && (
                              <motion.div layoutId="active-nav" className="absolute left-[-1rem] w-1 h-8 bg-brand-blue rounded-r-full" />
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

          <div className="p-4 border-t border-white/5 space-y-2">
            <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-white/5 border border-white/5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-black text-xs shrink-0">
                {currentUser?.name.charAt(0)}
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="min-w-0">
                  <p className="text-white font-bold text-xs truncate">{currentUser?.name}</p>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{currentUser?.role}</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => { logout(); window.location.href = '/login'; }}
              className="flex items-center gap-4 px-4 py-3 w-full text-slate-400 hover:text-red-400 transition-colors group"
            >
              <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
              {(!collapsed || mobileOpen) && <span className="font-semibold text-sm">Lock Register</span>}
            </button>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-brand-blue rounded-full items-center justify-center text-white border-2 border-navy-950 hover:scale-110 transition-transform z-50 shadow-lg"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </motion.aside>
      </AnimatePresence>

      {/* Notifications Popover */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 left-20 z-[70] w-80 glass-card bg-navy-900 border border-white/10 p-6 rounded-[2rem] shadow-2xl"
          >
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-white font-black text-xs uppercase tracking-widest">Alerts Center</h4>
                <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
             </div>
             <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 relative">
                     {!n.read && <div className="absolute top-2 right-2 w-2 h-2 bg-brand-blue rounded-full" />}
                     <p className="text-white font-bold text-[11px] mb-1">{n.title}</p>
                     <p className="text-slate-400 text-[10px] leading-relaxed">{n.message}</p>
                     <span className="text-[9px] text-slate-600 mt-2 block font-bold">{new Date(n.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-600 text-[10px] font-black uppercase">No alerts found</p>
                  </div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
