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
  History,
  Activity,
  User,
  Plus,
  X,
  Lock,
  Edit,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore, UserRole } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function BusinessEngine() {
  const { businessName, currency, taxRate, updateSettings, auditTrail } = useBusinessStore();
  const { users, addUser, removeUser, currentUser, updateUserPin } = useAuthStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'settings' | 'staff' | 'audit'>('settings');
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', pin: '', role: 'WAITER' as UserRole });

  // Settings State
  const [set_name, setSetName] = useState(businessName);
  const [set_curr, setSetCurr] = useState(currency);
  const [set_tax, setSetTax] = useState(taxRate);

  // Security Check
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER')) {
      router.push('/login');
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
        id: `U-${Date.now()}`,
        ...newUser
    });
    setShowUserModal(false);
    setNewUser({ name: '', pin: '', role: 'WAITER' });
  };

  const handleUpdateConfig = () => {
    updateSettings({ businessName: set_name, currency: set_curr, taxRate: set_tax });
    alert("Configuration synced successfully!");
  };

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-blue mb-2 font-black uppercase tracking-[3px] text-[10px]">
             <Activity size={14} className="animate-pulse" />
             Infrastructure Hub
          </div>
          <h1 className="text-5xl font-black text-white font-outfit">Business <span className="text-brand-blue">Engine</span></h1>
          <p className="text-slate-400 mt-2">Manage the core parameters, users, and security logs of your operation.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'settings', label: 'Setup', icon: Settings },
          { id: 'staff', label: 'User Directory', icon: Users },
          { id: 'audit', label: 'Audit Trail', icon: History },
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
                <h3 className="text-2xl font-black text-white font-outfit uppercase">Entity Configuration</h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Trading Name</label>
                      <input 
                        value={set_name} 
                        onChange={e => setSetName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-brand-blue/50" 
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Local Currency</label>
                        <input 
                            value={set_curr} 
                            onChange={e => setSetCurr(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Tax Rate (%)</label>
                        <input 
                            type="number"
                            value={set_tax} 
                            onChange={e => setSetTax(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none" 
                        />
                      </div>
                   </div>
                   <button onClick={handleUpdateConfig} className="w-full py-5 rounded-2xl premium-gradient text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-brand-blue/20">
                      <Save size={20} /> APPLY LIVE CHANGES
                   </button>
                </div>
             </div>
             
             <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-navy-900 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                   <Lock size={48} />
                </div>
                <div>
                   <h4 className="text-xl font-black text-white">System Lockdown</h4>
                   <p className="text-slate-500 text-sm max-w-[280px]">Any parameter changes are globally broadcast to all connected cash terminals instantly.</p>
                </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'staff' && (
          <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-2xl font-black text-white font-outfit uppercase">Authorization Table</h3>
                <button 
                    onClick={() => setShowUserModal(true)}
                    className="flex items-center gap-3 bg-brand-blue text-white px-6 py-3 rounded-xl font-black text-xs hover:scale-105 transition-all"
                >
                    <UserPlus size={18} /> REGISTER STAFF
                </button>
             </div>

             <div className="glass-card rounded-[3rem] overflow-hidden border-white/5">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                         <th className="px-8 py-6">Staff Member</th>
                         <th className="px-8 py-6">Access Role</th>
                         <th className="px-8 py-6">Security PIN</th>
                         <th className="px-8 py-6 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {users.map(u => (
                        <tr key={u.id}>
                           <td className="px-8 py-6 flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-blue font-black uppercase">{u.name.charAt(0)}</div>
                              <span className="text-white font-bold uppercase text-xs">{u.name}</span>
                           </td>
                           <td className="px-8 py-6">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black tracking-tighter uppercase",
                                u.role === 'ADMIN' ? "bg-red-500/10 text-red-400" :
                                u.role === 'MANAGER' ? "bg-purple-500/10 text-purple-400" :
                                u.role === 'CASHIER' ? "bg-emerald-500/10 text-emerald-400" : "bg-brand-blue/10 text-brand-blue"
                              )}>{u.role}</span>
                           </td>
                           <td className="px-8 py-6 font-mono text-slate-500 font-bold tracking-[8px]">****</td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                 <button className="p-2 text-slate-600 hover:text-white transition-colors"><Edit size={16} /></button>
                                 <button 
                                    onClick={() => removeUser(u.id)}
                                    className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </motion.div>
        )}

        {activeTab === 'audit' && (
          <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <h3 className="text-2xl font-black text-white font-outfit uppercase px-2">System Audit Trail</h3>
              <div className="glass-card rounded-[3rem] overflow-hidden border-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest sticky top-0 bg-navy-950/90 backdrop-blur-md">
                          <th className="px-8 py-6">Timestamp</th>
                          <th className="px-8 py-6">Initiator</th>
                          <th className="px-8 py-6">Action Event</th>
                          <th className="px-8 py-6">Event Details</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {auditTrail.map(entry => (
                         <tr key={entry.id} className="hover:bg-white/[0.02] text-xs transition-colors">
                            <td className="px-8 py-6 text-slate-500 font-bold">{new Date(entry.timestamp).toLocaleString()}</td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue text-[9px] font-black">{entry.userName.charAt(0)}</div>
                                  <span className="text-white font-bold">{entry.userName}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-brand-blue">{entry.action}</td>
                            <td className="px-8 py-6 text-slate-400 font-medium whitespace-pre-wrap">{entry.details}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Modal */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUserModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card w-full max-w-md p-10 rounded-[3rem] border-white/10 relative bg-navy-950">
                <h3 className="text-2xl font-black text-white font-outfit uppercase mb-8">New Staff Registration</h3>
                <form onSubmit={handleCreateUser} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Name</label>
                      <input 
                        required 
                        value={newUser.name}
                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" 
                        placeholder="John Doe" 
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Assign Role</label>
                        <select 
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                        >
                            <option value="ADMIN" className="bg-navy-950">ADMIN</option>
                            <option value="MANAGER" className="bg-navy-950">MANAGER</option>
                            <option value="CASHIER" className="bg-navy-950">CASHIER</option>
                            <option value="WAITER" className="bg-navy-950">WAITER</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Login PIN</label>
                        <input 
                            required 
                            maxLength={4} 
                            value={newUser.pin}
                            onChange={e => setNewUser({...newUser, pin: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" 
                            placeholder="****" 
                        />
                      </div>
                   </div>
                   <button className="w-full py-5 rounded-2xl premium-gradient text-white font-black flex items-center justify-center gap-3">
                      <Plus size={20} /> SYNC TO ACCESS LIST
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
