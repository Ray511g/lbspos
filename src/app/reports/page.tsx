"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  User, 
  Download,
  Calendar,
  Wine,
  Filter,
  FileText,
  Search,
  ChevronDown,
  Printer,
  X
} from 'lucide-react';
import { useBusinessStore } from '@/store/businessStore';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const { completedOrders, currency, products } = useBusinessStore();
  
  // States for filters
  const [filterWaiter, setFilterWaiter] = useState('All');
  const [filterProduct, setFilterProduct] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Derived filter options
  const waiters = Array.from(new Set(completedOrders.map(o => o.waiterName)));
  const productNames = products.map(p => p.name);
  const months = Array.from(new Set(completedOrders.map(o => {
      const d = new Date(o.timestamp);
      return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  })));

  // Filter application
  const today = new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' });
  
  const filteredOrders = completedOrders.filter(o => {
      const matchesWaiter = filterWaiter === 'All' || o.waiterName === filterWaiter;
      const d = new Date(o.timestamp);
      const orderMonth = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      const isToday = d.toDateString() === new Date().toDateString();
      
      const matchesMonth = filterMonth === 'All' 
          ? true 
          : filterMonth === 'Today' 
              ? isToday 
              : orderMonth === filterMonth;
      
      const matchesProduct = filterProduct === 'All' || o.items.some(i => i.name === filterProduct);
      
      return matchesWaiter && matchesMonth && matchesProduct;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = filteredOrders.length;
  
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-10 pb-20 no-print">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-blue mb-1 font-black uppercase tracking-[4px] text-[10px]">
             Fiscal Intelligence Unit
          </div>
          <h1 className="text-5xl font-black text-white font-outfit mb-2">Detailed <span className="text-brand-blue">Analytics</span></h1>
          <p className="text-slate-400 font-medium">Filtered overview of filtered movement and financial settlements.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                    "flex-1 lg:flex-none flex items-center justify-center gap-3 border px-6 py-4 rounded-2xl font-bold transition-all text-sm uppercase tracking-widest",
                    showFilters ? "bg-brand-blue border-brand-blue text-white" : "bg-white/5 border-white/10 text-slate-400"
                )}
            >
                <Filter size={18} /> Filters
            </button>
            <button 
                onClick={() => { setFilterMonth('Today'); setTimeout(() => window.print(), 200); }}
                className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-2xl text-emerald-500 font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
            >
                <Download size={18} /> Daily Sales
            </button>
            <button 
                onClick={() => { setFilterMonth('All'); setTimeout(() => window.print(), 200); }}
                className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-brand-blue/10 border border-brand-blue/20 px-8 py-4 rounded-2xl text-brand-blue font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
            >
                <FileText size={18} /> Stock Report
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <AnimatePresence>
          {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                  <div className="glass-card p-10 rounded-[3rem] border-white/10 bg-white/5 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Target Waiter</label>
                              <select 
                                value={filterWaiter}
                                onChange={e => setFilterWaiter(e.target.value)}
                                className="w-full bg-navy-950 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                              >
                                  <option value="All">Everyone Combined</option>
                                  {waiters.map(w => <option key={w} value={w}>{w}</option>)}
                              </select>
                          </div>
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Product Stream</label>
                              <select 
                                value={filterProduct}
                                onChange={e => setFilterProduct(e.target.value)}
                                className="w-full bg-navy-950 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                              >
                                  <option value="All">All Inventory Items</option>
                                  {productNames.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                          </div>
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Reporting Period</label>
                              <select 
                                value={filterMonth}
                                onChange={e => setFilterMonth(e.target.value)}
                                className="w-full bg-navy-950 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                              >
                                  <option value="All">Lifetime History</option>
                                  <option value="Today">Today's Settlements</option>
                                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                          </div>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Stats Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Calculated Revenue', value: `${currency} ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-brand-blue' },
          { label: 'Settled Transactions', value: totalOrders, icon: ShoppingBag, color: 'text-emerald-400' },
          { label: 'Avg Sale Value', value: `${currency} ${totalOrders ? (totalRevenue / totalOrders).toFixed(0) : 0}`, icon: BarChart3, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div key={i} className="glass-card p-8 rounded-[2.5rem] border-white/5">
             <div className="p-3 rounded-2xl bg-white/5 w-fit mb-4"><stat.icon size={20} className={stat.color} /></div>
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
             <div className="text-3xl font-black text-white font-outfit mt-1">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-[3rem] overflow-hidden border-white/5 no-print">
          <table className="w-full text-left">
              <thead>
                  <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-6">ID / Timestamp</th>
                      <th className="px-8 py-6">Staff Member</th>
                      <th className="px-8 py-6">Items Purchased</th>
                      <th className="px-8 py-6 text-right">Settled Amount</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                  {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-white/[0.02] text-xs transition-colors group">
                          <td className="px-8 py-6">
                              <span className="text-white font-bold block">{order.id}</span>
                              <span className="text-[10px] text-slate-500">{new Date(order.timestamp).toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-black uppercase text-[10px]">{order.waiterName.charAt(0)}</div>
                                  <span className="text-white font-bold">{order.waiterName}</span>
                              </div>
                          </td>
                          <td className="px-8 py-6">
                              <div className="space-y-1">
                                  {order.items.map((item: any, idx: number) => (
                                      <div key={idx} className="text-slate-400 text-[10px] font-bold">
                                          {item.quantity} x {item.name}
                                      </div>
                                  ))}
                              </div>
                          </td>
                          <td className="px-8 py-6 text-right font-black text-white">
                              {currency} {order.total.toLocaleString()}
                          </td>
                      </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                      <tr>
                          <td colSpan={4} className="py-20 text-center">
                              <FileText size={48} className="mx-auto mb-4 text-slate-700" />
                              <p className="text-slate-500 font-black uppercase">No records found for current filters</p>
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>

      {/* DEDICATED PRINT DATA VIEW (Hidden in screen, visible in print) */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-10 z-[500] pdf-container">
          <div className="text-center mb-10 border-b-2 border-black pb-6">
              <h1 className="text-3xl font-black uppercase">{useBusinessStore.getState().businessName}</h1>
              <p className="text-sm font-bold mt-2 uppercase tracking-[3px]">Financial Movement / Settlement Report</p>
              <div className="flex justify-between mt-6 text-[10px] font-bold uppercase">
                  <span>Scope: {filterMonth === 'Today' ? "Daily Sales" : filterMonth}</span>
                  <span>Generated: {new Date().toLocaleString()}</span>
                  <span>Currency: {currency}</span>
              </div>
          </div>

          <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                  <tr className="bg-slate-100 text-[10px] font-bold uppercase border border-slate-300">
                      <th className="p-4 border border-slate-300">Order ID / Date</th>
                      <th className="p-4 border border-slate-300">Waiter</th>
                      <th className="p-4 border border-slate-300">Products & Quantities</th>
                      <th className="p-4 border border-slate-300 text-right">Total ({currency})</th>
                  </tr>
              </thead>
              <tbody>
                  {filteredOrders.map(order => (
                      <tr key={order.id} className="text-[10px] border border-slate-300">
                          <td className="p-4 border border-slate-300">
                              <div className="font-bold">{order.id}</div>
                              <div className="text-[8px] text-slate-500">{new Date(order.timestamp).toLocaleString()}</div>
                          </td>
                          <td className="p-4 border border-slate-300 font-bold uppercase">{order.waiterName}</td>
                          <td className="p-4 border border-slate-300">
                              {order.items.map((i:any) => `${i.quantity} x ${i.name}`).join(', ')}
                          </td>
                          <td className="p-4 border border-slate-300 text-right font-black">
                              {order.total.toLocaleString()}
                          </td>
                      </tr>
                  ))}
              </tbody>
              <tfoot>
                  <tr className="bg-slate-50 font-black uppercase text-sm border border-slate-300">
                      <td colSpan={3} className="p-4 border border-slate-300 text-right tracking-widest underline text-[10px]">Total Overdue/Settled Balance</td>
                      <td className="p-4 border border-slate-300 text-right text-lg border-l-2 border-l-black">{currency} {totalRevenue.toLocaleString()}</td>
                  </tr>
              </tfoot>
          </table>

          {/* STOCK AUDIT ADDON */}
          <div className="mt-12 page-break-before">
              <h3 className="text-lg font-black uppercase border-b-2 border-black mb-4">Live Inventory Audit</h3>
              <table className="w-full text-left border-collapse border border-slate-300">
                  <thead>
                      <tr className="bg-slate-100 text-[10px] font-bold uppercase border border-slate-300">
                          <th className="p-4 border border-slate-300">Inventory Item</th>
                          <th className="p-4 border border-slate-300">Current Stock</th>
                          <th className="p-4 border border-slate-300 text-right">Unit Value</th>
                      </tr>
                  </thead>
                  <tbody>
                      {products.map(p => (
                          <tr key={p.id} className="text-[10px] border border-slate-300">
                              <td className="p-4 border border-slate-300 font-bold uppercase">{p.name}</td>
                              <td className="p-4 border border-slate-300 font-black">{p.stock} Units Remaining</td>
                              <td className="p-4 border border-slate-300 text-right">{currency} {p.price.toLocaleString()}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          <div className="mt-10 text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              End of Automated Financial & Inventory Document
          </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print, nav, #sidebar, .lg\\:hidden, button, header, .glass-card { display: none !important; }
          body, html { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; width: 100% !important; height: auto !important; overflow: visible !important; }
          main { overflow: visible !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
