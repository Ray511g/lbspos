"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  Key, 
  Plus, 
  Search, 
  UserPlus, 
  Lock, 
  Unlock,
  MoreVertical,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLES = [
  { id: 'admin', name: 'Super Administrator', permissions: 'Full System Control', color: 'text-brand-blue' },
  { id: 'manager', name: 'Branch Manager', permissions: 'Inventory & Reporting', color: 'text-emerald-500' },
  { id: 'cashier', name: 'POS Cashier', permissions: 'Sales & Returns Only', color: 'text-purple-500' },
];

const STAFF = [
  { id: '1', name: 'Jane Musau', role: 'admin', email: 'jane@enterprise.com', status: 'ACTIVE', lastLogin: '10m ago' },
  { id: '2', name: 'David Obure', role: 'manager', email: 'david@enterprise.com', status: 'ACTIVE', lastLogin: '2h ago' },
  { id: '3', name: 'Mercy Njeri', role: 'cashier', email: 'mercy@enterprise.com', status: 'INACTIVE', lastLogin: '3 days ago' },
  { id: '4', name: 'Kelvin Korir', role: 'cashier', email: 'kelvin@enterprise.com', status: 'ACTIVE', lastLogin: '1h ago' },
];

export default function StaffPage() {
  return (
    <div className="space-y-10 animate-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white font-outfit mb-2">Team & <span className="text-brand-blue">Security</span></h1>
          <p className="text-slate-400 font-semibold tracking-tight">Enterprise Role-Based Access Control (RBAC)</p>
        </div>
        <button className="flex items-center gap-3 premium-gradient px-8 py-4 rounded-2xl text-white font-black shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <UserPlus size={20} />
          INVITE TEAM MEMBER
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Roles Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-[2rem] border-white/5">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={20} className="text-brand-blue" />
              Access Levels
            </h3>
            <div className="space-y-4">
              {ROLES.map(role => (
                <div key={role.id} className="p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white group-hover:text-brand-blue transition-colors">{role.name}</h4>
                    <MoreVertical size={14} className="text-slate-600" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{role.permissions}</p>
                </div>
              ))}
              <button className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-slate-500 font-bold text-sm hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-2">
                <Plus size={16} />
                Create Role
              </button>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2rem] bg-gradient-to-br from-brand-blue/10 to-transparent border-brand-blue/20">
             <Key size={32} className="text-brand-blue mb-4" />
             <h4 className="text-xl font-black text-white mb-2">Security Audit</h4>
             <p className="text-slate-400 text-xs leading-relaxed mb-6">Track every login, price override, and inventory void across all terminals.</p>
             <button className="w-full py-3 rounded-xl bg-white text-navy-950 font-black text-xs hover:shadow-lg transition-all">
               VIEW SYSTEM LOGS
             </button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="xl:col-span-3 space-y-6">
           <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl w-fit">
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text"
                  placeholder="Filter users..."
                  className="w-full bg-transparent border-none py-2 pl-12 pr-4 text-white font-semibold focus:outline-none"
                />
              </div>
           </div>

           <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-white/5">
                   <th className="px-8 py-6 text-slate-400 text-[10px] font-black uppercase tracking-[2px]">Team Member</th>
                   <th className="px-8 py-6 text-slate-400 text-[10px] font-black uppercase tracking-[2px]">Assigned Role</th>
                   <th className="px-8 py-6 text-slate-400 text-[10px] font-black uppercase tracking-[2px]">Status</th>
                   <th className="px-8 py-6 text-slate-400 text-[10px] font-black uppercase tracking-[2px]">Account Health</th>
                   <th className="px-8 py-6 text-right text-slate-400 text-[10px] font-black uppercase tracking-[2px]">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {STAFF.map(member => (
                   <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                     <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-brand-blue text-xl group-hover:bg-brand-blue group-hover:text-white transition-all">
                           {member.name.charAt(0)}
                         </div>
                         <div>
                           <h4 className="text-white font-bold">{member.name}</h4>
                           <div className="flex items-center gap-3 text-slate-500 text-xs mt-1">
                             <span className="flex items-center gap-1"><Mail size={12} /> {member.email}</span>
                           </div>
                         </div>
                       </div>
                     </td>
                     <td className="px-8 py-6">
                       <span className={cn(
                         "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                         member.role === 'admin' ? "bg-brand-blue/10 text-brand-blue" :
                         member.role === 'manager' ? "bg-emerald-500/10 text-emerald-500" : "bg-purple-500/10 text-purple-500"
                       )}>
                         {ROLES.find(r => r.id === member.role)?.name}
                       </span>
                     </td>
                     <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                         {member.status === 'ACTIVE' ? (
                           <CheckCircle2 size={16} className="text-emerald-500" />
                         ) : (
                           <XCircle size={16} className="text-red-500" />
                         )}
                         <span className={cn("text-xs font-bold", member.status === 'ACTIVE' ? "text-emerald-500" : "text-red-500")}>
                           {member.status}
                         </span>
                       </div>
                     </td>
                     <td className="px-8 py-6">
                       <div className="text-[10px] font-black text-slate-500 uppercase">Last Login</div>
                       <div className="text-sm font-bold text-white">{member.lastLogin}</div>
                     </td>
                     <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-xl text-slate-600 hover:bg-white/10 hover:text-white transition-all"><Settings size={16} /></button>
                          <button className="p-2 rounded-xl text-slate-600 hover:bg-white/10 hover:text-white transition-all"><Unlock size={16} /></button>
                          <button className="p-2 rounded-xl text-slate-600 hover:bg-red-500/10 hover:text-red-500 transition-all"><Lock size={16} /></button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}
