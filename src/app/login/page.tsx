"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, Lock, Delete, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const login = useAuthStore(state => state.login);
  const router = useRouter();

  const handleKeyPress = (val: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + val);
    }
  };

  const handleClear = () => setPin('');
  
  const handleBackspace = () => setPin(prev => prev.slice(0, -1));

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (login(pin)) {
      router.push('/');
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  // Trigger login when pin reaches 4 digits
  React.useEffect(() => {
    if (pin.length === 4) {
      setTimeout(handleSubmit, 300);
    }
  }, [pin]);

  return (
    <div className="h-screen w-full bg-navy-950 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sapphire/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl premium-gradient flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-blue/20">
            <Wine className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-white font-outfit uppercase tracking-tighter">
            LIQUOR<span className="text-brand-blue">PRO</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 tracking-widest text-[10px] uppercase flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-brand-blue" />
            Kenya Retail OS • Secure Access
          </p>
        </div>

        <div className="glass-card p-10 rounded-[3rem] border-white/5 shadow-3xl bg-navy-900/50 backdrop-blur-xl">
          <div className="flex flex-col items-center mb-10">
            <div className="flex gap-4 mb-4">
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all duration-300",
                    pin.length > i 
                      ? "bg-brand-blue border-brand-blue shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                      : "border-white/10"
                  )}
                />
              ))}
            </div>
            {error ? (
              <span className="text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={14} /> Invalid PIN
              </span>
            ) : (
              <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Enter Staff PIN</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'DEL'].map((val) => (
              <button
                key={val}
                onClick={() => {
                  if (val === 'C') handleClear();
                  else if (val === 'DEL') handleBackspace();
                  else handleKeyPress(val.toString());
                }}
                className={cn(
                  "h-20 rounded-2xl flex items-center justify-center text-2xl font-black transition-all active:scale-90",
                  val === 'DEL' || val === 'C' 
                    ? "bg-white/5 text-slate-500 hover:text-white"
                    : "bg-white/5 text-white hover:bg-brand-blue hover:shadow-lg hover:shadow-brand-blue/20"
                )}
              >
                {val === 'DEL' ? <Delete size={24} /> : val}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest underline decoration-brand-blue/20 underline-offset-8 decoration-2">
            Forgot PIN? Contact System Administrator
          </p>
        </div>
      </motion.div>
    </div>
  );
}
