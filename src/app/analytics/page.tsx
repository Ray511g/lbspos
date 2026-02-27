"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  ArrowUpRight, 
  Target, 
  Layers, 
  Filter,
  Download,
  CalendarDays,
  Gem
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessStore } from '@/store/businessStore';

export default function AnalyticsPage() {
  const { businessType, currency } = useBusinessStore();

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-blue mb-2">
            <Gem size={20} />
            <span className="text-[10px] font-black uppercase tracking-[3px]">Intelligent Data Layer</span>
          </div>
          <h1 className="text-5xl font-black text-white font-outfit">Financial <span className="text-brand-blue">Insights</span></h1>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white font-bold hover:bg-white/10 transition-all">
            <CalendarDays size={18} />
             Last 30 Days
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-3 premium-gradient px-8 py-4 rounded-2xl text-white font-black shadow-xl shadow-brand-blue/20 hover:scale-[1.02] transition-all">
            <Download size={18} />
            EXPORT REPORT
          </button>
        </div>
      </div>

      {/* KPI Ribbons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Volume', value: 'KES 2.4M', trend: '+14%', color: 'blue' },
          { label: 'Avg Ticket', value: 'KES 4,200', trend: '+2%', color: 'purple' },
          { label: 'Cust Lifetime', value: 'KES 18K', trend: '+8%', color: 'emerald' },
        ].map((kpi, i) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative group"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 text-xs font-black uppercase tracking-widest">{kpi.label}</span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-emerald-400">
                <ArrowUpRight size={14} />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-black text-white">{kpi.value}</h2>
              <span className="text-emerald-400 font-bold mb-1">{kpi.trend}</span>
            </div>
            <div className="mt-6 flex gap-1 h-2">
              {[1,2,3,4,5,6,7,8].map(j => (
                <div key={j} className={cn("flex-1 rounded-full bg-white/5 overflow-hidden")}>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ delay: (i*0.2) + (j*0.1) }}
                    className={cn("w-full opacity-50", 
                      kpi.color === 'blue' ? 'bg-blue-500' : kpi.color === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'
                    )} 
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Visualizer */}
          <div className="glass-card p-10 rounded-[3rem] border-white/5 h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-white font-outfit flex items-center gap-4">
                <TrendingUp className="text-brand-blue" />
                Revenue Trajectory
              </h3>
              <div className="flex gap-2">
                 <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-bold hover:text-white transition-all">Weekly</button>
                 <button className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-lg shadow-brand-blue/20">Monthly</button>
              </div>
            </div>
            <div className="flex-1 flex items-end gap-6 px-4">
              {[40, 65, 30, 85, 45, 90, 55, 75, 60, 95, 40, 100].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, type: 'spring' }}
                    className="w-full bg-gradient-to-t from-brand-blue/10 via-brand-blue/40 to-brand-blue rounded-t-2xl relative"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                  </motion.div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-600 uppercase">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 rounded-[3rem] border-white/5">
            <h3 className="text-xl font-black text-white mb-8 font-outfit">Unit Performance</h3>
            <div className="space-y-6">
              {[
                { label: 'Beverages', value: 85, color: 'bg-blue-500' },
                { label: 'Snacks', value: 62, color: 'bg-purple-500' },
                { label: 'Pharmacy', value: 41, color: 'bg-emerald-500' },
                { label: 'Accessories', value: 18, color: 'bg-orange-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                    <span>{item.label}</span>
                    <span className="text-white">{item.value}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className={cn("h-full rounded-full shadow-lg shadow-brand-blue/10", item.color)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-navy-900 border-2 border-brand-blue/20 relative overflow-hidden group hover:border-brand-blue/40 transition-all">
            <div className="relative z-10 text-center">
               <Target size={40} className="text-brand-blue mx-auto mb-6 group-hover:scale-110 transition-transform" />
               <h4 className="text-2xl font-black text-white font-outfit mb-2">Smart Forecast</h4>
               <p className="text-slate-400 text-sm mb-6 leading-relaxed">AI analyzes your {businessType} history to predict a 12% revenue growth next month.</p>
               <button className="w-full py-4 rounded-2xl bg-white text-navy-950 font-black tracking-tight hover:shadow-xl transition-all">
                  VIEW FULL STRATEGY
               </button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
