"use client";

import React, { useRef } from 'react';
import { Printer, Download, Share2, X, ShieldCheck, CheckCircle, FileText, Wine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusinessStore } from '@/store/businessStore';
import { cn } from '@/lib/utils';

interface ReceiptPreviewProps {
  items: any[];
  total: number;
  subtotal: number;
  tax: number;
  waiterName?: string;
  orderId?: string;
  onClose: () => void;
  onConfirm?: () => void; // Optional: If provided, shows a "Confirm & Send" button
  isConfirmed?: boolean;
}

export default function ReceiptPreview({ 
  items, 
  total, 
  subtotal, 
  tax, 
  waiterName, 
  orderId, 
  onClose, 
  onConfirm,
  isConfirmed = false
}: ReceiptPreviewProps) {
  const { businessName, currency, paybill, paybillAccount, businessTill } = useBusinessStore();
  const receiptRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownload = () => {
    if (typeof window !== 'undefined') {
       // Using window.print() as a standard for generating PDF in browsers
       window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-navy-950/95 backdrop-blur-xl" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="relative w-[310px] max-h-[85vh] bg-white text-slate-950 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
      >
        {/* Decorative Top Bar */}
        <div className="h-2 w-full premium-gradient" />

        {/* Receipt Content Area (Scrollable) */}
        <div ref={receiptRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar receipt-print-area max-h-[60vh] sm:max-h-[70vh]">
            {/* Header */}
            <div className="text-center mb-4">
                <div className="w-10 h-10 bg-navy-950 rounded-xl flex items-center justify-center text-white mx-auto mb-2 shadow-lg">
                    <Wine size={20} className="text-brand-blue" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tighter leading-none mb-1 text-navy-950">{businessName}</h2>
                <p className="text-[7px] text-slate-500 font-black uppercase tracking-[2px]">Fiscal Bill</p>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y-2 border-dashed border-slate-200 mb-8">
                <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block tracking-widest mb-1">Terminal ID</span>
                    <p className="text-xs font-bold text-slate-800">#POS-001-HQ</p>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase block tracking-widest mb-1">Date & Time</span>
                    <p className="text-xs font-bold text-slate-800">{now.toLocaleDateString()} {now.toLocaleTimeString()}</p>
                </div>
                {waiterName && (
                  <div className="mt-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase block tracking-widest mb-1">Served By</span>
                      <p className="text-xs font-bold text-slate-800 uppercase">{waiterName}</p>
                  </div>
                )}
                {orderId && (
                  <div className="mt-2 text-right">
                      <span className="text-[9px] font-black text-slate-400 uppercase block tracking-widest mb-1">Order Ref</span>
                      <p className="text-xs font-bold text-slate-800">{orderId}</p>
                  </div>
                )}
            </div>

            {/* Item List */}
            <div className="space-y-2 mb-4">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[10px]">
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 uppercase leading-none mb-0.5">{item.name}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] text-slate-500">{item.quantity} x {currency} {item.price.toLocaleString()}</span>
                            </div>
                        </div>
                        <span className="font-bold text-slate-950">{currency} {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
            </div>

            {/* Payment Portal */}
            {(paybill || businessTill) && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[4px] mb-3">Payment Portal</p>
                  <div className="flex justify-center gap-6">
                      {paybill && (
                        <div className="text-center">
                            <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">PAYBILL: {paybill}</span>
                            <p className="text-sm font-black text-navy-950 tracking-tighter uppercase">ACC: {paybillAccount || 'BUSINESS'}</p>
                        </div>
                      )}
                      {businessTill && (
                        <div className="text-center">
                            <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">TILL NUMBER</span>
                            <p className="text-sm font-black text-brand-blue tracking-tighter">{businessTill}</p>
                        </div>
                      )}
                  </div>
              </div>
            )}

            {/* Totals Section */}
            <div className="space-y-1.5 pt-3 border-t border-dashed border-slate-300">
                <div className="flex justify-between text-[9px] font-bold text-slate-600">
                    <span>SUB + TAX</span>
                    <span>{currency} {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-black text-slate-950 pt-1.5 border-t border-slate-100 mt-1.5">
                    <span>PAYABLE</span>
                    <span>{currency} {total.toLocaleString()}</span>
                </div>
            </div>

            {/* Compliance Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-[8px] text-slate-400 font-bold mb-2 uppercase tracking-widest">Smart-Mini Receipt Engine v2.0</p>
                <div className="flex justify-center mb-4 grayscale opacity-20">
                    <FileText size={30} />
                </div>
                <p className="text-[9px] text-slate-900 font-black italic">Thank you for your business!</p>
            </div>
        </div>

        {/* Action Controls - Not visible in print */}
        <div className="p-6 bg-navy-950 flex flex-col sm:flex-row gap-3 print:hidden">
            {onConfirm && !isConfirmed ? (
                <button 
                  onClick={onConfirm}
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-5 flex items-center justify-center gap-3 transition-all font-black text-base shadow-xl shadow-emerald-500/20"
                >
                    <CheckCircle size={24} /> CONFIRM & COMMIT
                </button>
            ) : (
                <>
                    <button 
                      onClick={handleDownload}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-2xl py-5 flex items-center justify-center gap-3 transition-all font-bold text-sm"
                    >
                        <Download size={20} /> DOWNLOAD
                    </button>
                    <button 
                      onClick={handlePrint}
                      className="flex-[1.5] bg-brand-blue hover:bg-sapphire text-white rounded-2xl py-5 flex items-center justify-center gap-3 transition-all font-black text-sm shadow-xl shadow-brand-blue/20"
                    >
                        <Printer size={20} /> PRINT RECEIPT
                    </button>
                </>
            )}
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-white hover:text-brand-blue transition-all border border-slate-200 print:hidden z-10"
        >
          <X size={20} />
        </button>
      </motion.div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .receipt-print-area, .receipt-print-area * { visibility: visible !important; }
          .receipt-print-area { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 80mm !important;
            margin: 0 !important; 
            padding: 4mm !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }
          @page { size: auto; margin: 0; }
        }
        @media (max-width: 640px) {
           .receipt-print-area { padding: 1.5rem !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
