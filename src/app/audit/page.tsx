"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  ChevronRight, 
  Save, 
  RefreshCw, 
  Wine, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function NightlyAudit() {
  const { products, updateStock, addAudit } = useBusinessStore();
  const { currentUser } = useAuthStore();
  const router = useRouter();
  
  const [auditData, setAuditData] = useState<Record<string, number>>({});
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleAuditInput = (id: string, val: string) => {
    const num = Number(val);
    if (!isNaN(num)) {
      setAuditData(prev => ({ ...prev, [id]: num }));
    }
  };

  const submitAudit = () => {
    let summary = "Stock Audit Results:\n";
    Object.entries(auditData).forEach(([pid, physical]) => {
      const product = products.find(p => p.id === pid);
      if (product) {
        const variance = physical - product.stock;
        if (variance !== 0) {
            summary += `- ${product.name}: System [${product.stock}] vs Physical [${physical}] | Variance: ${variance > 0 ? '+' : ''}${variance}\n`;
        }
      }
    });

    addAudit({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'NIGHTLY_AUDIT',
        details: summary || "Nightly Stock Audit: All stocks verified correct."
    });

    setComplete(true);
    setTimeout(() => setComplete(false), 5000);
  };

  return (
    <div className="space-y-10 pb-20 animate-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-blue mb-1 font-black uppercase tracking-[4px] text-[10px]">
             Security & Loss Prevention
          </div>
          <h1 className="text-5xl font-black text-white font-outfit mb-2">Nightly <span className="text-brand-blue">Audit</span></h1>
          <p className="text-slate-400 font-medium">Daily reconciliation of physical stock vs digital throughput.</p>
        </div>
        <button 
           onClick={submitAudit}
           className="flex items-center gap-3 premium-gradient px-10 py-5 rounded-2xl text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-blue/20"
        >
           <Save size={20} /> SECURE AUDIT LOG
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
          <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white font-outfit uppercase">Reconciliation Table</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <RefreshCw size={14} /> LIVE SYSTEM SYNC
                  </div>
              </div>

              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                         <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                             <th className="px-8 py-6">Product</th>
                             <th className="px-8 py-6">System Stock</th>
                             <th className="px-8 py-6">Physical Count</th>
                             <th className="px-8 py-6 text-right">Variance</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {products.map(p => {
                              const physical = auditData[p.id] ?? p.stock;
                              const variance = physical - p.stock;
                              return (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500"><Wine size={18} /></div>
                                            <div>
                                                <p className="text-white font-bold uppercase text-xs">{p.name}</p>
                                                <p className="text-[10px] text-slate-600 font-black tracking-widest uppercase">{p.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-slate-500 font-bold text-lg">{p.stock}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                       <input 
                                          type="number"
                                          className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-black text-white outline-none focus:ring-2 focus:ring-brand-blue"
                                          placeholder={p.stock.toString()}
                                          value={auditData[p.id] ?? ''}
                                          onChange={(e) => handleAuditInput(p.id, e.target.value)}
                                       />
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={cn(
                                            "font-black text-xs px-3 py-1 rounded-full",
                                            variance === 0 ? "bg-white/5 text-slate-500" :
                                            variance > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {variance === 0 ? 'MATCH' : variance > 0 ? `+${variance}` : variance}
                                        </span>
                                    </td>
                                </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>

      <AnimatePresence>
          {complete && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                className="fixed bottom-10 right-10 bg-emerald-500 text-white p-6 rounded-[2rem] flex items-center gap-4 shadow-2xl shadow-emerald-500/30 z-[100]"
              >
                 <CheckCircle2 size={32} />
                 <div>
                    <h5 className="font-black uppercase text-xs">Audit Registered</h5>
                    <p className="text-[10px] opacity-80">Reconciliation data pushed to master engine.</p>
                 </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
