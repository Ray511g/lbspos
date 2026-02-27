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
  const { businessName, currency, paybill, businessTill } = useBusinessStore();
  const receiptRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
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
        className="relative w-full max-w-lg bg-white text-slate-950 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
      >
        {/* Decorative Top Bar */}
        <div className="h-2 w-full premium-gradient" />

        {/* Receipt Content Area (Scrollable) */}
        <div ref={receiptRef} className="flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar receipt-print-area">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-navy-950 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
                    <Wine size={40} className="text-brand-blue" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1 text-navy-950">{businessName}</h2>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="h-[1px] w-8 bg-slate-200" />
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Digital Audit Trail</p>
                    <span className="h-[1px] w-8 bg-slate-200" />
                </div>
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
            <div className="space-y-6 mb-10">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-slate-900 uppercase leading-none mb-1">{item.name}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold">{item.quantity}x</span>
                                <span className="text-[10px] text-slate-500 font-medium">{currency} {item.price.toLocaleString()}</span>
                            </div>
                        </div>
                        <span className="text-sm font-black text-slate-950">{currency} {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
            </div>

            {/* Payment Portal */}
            {(paybill || businessTill) && (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-10 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-4">Payment Instructions</p>
                  <div className="flex justify-center gap-8">
                      {paybill && (
                        <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">PAYBILL</span>
                            <p className="text-lg font-black text-navy-950 tracking-tighter">{paybill}</p>
                        </div>
                      )}
                      {businessTill && (
                        <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">BUY GOODS TILL</span>
                            <p className="text-lg font-black text-brand-blue tracking-tighter">{businessTill}</p>
                        </div>
                      )}
                  </div>
              </div>
            )}

            {/* Totals Section */}
            <div className="space-y-3 pt-6 border-t-2 border-dashed border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span className="tracking-widest">SUBTOTAL</span>
                    <span>{currency} {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span className="tracking-widest capitalize">VAT ({useBusinessStore.getState().taxRate}%)</span>
                    <span>{currency} {tax.toLocaleString()}</span>
                </div>
                <div className="h-4" />
                <div className="flex justify-between items-center text-3xl sm:text-4xl font-black text-slate-950 tracking-tighter">
                    <span>TOTAL</span>
                    <div className="flex flex-col items-end">
                        <span className="leading-none">{currency} {total.toLocaleString()}</span>
                        <div className="h-1 w-full premium-gradient mt-2 opacity-30" />
                    </div>
                </div>
            </div>

            {/* Compliance Footer */}
            <div className="mt-12 flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">KRA E-TIMS VALIDATED</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold max-w-[200px]">Thank you for your business. Please come again!</p>
                <div className="opacity-10 grayscale py-4">
                  {/* barcode placeholder or logo */}
                   <FileText size={40} className="text-slate-950" />
                </div>
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
          body * { visibility: hidden; }
          .receipt-print-area, .receipt-print-area * { visibility: visible; }
          .receipt-print-area { 
            position: fixed; 
            left: 0; 
            top: 0; 
            width: 100%; 
            max-width: 80mm;
            margin: 0 auto; 
            padding: 5mm;
            background: white;
          }
          .custom-scrollbar { overflow: visible !important; }
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
