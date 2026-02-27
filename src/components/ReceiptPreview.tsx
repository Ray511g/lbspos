"use client";

import React from 'react';
import { Printer, Download, Share2, X, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBusinessStore } from '@/store/businessStore';

interface ReceiptPreviewProps {
  items: any[];
  total: number;
  subtotal: number;
  tax: number;
  onClose: () => void;
}

export default function ReceiptPreview({ items, total, subtotal, tax, onClose }: ReceiptPreviewProps) {
  const { businessName, currency } = useBusinessStore();
  const now = new Date();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-navy-950/90 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-md bg-white text-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Receipt Header */}
        <div className="bg-slate-50 p-8 text-center border-b-2 border-dashed border-slate-200">
           <div className="w-16 h-16 bg-navy-950 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 font-black text-xl tracking-tighter">
             LP
           </div>
           <h2 className="text-xl font-black uppercase tracking-tight">{businessName}</h2>
           <p className="text-xs text-slate-500 font-bold mt-1">Liquor Terminal #001</p>
           <p className="text-[10px] text-slate-400 mt-2">{now.toLocaleString()}</p>
        </div>

        {/* Items */}
        <div className="flex-1 p-8 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar">
           {items.map((item, idx) => (
             <div key={idx} className="flex justify-between text-sm">
                <div className="flex-1">
                  <p className="font-bold text-slate-800 uppercase text-xs">{item.name}</p>
                  <p className="text-[10px] text-slate-500">{item.quantity} x {currency} {item.price.toLocaleString()}</p>
                  {item.type === 'Returnable' && (
                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-tighter leading-none mt-1">Incl. Bottle Deposit</p>
                  )}
                </div>
                <span className="font-black text-slate-900">{currency} {(item.price * item.quantity).toLocaleString()}</span>
             </div>
           ))}
        </div>

        {/* Totals */}
        <div className="p-8 bg-slate-50 border-t-2 border-dashed border-slate-200 space-y-2">
           <div className="flex justify-between text-xs font-bold text-slate-500">
             <span>SUBTOTAL</span>
             <span>{currency} {subtotal.toLocaleString()}</span>
           </div>
           <div className="flex justify-between text-xs font-bold text-slate-500">
             <span>TAX (VAT 16.0%)</span>
             <span>{currency} {tax.toLocaleString()}</span>
           </div>
           <div className="flex justify-between text-2xl font-black text-slate-900 pt-2">
             <span>TOTAL</span>
             <span>{currency} {total.toLocaleString()}</span>
           </div>
           <div className="text-[9px] text-center text-slate-400 pt-6 font-bold uppercase tracking-[3px] flex items-center justify-center gap-2">
             <ShieldCheck size={12} className="text-emerald-500" />
             KRA E-TIMS VALIDATED
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-navy-950 flex gap-2">
           <button className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl py-4 flex items-center justify-center gap-2 transition-all font-bold text-xs">
             <Share2 size={16} /> SHARE
           </button>
           <button onClick={() => window.print()} className="flex-[2] bg-brand-blue hover:bg-sapphire text-white rounded-xl py-4 flex items-center justify-center gap-2 transition-all font-black text-xs shadow-lg shadow-brand-blue/20">
             <Printer size={16} /> PRINT RECEIPT
           </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-all"
        >
          <X size={16} />
        </button>
      </motion.div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
