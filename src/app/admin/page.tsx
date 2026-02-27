"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Save, 
  UserPlus, 
  Trash2, 
  RefreshCw,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Globe,
  Coins,
  Receipt,
  Wine
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore, UserRole } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function BusinessEngine() {
  const { businessName, currency, taxRate, updateSettings, getSalesByWaiter, completedOrders } = useBusinessStore();
  const { users, addUser, removeUser, currentUser } = useAuthStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'settings' | 'staff' | 'reports'>('settings');
  const [formName, setFormName] = useState(businessName);
  const [formCurrency, setFormCurrency] = useState(currency);
  const [formTax, setFormTax] = useState(taxRate);

  // Security Check: Only ADMIN can access Business Engine
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'ADMIN') return null;

  const handleSaveSettings = () => {
    updateSettings({ businessName: formName, currency: formCurrency, taxRate: formTax });
  };

  const waiterSales = getSalesByWaiter();

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-blue mb-2">
            <Settings size={20} className="animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[3px]">System Core Layer</span>
          </div>
          <h1 className="text-5xl font-black text-white font-outfit">Business <span className="text-brand-blue">Engine</span></h1>
          <p className="text-slate-400 mt-2">Manage infrastructure, staff access, and revenue intelligence.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'settings', label: 'Company Profile', icon: Globe },
          { id: 'staff', label: 'Staff & Access', icon: Users },
          { id: 'reports', label: 'Intelligence', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black transition-all",
              activeTab === tab.id ? "bg-brand-blue text-white shadow-xl" : "text-slate-500 hover:text-white"
            )}
          >
            <tab.icon size={16} />
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
               <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tight">Identity Settings</h3>
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Business Trading Name</label>
                    <input 
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:ring-2 focus:ring-brand-blue/50 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Base Currency</label>
                      <input 
                        value={formCurrency}
                        onChange={e => setFormCurrency(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">VAT Percentage (%)</label>
                      <input 
                        type="number"
                        value={formTax}
                        onChange={e => setFormTax(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                      />
                    </div>
                  </div>
                  <button onClick={handleSaveSettings} className="w-full py-5 rounded-2xl premium-gradient text-white font-black flex items-center justify-center gap-3 shadow-xl">
                    <Save size={20} /> SYNC CONFIGURATION
                  </button>
               </div>
            </div>

            <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-navy-900 flex flex-col justify-center items-center text-center space-y-6">
               <div className="w-24 h-24 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                 <ShieldCheck size={48} />
               </div>
               <div>
                  <h4 className="text-xl font-black text-white">Cloud Master Sync</h4>
                  <p className="text-slate-500 text-sm mt-2 max-w-[280px]">All changes are encrypted and propagated to all counter terminals in real-time.</p>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'staff' && (
          <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tight">Access Control List</h3>
               <button className="flex items-center gap-3 bg-brand-blue text-white px-6 py-3 rounded-xl font-black text-xs">
                 <UserPlus size={18} /> REGISTER NEW STAFF
               </button>
            </div>

            <div className="glass-card rounded-[3rem] overflow-hidden border-white/5">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-8 py-6">Staff Member</th>
                        <th className="px-8 py-6">Authorization Level</th>
                        <th className="px-8 py-6">Login PIN</th>
                        <th className="px-8 py-6 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {users.map(user => (
                       <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-blue font-black uppercase">
                                   {user.name.charAt(0)}
                                </div>
                                <span className="text-white font-bold">{user.name}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={cn(
                               "px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase",
                               user.role === 'ADMIN' ? "bg-purple-500/10 text-purple-400" :
                               user.role === 'CASHIER' ? "bg-emerald-500/10 text-emerald-400" :
                               "bg-brand-blue/10 text-brand-blue"
                             )}>
                               {user.role}
                             </span>
                          </td>
                          <td className="px-8 py-6 font-mono text-slate-500 font-bold tracking-[4px]">****</td>
                          <td className="px-8 py-6 text-right">
                             <button className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                               <Trash2 size={18} />
                             </button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Gross Revenue</span>
                  <div className="text-4xl font-black text-white mt-1">{formCurrency} {completedOrders.reduce((a,b) => a+b.total, 0).toLocaleString()}</div>
               </div>
               <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Volume</span>
                  <div className="text-4xl font-black text-white mt-1">{completedOrders.length} Completed</div>
               </div>
            </div>

            <div className="glass-card p-10 rounded-[3rem] border-white/5">
               <h3 className="text-xl font-black text-white font-outfit mb-8 uppercase tracking-wide">Sales Distribution per Staff</h3>
               <div className="space-y-8">
                  {Object.entries(waiterSales).map(([name, amount], i) => (
                    <div key={name} className="space-y-3">
                       <div className="flex justify-between items-end px-1">
                          <div className="flex gap-4 items-center">
                             <span className="text-slate-400 font-black text-[10px]">0{i+1}</span>
                             <span className="text-white font-bold">{name}</span>
                          </div>
                          <span className="text-white font-black">{formCurrency} {amount.toLocaleString()}</span>
                       </div>
                       <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(amount / completedOrders.reduce((a,b) => a+b.total, 0)) * 100}%` }}
                            className="h-full premium-gradient"
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
