"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Globe, 
  Coins, 
  Shield, 
  Bell, 
  Cloud,
  CheckCircle2,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessStore } from '@/store/businessStore';

export default function SettingsPage() {
  const { businessType, businessName, currency, updateSettings } = useBusinessStore();

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in pb-20">
      <div>
        <h1 className="text-4xl font-black text-white font-outfit mb-2 flex items-center gap-4">
          <SettingsIcon size={32} className="text-brand-blue" />
          System <span className="text-brand-blue">Core</span> Controls
        </h1>
        <p className="text-slate-400">Manage your global enterprise preferences and UI experience.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Localization & Finance */}
        <section className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Globe size={24} className="text-brand-blue" />
            Localization & Finance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Business Display Name</label>
              <input 
                type="text" 
                value={businessName}
                onChange={(e) => updateSettings({ businessName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold focus:ring-2 focus:ring-brand-blue/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Base Currency Code</label>
              <select 
                value={currency}
                onChange={(e) => updateSettings({ currency: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold focus:ring-2 focus:ring-brand-blue/50 outline-none transition-all appearance-none"
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="UGX">UGX - Ugandan Shilling</option>
              </select>
            </div>
          </div>
        </section>

        {/* Display Preferences */}
        <section className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Monitor size={24} className="text-brand-blue" />
            Display & UI Experience
          </h3>
          
          <div className="space-y-6">
             <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10">
               <div className="flex items-center gap-4">
                 <div className="p-3 rounded-2xl bg-brand-blue/10 text-brand-blue">
                   <Moon size={24} />
                 </div>
                 <div>
                   <h4 className="font-bold text-white">System Appearance</h4>
                   <p className="text-xs text-slate-500">Force deep-sea dark mode across all connected terminals.</p>
                 </div>
               </div>
               <div className="flex bg-navy-950 p-1 rounded-xl">
                 <button className="px-6 py-2 rounded-lg bg-brand-blue text-white text-xs font-bold shadow-lg">Dark</button>
                 <button className="px-6 py-2 rounded-lg text-slate-500 text-xs font-bold">Light</button>
               </div>
             </div>

             <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10">
               <div className="flex items-center gap-4">
                 <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                   <Bell size={24} />
                 </div>
                 <div>
                   <h4 className="font-bold text-white">Smart Notifications</h4>
                   <p className="text-xs text-slate-500">Real-time alerts for inventory, staff logins, and price overrides.</p>
                 </div>
               </div>
               <div className="w-14 h-8 bg-brand-blue rounded-full relative">
                 <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow-md" />
               </div>
             </div>
          </div>
        </section>

        {/* Cloud & Backup */}
        <section className="glass-card p-10 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border-white/5 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black text-white font-outfit mb-4 flex items-center justify-center md:justify-start gap-4">
                <Cloud size={32} className="text-brand-blue" />
                Enterprise Cloud Sync
              </h3>
              <p className="text-slate-400 text-sm max-w-sm">Automatically backing up transaction hash-chains to the primary enterprise vault every 5 minutes.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-emerald-400 font-bold bg-emerald-400/10 px-6 py-3 rounded-2xl">
                <CheckCircle2 size={20} />
                VAULT SECURED
              </div>
              <button className="text-brand-blue font-bold text-xs hover:underline flex items-center gap-2">
                FORCE MANUAL SYNC
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-blue/10 transition-colors" />
        </section>
      </div>

      <div className="pt-10 flex flex-col items-center gap-6">
         <div className="text-slate-600 font-black text-[10px] uppercase tracking-[5px]">Version 1.0.4-ENTERPRISE-STABLE</div>
         <button className="text-red-500 font-black text-xs px-8 py-3 rounded-xl border border-red-500/20 hover:bg-red-500/5 transition-all">
           FACTORY RESET CORE ENGINE
         </button>
      </div>
    </div>
  );
}
