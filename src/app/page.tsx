"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  ShieldCheck,
  CheckCircle2,
  SmartphoneNfc,
  RefreshCw,
  Wine,
  BarChart3,
  Search,
  Settings,
  Clock,
  LogOut,
  Target,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SmartDashboard() {
  const { businessName, currency, completedOrders, getSalesByWaiter, getWaiterStats } = useBusinessStore();
  const { currentUser, logout } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    if (!currentUser) router.push('/login');
  }, [currentUser]);

  if (!currentUser) return null;

  const totalSales = completedOrders.reduce((a, b) => a + b.total, 0);
  const waiterSales = getSalesByWaiter();

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-blue mb-1">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-black uppercase tracking-[4px]">System Active • {currentUser.role} Level</span>
          </div>
          <h1 className="text-5xl font-black text-white font-outfit tracking-tighter">
            {businessName.toUpperCase()} <span className="text-brand-blue">HQ</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Welcome back, <span className="text-white font-bold">{currentUser.name}</span>. Shop is online.</p>
        </div>
        
        <div className="flex gap-4">
           <button onClick={() => { logout(); router.push('/login'); }} className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-xs flex items-center gap-3 hover:bg-red-500/10 hover:text-red-500 transition-all">
             <LogOut size={16} /> SIGN OUT
           </button>
           <Link href="/pos" className="px-8 py-4 premium-gradient text-white rounded-2xl font-black text-sm shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3">
             <ShoppingCart size={18} /> OPEN TERMINAL
           </Link>
        </div>
      </div>

      {/* Admin Intelligence Layer */}
      {currentUser.role === 'ADMIN' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Revenue', value: `${currency} ${totalSales.toLocaleString()}`, icon: TrendingUp, color: 'text-brand-blue' },
              { label: 'Total Orders', value: completedOrders.length, icon: ShoppingCart, color: 'text-emerald-400' },
              { label: 'Top Waiter', value: Object.keys(waiterSales).sort((a,b) => waiterSales[b] - waiterSales[a])[0] || 'N/A', icon: Target, color: 'text-purple-400' },
              { label: 'Stock Alerts', value: '4 Low', icon: AlertTriangle, color: 'text-orange-500' },
            ].map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 rounded-[2rem] border-white/5">
                <div className="p-3 rounded-2xl bg-white/5 w-fit mb-4"><kpi.icon size={20} className={kpi.color} /></div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</div>
                <div className="text-2xl font-black text-white font-outfit mt-1">{kpi.value}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="glass-card p-10 rounded-[3rem] border-white/5">
                <h3 className="text-xl font-black text-white font-outfit mb-8 uppercase">Waiter Sales Performance</h3>
                <div className="space-y-6">
                   {Object.entries(waiterSales).map(([name, amount]) => (
                     <div key={name} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-brand-blue">{name.charAt(0)}</div>
                        <div className="flex-1">
                           <div className="flex justify-between text-sm font-bold text-white mb-1">
                              <span>{name}</span>
                              <span>{currency} {amount.toLocaleString()}</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-blue rounded-full" style={{ width: `${(amount/totalSales)*100}%` }} />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-navy-900 border-2 border-brand-blue/20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6">
                   <BarChart3 size={32} />
                </div>
                <h3 className="text-xl font-black text-white font-outfit uppercase">Profit Insight</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-[280px]">Automated analytics core is crunching your data. Next report due in 4 hours.</p>
                <button className="mt-8 px-8 py-3 bg-white/5 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-all uppercase tracking-widest">Global Overview</button>
             </div>
          </div>
        </>
      )}

      {currentUser.role === 'WAITER' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-brand-blue/5 to-transparent">
              <h3 className="text-3xl font-black text-white font-outfit mb-4">You are <span className="text-brand-blue">Online</span></h3>
              <p className="text-slate-400 text-sm max-w-sm mb-8">All orders you place will be tracked under your name and sent to the counter for dispatch. Maintain pace and accuracy.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Settled</span>
                    <div className="text-xl font-black text-emerald-400 mt-1">{currency} {getWaiterStats(currentUser.id).settled.toLocaleString()}</div>
                 </div>
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unsettled</span>
                    <div className="text-xl font-black text-orange-400 mt-1">{currency} {getWaiterStats(currentUser.id).unsettled.toLocaleString()}</div>
                 </div>
                 <div className="bg-white/5 p-6 rounded-3xl border border-brand-blue/30 bg-brand-blue/5 col-span-2 md:col-span-1">
                    <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">My Total</span>
                    <div className="text-xl font-black text-white mt-1">{currency} {getWaiterStats(currentUser.id).total.toLocaleString()}</div>
                 </div>
              </div>
           </div>

           <Link href="/pos" className="glass-card p-10 rounded-[3rem] border-white/5 bg-brand-blue flex flex-col justify-center items-center text-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10" />
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform relative z-10">
                 <ShoppingCart size={40} />
              </div>
              <h3 className="text-2xl font-black text-white font-outfit uppercase relative z-10">Start New Order</h3>
              <p className="text-white/70 text-sm mt-2 max-w-[200px] relative z-10">Open the sales terminal to start processing drinks.</p>
              <ChevronRight className="text-white mt-4 animate-bounce relative z-10" />
           </Link>
        </div>
      )}

      {currentUser.role === 'CASHIER' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-navy-900">
              <h3 className="text-xl font-black text-white font-outfit uppercase mb-4">Cashier Dispatch</h3>
              <p className="text-slate-500 text-sm mb-6">Manage incoming waiter orders and direct counter sales.</p>
              <Link href="/pos" className="inline-flex items-center gap-2 text-brand-blue font-black text-xs uppercase tracking-widest hover:gap-4 transition-all">
                 Enter POS Terminal <ArrowUpRight size={16} />
              </Link>
           </div>
           
           <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                 <div className="p-3 rounded-2xl bg-brand-blue/10 text-brand-blue"><Wine size={24} /></div>
                 <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">READY</span>
              </div>
              <div>
                 <h4 className="text-white font-bold uppercase text-xs tracking-widest">Daily Revenue</h4>
                 <div className="text-4xl font-black text-white font-outfit">{currency} {totalSales.toLocaleString()}</div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
