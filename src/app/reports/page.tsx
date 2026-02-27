"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  User, 
  ArrowUpRight, 
  FileText,
  Download,
  Calendar,
  Layers,
  Wine
} from 'lucide-react';
import { useBusinessStore } from '@/store/businessStore';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const { completedOrders, currency, getSalesByWaiter } = useBusinessStore();
  
  const waiterSales = getSalesByWaiter();
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = completedOrders.length;
  
  const stats = [
    { label: 'Gross Revenue', value: `${currency} ${totalRevenue.toLocaleString()}`, icon: TrendingUp, trend: '+12.5%', color: 'from-blue-600 to-indigo-600' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, trend: '+5.2%', color: 'from-emerald-600 to-teal-600' },
    { label: 'Avg Order Value', value: `${currency} ${totalOrders ? (totalRevenue / totalOrders).toFixed(0) : 0}`, icon: BarChart3, trend: '-2.1%', color: 'from-orange-600 to-amber-600' },
    { label: 'Active Staff', value: Object.keys(waiterSales).length, icon: User, trend: 'Stable', color: 'from-purple-600 to-pink-600' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-white font-outfit mb-2">Business <span className="text-brand-blue">Intelligence</span></h1>
          <p className="text-slate-400 font-medium">Real-time performance analytics and fiscal reporting.</p>
        </div>
        <button className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white font-bold hover:bg-white/10 transition-all text-sm uppercase tracking-widest">
           <Download size={18} />
           Export Report
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="glass-card p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group"
          >
            <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 blur-3xl rounded-full -mr-10 -mt-10", stat.color)} />
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-2xl bg-gradient-to-br text-white shadow-xl", stat.color)}>
                <stat.icon size={24} />
              </div>
              <span className={cn(
                "text-[10px] font-black px-2 py-1 rounded-lg",
                stat.trend.startsWith('+') ? "text-emerald-400 bg-emerald-400/10" : "text-slate-400 bg-white/5"
              )}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1">{stat.label}</h3>
            <div className="text-3xl font-black text-white font-outfit">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Waiter Performance */}
        <div className="xl:col-span-2 glass-card p-10 rounded-[3rem] border-white/5 bg-navy-900/50">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tight">Staff Performance</h3>
              <div className="flex gap-2">
                 <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-brand-blue transition-all"><Calendar size={18} /></button>
                 <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-brand-blue transition-all"><Layers size={18} /></button>
              </div>
           </div>
           
           <div className="space-y-8">
              {Object.entries(waiterSales).map(([name, sales], i) => (
                <div key={name} className="space-y-3">
                   <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 font-black text-xs">
                            {name.charAt(0)}
                         </div>
                         <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-wide">{name}</h4>
                            <p className="text-slate-500 text-[10px] uppercase font-black">Sales Target: 85% Achieved</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-white font-black">{currency} {sales.toLocaleString()}</div>
                         <div className="text-emerald-400 text-[10px] font-black uppercase">Top Performer</div>
                      </div>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min((sales / (totalRevenue || 1)) * 100, 100)}%` }}
                        className="h-full bg-brand-blue" 
                      />
                   </div>
                </div>
              ))}
              {Object.keys(waiterSales).length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-slate-600">
                   <User size={48} className="mb-4 opacity-20" />
                   <p className="font-black uppercase tracking-widest text-xs">No sales recorded yet</p>
                </div>
              )}
           </div>
        </div>

        {/* Top Products */}
        <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-navy-900/50 flex flex-col">
           <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tight mb-8">Movements</h3>
           <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {[
                { name: 'Johnnie Walker Black', sold: 12, trend: '+4' },
                { name: 'Tusker Lager', sold: 245, trend: '+18' },
                { name: 'Gilbeys Gin', sold: 42, trend: '-2' },
                { name: 'Hennessy VS', sold: 5, trend: '0' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                      <Wine size={20} />
                   </div>
                   <div className="flex-1">
                      <h5 className="text-white font-bold text-xs uppercase tracking-tight">{item.name}</h5>
                      <span className="text-slate-500 text-[10px] font-black">{item.sold} Units Sold</span>
                   </div>
                   <div className={cn(
                     "text-[10px] font-black",
                     item.trend.startsWith('+') ? "text-emerald-400" : item.trend === '0' ? "text-slate-500" : "text-orange-500"
                   )}>
                      {item.trend}
                   </div>
                </div>
              ))}
           </div>
           <button className="mt-8 w-full py-4 rounded-2xl border border-white/5 bg-white/5 text-slate-400 font-black text-[10px] uppercase tracking-[3px] hover:text-white hover:border-brand-blue/30 transition-all">
              Comprehensive Audit
           </button>
        </div>
      </div>
    </div>
  );
}
