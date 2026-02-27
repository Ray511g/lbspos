"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  Package, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Search,
  Filter,
  Wine,
  Archive,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessStore } from '@/store/businessStore';

export default function EmptiesPage() {
  const { currency } = useBusinessStore();
  const [activeTab, setActiveTab] = useState<'inventory' | 'returns'>('inventory');

  const stockData = [
    { id: 1, name: 'Euro Beer Bottle (500ml)', brand: 'EABL', stock: 145, crates: 6, value: 25 },
    { id: 2, name: 'Cider Bottle (330ml)', brand: 'KHEWL', stock: 88, crates: 3, value: 15 },
    { id: 3, name: 'Plastic Crate (Brown)', brand: 'EABL', stock: 24, crates: 0, value: 500 },
    { id: 4, name: 'Green Beer Bottle', brand: 'Heineken', stock: 42, crates: 1, value: 30 },
  ];

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-blue mb-2">
            <RefreshCw size={20} className="animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[3px]">Returnable Assets Layer</span>
          </div>
          <h1 className="text-5xl font-black text-white font-outfit">Empties & <span className="text-brand-blue">Crates</span></h1>
          <p className="text-slate-400 mt-2">Managing deposit-based packaging and returnable stock assets.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-3 premium-gradient px-8 py-4 rounded-2xl text-white font-black shadow-xl shadow-brand-blue/20 hover:scale-[1.02] transition-all">
            <Plus size={18} />
            RECORD RETURN
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2rem] border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
               <Package size={24} />
             </div>
             <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Bottles</span>
          </div>
          <div className="text-4xl font-black text-white">1,245</div>
          <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
            <ArrowUpRight size={12} /> +12% since last week
          </p>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border-white/5">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
               <Archive size={24} />
             </div>
             <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Crates</span>
          </div>
          <div className="text-4xl font-black text-white">42</div>
          <p className="text-[10px] text-slate-500 font-bold mt-2">8 Pending manufacturer pickup</p>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-brand-blue/5 to-transparent">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white">
               <RefreshCw size={24} />
             </div>
             <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Deposit Value</span>
          </div>
          <div className="text-4xl font-black text-white">{currency} 54,200</div>
          <p className="text-[10px] text-slate-500 font-bold mt-2">Locked in liquid capital</p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex bg-white/5 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
            activeTab === 'inventory' ? "bg-brand-blue text-white" : "text-slate-500 hover:text-white"
          )}
        >
          INVENTORY VIEW
        </button>
        <button 
          onClick={() => setActiveTab('returns')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
            activeTab === 'returns' ? "bg-brand-blue text-white" : "text-slate-500 hover:text-white"
          )}
        >
          RETURN HISTORY
        </button>
      </div>

      {/* Tables Area */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div className="relative w-72">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
             <input 
               type="text" 
               placeholder="Filter assets..." 
               className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white text-sm outline-none focus:ring-1 focus:ring-brand-blue"
             />
           </div>
           <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold">
             <Filter size={18} />
             Sort By Brand
           </button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <th className="px-8 py-5">Asset Type</th>
              <th className="px-8 py-5">Manufacturer</th>
              <th className="px-8 py-5">Quantity</th>
              <th className="px-8 py-5">Deposit Price</th>
              <th className="px-8 py-5">Total Value</th>
              <th className="px-8 py-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
             {stockData.map(item => (
               <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                 <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors">
                         {item.name.includes('Crate') ? <Archive size={18} /> : <Wine size={18} />}
                       </div>
                       <div>
                         <div className="text-white font-bold">{item.name}</div>
                         <div className="text-slate-500 text-[10px]">Asset ID: #AS-00{item.id}</div>
                       </div>
                    </div>
                 </td>
                 <td className="px-8 py-6 text-slate-400 font-bold">{item.brand}</td>
                 <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="text-white font-black">{item.stock} Units</span>
                       <span className="text-[10px] text-slate-500">{item.crates} Full Crates</span>
                    </div>
                 </td>
                 <td className="px-8 py-6 text-slate-400 font-bold">{currency} {item.value}</td>
                 <td className="px-8 py-6 text-white font-black">{currency} {(item.value * item.stock).toLocaleString()}</td>
                 <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                       <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-brand-blue/20 hover:text-brand-blue transition-all">
                          <Plus size={16} />
                       </button>
                       <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                          <History size={16} />
                       </button>
                    </div>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* Warning Panel */}
      <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-[2.5rem] flex items-center gap-6">
         <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
           <AlertCircle size={32} />
         </div>
         <div className="flex-1">
            <h4 className="text-xl font-black text-white font-outfit">Asset Leakage Warning</h4>
            <p className="text-slate-400 text-sm mt-1">Found discrepancy of 14 beer bottles in Shift A. Verify with floor staff before reconciliation.</p>
         </div>
         <button className="px-6 py-3 rounded-xl bg-orange-500 text-white font-black text-sm hover:scale-[1.02] transition-transform">
           AUDIT SHIFT
         </button>
      </div>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
