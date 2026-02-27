"use client";

import React, { useState } from 'react';
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
  Zap,
  Wine,
  RefreshCw,
  SmartphoneNfc,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/', roles: ['ADMIN', 'CASHIER', 'WAITER'] },
  { icon: ShoppingCart, label: 'Counter POS', path: '/pos', roles: ['ADMIN', 'CASHIER', 'WAITER'] },
  { icon: Package, label: 'Inventory', path: '/inventory', roles: ['ADMIN', 'CASHIER'] },
  { icon: RefreshCw, label: 'Empties/Crates', path: '/empties', roles: ['ADMIN', 'CASHIER'] },
  { icon: SmartphoneNfc, label: 'M-Pesa Recon', path: '/mpesa', roles: ['ADMIN', 'CASHIER'] },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['ADMIN', 'CASHIER'] },
  { icon: Users, label: 'Team', path: '/staff', roles: ['ADMIN'] },
  { icon: AppWindow, label: 'Business Engine', path: '/admin', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { currentUser } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-12 h-12 bg-navy-900 border border-white/10 rounded-2xl flex items-center justify-center text-white shadow-2xl"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {(mobileOpen || !collapsed) && (
          <motion.aside
            initial={mobileOpen ? { x: -300 } : undefined}
            animate={{ 
              x: 0, 
              width: mobileOpen ? '280px' : (collapsed ? '80px' : '280px'),
              position: mobileOpen ? 'fixed' : 'relative'
            }}
            exit={mobileOpen ? { x: -300 } : undefined}
            className={cn(
              "h-[100dvh] bg-navy-950 border-r border-white/10 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-2xl",
              mobileOpen && "fixed top-0 left-0"
            )}
          >
            <div className="p-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shrink-0">
                <Wine className="text-white" size={24} />
              </div>
              {(!collapsed || mobileOpen) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-black text-xl tracking-tight text-white whitespace-nowrap"
                >
                  LIQUOR<span className="text-brand-blue">PRO</span>
                </motion.div>
              )}
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
              {menuItems
                .filter(item => item.roles.includes(currentUser?.role || 'WAITER'))
                .map((item) => {
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
            </nav>

            <div className="p-4 border-t border-white/5">
              <button 
                onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login'; }}
                className="flex items-center gap-4 px-4 py-3 w-full text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut size={22} />
                {(!collapsed || mobileOpen) && <span className="font-semibold text-sm">Lock Register</span>}
              </button>
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-brand-blue rounded-full items-center justify-center text-white border-2 border-navy-950 hover:scale-110 transition-transform z-50"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
