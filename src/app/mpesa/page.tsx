"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SmartphoneNfc, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  History,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessStore } from '@/store/businessStore';

export default function MpesaReconPage() {
  const { currency } = useBusinessStore();
  const [filter, setFilter] = useState<'all' | 'matched' | 'unmatched'>('all');

  const transactions = [
    { id: 'T9283JS', time: '10:24 AM', amount: 4200, systemRef: 'POS-8821', mpesaRef: 'SJH28KK29', status: 'MATCHED' },
    { id: 'T9283JT', time: '10:45 AM', amount: 1450, systemRef: 'POS-8822', mpesaRef: 'SJH28KK30', status: 'MATCHED' },
    { id: 'T9283JU', time: '11:12 AM', amount: 230, systemRef: 'POS-8823', mpesaRef: null, status: 'UNMATCHED' },
    { id: 'T9283JV', time: '11:30 AM', amount: 6800, systemRef: 'POS-8824', mpesaRef: 'SJH28KK31', status: 'MATCHED' },
    { id: 'T9283JW', time: '11:55 AM', amount: 250, systemRef: 'POS-8825', mpesaRef: null, status: 'UNMATCHED' },
  ];

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <SmartphoneNfc size={20} />
            <span className="text-[10px] font-black uppercase tracking-[3px]">Digital Cash Integrity</span>
          </div>
          <h1 className="text-5xl font-black text-white font-outfit">M-Pesa <span className="text-brand-blue">Reconciliation</span></h1>
          <p className="text-slate-400 mt-2">Automated matching of POS sales with Till/Paybill statements.</p>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-white font-black hover:bg-white/10 transition-all">
            <History size={18} />
            FETCH STATEMENTS
          </button>
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 premium-gradient px-8 py-4 rounded-2xl text-white font-black shadow-xl shadow-brand-blue/20 hover:scale-[1.02] transition-all">
            AUTO-RECONCILE
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="md:col-span-2 glass-card p-8 rounded-[2.5rem] flex items-center justify-between border-brand-blue/20 bg-brand-blue/5">
            <div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Matched Volume</span>
               <div className="text-4xl font-black text-white mt-1">{currency} 142,500</div>
               <p className="text-emerald-400 text-[10px] font-bold mt-2 flex items-center gap-1">
                 <CheckCircle2 size={12} /> 98.2% Accuracy rate
               </p>
            </div>
            <TrendingUp size={48} className="text-brand-blue opacity-20" />
         </div>

         <div className="glass-card p-8 rounded-[2.5rem] border-red-500/20 bg-red-500/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Discrepancies</span>
            <div className="text-4xl font-black text-red-500 mt-1">{currency} 1,480</div>
            <p className="text-slate-500 text-[10px] font-bold mt-2">3 Missing transactions</p>
         </div>

         <div className="glass-card p-8 rounded-[2.5rem]">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending</span>
            <div className="text-4xl font-black text-white mt-1">12</div>
            <p className="text-slate-500 text-[10px] font-bold mt-2">Awaiting verification</p>
         </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl w-fit">
        {['all', 'matched', 'unmatched'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
              filter === t ? "bg-white/10 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Recon Table */}
      <div className="glass-card rounded-[3rem] overflow-hidden border-white/5">
         <table className="w-full text-left">
           <thead>
             <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
               <th className="px-8 py-6">Timestamp & Ref</th>
               <th className="px-8 py-6">Payment Amount</th>
               <th className="px-8 py-6">M-Pesa Code</th>
               <th className="px-8 py-6">Integrity Status</th>
               <th className="px-8 py-6 text-right">Action</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
              {transactions.filter(t => filter === 'all' || t.status.toLowerCase() === filter).map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-white font-bold">{tx.time}</span>
                      <span className="text-slate-500 text-[10px] font-black uppercase">POS REF: {tx.systemRef}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-white font-black">{currency} {tx.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    {tx.mpesaRef ? (
                      <div className="flex items-center gap-2 text-brand-blue font-black tracking-widest">
                        {tx.mpesaRef}
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      </div>
                    ) : (
                      <span className="text-red-500/50 italic text-sm">NOT FOUND IN STATEMENT</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter inline-flex items-center gap-2",
                      tx.status === 'MATCHED' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400 animate-pulse"
                    )}>
                      {tx.status === 'MATCHED' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-slate-600 hover:text-white transition-colors">
                      <ArrowRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
           </tbody>
         </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-navy-900 flex items-center gap-8">
           <div className="w-20 h-20 rounded-full border-4 border-brand-blue border-r-transparent flex items-center justify-center text-white font-black text-xl">
             98%
           </div>
           <div>
              <h3 className="text-2xl font-black text-white font-outfit">Revenue Protection</h3>
              <p className="text-slate-400 text-sm mt-1">Our AI identified and blocked 2 attempted ghost M-Pesa receipts today.</p>
           </div>
        </div>
        
        <div className="glass-card p-8 rounded-[3rem] border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent flex items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Info size={24} />
              </div>
              <h4 className="text-white font-bold">Safeguarding Mode Active</h4>
            </div>
            <button className="text-emerald-400 text-sm font-black underline decoration-2 underline-offset-4">VIEW LOGS</button>
        </div>
      </div>
    </div>
  );
}
