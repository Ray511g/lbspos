"use client";

import React, { useRef } from 'react';
import { Printer, Download, X, CheckCircle, FileText, Wine, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBusinessStore } from '@/store/businessStore';

interface ReceiptPreviewProps {
  items: any[];
  total: number;
  subtotal: number;
  tax: number;
  waiterName?: string;
  orderId?: string;
  paymentMethod?: string;
  onClose: () => void;
  onConfirm?: () => void; // If provided: shows "Confirm & Send" button (waiter order slip)
  isConfirmed?: boolean;
}

export default function ReceiptPreview({
  items,
  total,
  subtotal,
  tax,
  waiterName,
  orderId,
  paymentMethod,
  onClose,
  onConfirm,
  isConfirmed = false
}: ReceiptPreviewProps) {
  const { businessName, currency, paybill, paybillAccount, businessTill } = useBusinessStore();
  const receiptRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  // --- FIXED: Print only the receipt content using a hidden iframe ---
  const handlePrint = () => {
    const receiptEl = receiptRef.current;
    if (!receiptEl) return;

    const printWindow = window.open('', '_blank', 'width=400,height=700');
    if (!printWindow) {
      alert('Please allow popups to print receipts.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${businessName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; width: 80mm; margin: 0 auto; padding: 4mm; background: white; color: black; }
          h2 { font-size: 14px; font-weight: 900; text-transform: uppercase; text-align: center; }
          .center { text-align: center; }
          .label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #777; display: block; }
          .value { font-size: 10px; font-weight: 700; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px 0; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; margin: 10px 0; }
          .items { margin: 10px 0; }
          .item { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; }
          .item-sub { font-size: 8px; color: #666; }
          .divider { border-top: 1px dashed #ccc; margin: 8px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; }
          .grand-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; padding-top: 6px; }
          .payment-box { background: #f5f5f5; border: 1px solid #eee; border-radius: 6px; padding: 8px; text-align: center; margin: 10px 0; }
          .footer { text-align: center; margin-top: 16px; font-size: 8px; color: #999; }
          @media print { @page { size: 80mm auto; margin: 0; } }
        </style>
      </head>
      <body>
        <div class="center" style="margin-bottom: 10px;">
          <h2>${businessName}</h2>
          <span class="label">Official Receipt</span>
        </div>
        <div class="meta">
          <div><span class="label">Date</span><span class="value">${now.toLocaleDateString()}</span></div>
          <div style="text-align:right"><span class="label">Time</span><span class="value">${now.toLocaleTimeString()}</span></div>
          ${waiterName ? `<div><span class="label">Served By</span><span class="value">${waiterName.toUpperCase()}</span></div>` : ''}
          ${orderId ? `<div style="text-align:right"><span class="label">Order Ref</span><span class="value">${orderId}</span></div>` : ''}
          ${paymentMethod ? `<div><span class="label">Payment</span><span class="value">${paymentMethod}</span></div>` : ''}
        </div>
        <div class="items">
          ${items.map(item => `
            <div class="item">
              <div>
                <div style="font-weight:700;text-transform:uppercase;">${item.name}</div>
                <div class="item-sub">${item.quantity} x ${currency} ${item.price.toLocaleString()}</div>
              </div>
              <span>${currency} ${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
        <div class="divider"></div>
        <div class="total-row"><span>Subtotal</span><span>${currency} ${subtotal.toFixed(0)}</span></div>
        <div class="total-row" style="color:#666;"><span>Tax (16% VAT)</span><span>${currency} ${tax.toFixed(0)}</span></div>
        <div class="divider"></div>
        <div class="grand-total"><span>TOTAL</span><span>${currency} ${total.toLocaleString()}</span></div>
        ${(paybill || businessTill) ? `
        <div class="payment-box">
          <span class="label" style="margin-bottom:6px;">M-Pesa Payment Options</span>
          ${paybill ? `<div class="total-row"><span>Paybill:</span><span>${paybill} | Acc: ${paybillAccount || 'BUSINESS'}</span></div>` : ''}
          ${businessTill ? `<div class="total-row"><span>Till:</span><span>${businessTill}</span></div>` : ''}
        </div>` : ''}
        <div class="footer">
          <p>Thank you for your business!</p>
          <p style="margin-top:4px;">Powered by BarPOS LBSPOS</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  // --- FIXED: Download as a named file using Blob + anchor ---
  const handleDownload = () => {
    const receiptEl = receiptRef.current;
    if (!receiptEl) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${businessName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; width: 80mm; margin: 0 auto; padding: 10mm; background: white; color: black; }
          h2 { font-size: 14px; font-weight: 900; text-transform: uppercase; text-align: center; }
          .center { text-align: center; }
          .label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #777; display: block; }
          .value { font-size: 10px; font-weight: 700; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px 0; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; margin: 10px 0; }
          .items { margin: 10px 0; }
          .item { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; }
          .item-sub { font-size: 8px; color: #666; }
          .divider { border-top: 1px dashed #ccc; margin: 8px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; }
          .grand-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; padding-top: 6px; }
          .payment-box { background: #f5f5f5; border: 1px solid #eee; border-radius: 6px; padding: 8px; text-align: center; margin: 10px 0; }
          .footer { text-align: center; margin-top: 16px; font-size: 8px; color: #999; }
        </style>
      </head>
      <body>
        <div class="center" style="margin-bottom: 10px;">
          <h2>${businessName}</h2>
          <span class="label">Official Receipt</span>
        </div>
        <div class="meta">
          <div><span class="label">Date</span><span class="value">${now.toLocaleDateString()}</span></div>
          <div style="text-align:right"><span class="label">Time</span><span class="value">${now.toLocaleTimeString()}</span></div>
          ${waiterName ? `<div><span class="label">Served By</span><span class="value">${waiterName.toUpperCase()}</span></div>` : ''}
          ${orderId ? `<div style="text-align:right"><span class="label">Order Ref</span><span class="value">${orderId}</span></div>` : ''}
          ${paymentMethod ? `<div><span class="label">Payment</span><span class="value">${paymentMethod}</span></div>` : ''}
        </div>
        <div class="items">
          ${items.map(item => `
            <div class="item">
              <div>
                <div style="font-weight:700;text-transform:uppercase;">${item.name}</div>
                <div class="item-sub">${item.quantity} x ${currency} ${item.price.toLocaleString()}</div>
              </div>
              <span>${currency} ${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
        <div class="divider"></div>
        <div class="total-row"><span>Subtotal</span><span>${currency} ${subtotal.toFixed(0)}</span></div>
        <div class="total-row" style="color:#666;"><span>Tax (16% VAT)</span><span>${currency} ${tax.toFixed(0)}</span></div>
        <div class="divider"></div>
        <div class="grand-total"><span>TOTAL</span><span>${currency} ${total.toLocaleString()}</span></div>
        ${(paybill || businessTill) ? `
        <div class="payment-box">
          <span class="label" style="margin-bottom:6px;">M-Pesa Payment Options</span>
          ${paybill ? `<div class="total-row"><span>Paybill:</span><span>${paybill} | Acc: ${paybillAccount || 'BUSINESS'}</span></div>` : ''}
          ${businessTill ? `<div class="total-row"><span>Till:</span><span>${businessTill}</span></div>` : ''}
        </div>` : ''}
        <div class="footer">
          <p>Thank you for your business!</p>
          <p style="margin-top:4px;">Powered by BarPOS LBSPOS</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${orderId || Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isWaiterOrderSlip = !!onConfirm && !isConfirmed;

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
        className="relative w-[320px] max-h-[90vh] bg-white text-slate-950 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
      >
        {/* Decorative Stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-brand-blue to-purple-500 flex-shrink-0" />

        {/* Scrollable Receipt Body */}
        <div ref={receiptRef} className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: '60vh' }}>
          {/* Header */}
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white mx-auto mb-2 shadow-lg">
              <Wine size={22} className="text-brand-blue" />
            </div>
            <h2 className="text-base font-black uppercase tracking-tighter text-slate-900">{businessName}</h2>
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-[3px]">
              {isWaiterOrderSlip ? 'Order Slip' : 'Official Receipt'}
            </p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-3 border-y border-dashed border-slate-200 text-[10px]">
            <div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Date</span>
              <span className="font-bold text-slate-800">{now.toLocaleDateString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Time</span>
              <span className="font-bold text-slate-800">{now.toLocaleTimeString()}</span>
            </div>
            {waiterName && (
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Served By</span>
                <span className="font-bold text-slate-800 uppercase">{waiterName}</span>
              </div>
            )}
            {orderId && (
              <div className="text-right">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Order Ref</span>
                <span className="font-bold text-slate-800">{orderId}</span>
              </div>
            )}
            {paymentMethod && (
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Payment</span>
                <span className="font-bold text-slate-800">{paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start text-[10px]">
                <div className="flex-1 pr-2">
                  <h4 className="font-bold text-slate-900 uppercase leading-none">{item.name}</h4>
                  <span className="text-[8px] text-slate-400">{item.quantity} x {currency} {item.price.toLocaleString()}</span>
                </div>
                <span className="font-black text-slate-950 tabular-nums">{currency} {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 pt-3 border-t border-dashed border-slate-200">
            <div className="flex justify-between text-[9px] font-bold text-slate-500">
              <span>Subtotal</span>
              <span>{currency} {subtotal.toFixed ? subtotal.toFixed(0) : subtotal}</span>
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-500">
              <span>VAT (16%)</span>
              <span>{currency} {tax.toFixed ? tax.toFixed(0) : tax}</span>
            </div>
            <div className="flex justify-between items-center text-base font-black text-slate-950 pt-2 border-t border-slate-100 mt-1">
              <span>TOTAL</span>
              <span>{currency} {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Portal */}
          {(paybill || businessTill) && !isWaiterOrderSlip && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-[3px] mb-2">Pay Via M-Pesa</p>
              <div className="flex justify-center gap-6">
                {paybill && (
                  <div className="text-center">
                    <span className="text-[8px] font-black text-slate-500 block">Paybill: {paybill}</span>
                    <span className="text-xs font-black text-slate-900">Acc: {paybillAccount || 'BUSINESS'}</span>
                  </div>
                )}
                {businessTill && (
                  <div className="text-center">
                    <span className="text-[8px] font-black text-slate-500 block">Till No.</span>
                    <span className="text-xs font-black text-brand-blue">{businessTill}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-[8px] text-slate-400 font-bold italic">Thank you for your business!</p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-950 flex gap-2 flex-shrink-0">
          {isWaiterOrderSlip ? (
            // Waiter order slip: show Send button + print/download
            <>
              <button
                onClick={handlePrint}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-all font-bold text-xs"
              >
                <Printer size={16} /> PRINT
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-all font-bold text-xs"
              >
                <FileText size={16} /> SAVE
              </button>
              <button
                onClick={onConfirm}
                className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-all font-black text-xs shadow-lg shadow-emerald-500/20"
              >
                <Send size={16} /> SEND ORDER
              </button>
            </>
          ) : (
            // Confirmed receipt: show Download + Print
            <>
              <button
                onClick={handleDownload}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-all font-bold text-xs"
              >
                <FileText size={16} /> DOWNLOAD
              </button>
              <button
                onClick={handlePrint}
                className="flex-[1.5] bg-brand-blue hover:bg-blue-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-all font-black text-xs shadow-lg shadow-brand-blue/20"
              >
                <Printer size={16} /> PRINT
              </button>
            </>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-white hover:text-red-500 transition-all border border-slate-200 z-10"
        >
          <X size={18} />
        </button>
      </motion.div>
    </div>
  );
}
