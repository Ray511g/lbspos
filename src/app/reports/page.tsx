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
  const filteredOrders = completedOrders.filter(o => {
      const matchesWaiter = filterWaiter === 'All' || o.waiterName === filterWaiter;
      const orderMonth = new Date(o.timestamp).toLocaleString('default', { month: 'long', year: 'numeric' });
      const matchesMonth = filterMonth === 'All' || orderMonth === filterMonth;
      
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
        <div className="flex gap-4 w-full lg:w-auto">
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
                onClick={handleExportPDF}
                className="flex-1 lg:flex-none flex items-center justify-center gap-3 premium-gradient px-8 py-4 rounded-2xl text-white font-black shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
            >
                <Printer size={18} /> Generate PDF
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

      <div className="glass-card rounded-[3rem] overflow-hidden border-white/5">
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

      {/* Print View Style */}
      <style jsx global>{`
        @media print {
          .no-print, .lg\\:hidden, button { display: none !important; }
          body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
          .glass-card { 
            background: white !important; 
            color: black !important; 
            border: 1px solid #eee !important; 
            box-shadow: none !important; 
            border-radius: 2rem !important;
            margin-bottom: 2rem !important;
            padding: 2rem !important;
          }
          .text-white { color: black !important; }
          .text-slate-500, .text-slate-400 { color: #666 !important; }
          .bg-brand-blue, .premium-gradient { background: #000 !important; color: white !important; -webkit-print-color-adjust: exact; }
          .text-brand-blue { color: #000 !important; }
          table { width: 100% !important; border-collapse: collapse !important; font-size: 10pt !important; }
          th { background: #f8f8f8 !important; border-bottom: 2px solid #000 !important; padding: 12px !important; }
          td { border-bottom: 1px solid #eee !important; padding: 12px !important; }
          h1 { font-size: 24pt !important; margin-bottom: 0.5rem !important; }
          .grid { display: block !important; }
          .grid > div { width: 100% !important; margin-bottom: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
