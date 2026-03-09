"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, TrendingUp, Users, Package, CreditCard,
    ChevronDown, ChevronRight, Download, Printer, Eye,
    Calendar, Filter, FileText, AlertTriangle, DollarSign,
    ShoppingBag, ArrowUpRight, Wine
} from 'lucide-react';
import { useBusinessStore } from '@/store/businessStore';
import { cn } from '@/lib/utils';

// ─── Report Definitions ───────────────────────────────────────────────────────

type FilterKey = 'startDate' | 'endDate' | 'month' | 'waiter' | 'category' | 'paymentMethod';

interface ReportDef {
    id: string;
    label: string;
    filters: FilterKey[];
    description: string;
}

interface ReportGroup {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
    reports: ReportDef[];
}

const REPORT_GROUPS: ReportGroup[] = [
    {
        id: 'sales',
        label: 'Sales Reports',
        icon: TrendingUp,
        color: 'text-brand-blue',
        reports: [
            { id: 'daily_sales', label: 'Daily Sales', filters: ['startDate', 'endDate', 'waiter'], description: 'All completed sales within a date range.' },
            { id: 'monthly_summary', label: 'Monthly Summary', filters: ['month', 'waiter'], description: 'Total revenue and transaction count per month.' },
            { id: 'revenue_totals', label: 'Revenue Totals', filters: ['startDate', 'endDate'], description: 'Grand total revenue and average sale value.' },
        ],
    },
    {
        id: 'waiter',
        label: 'Waiter Reports',
        icon: Users,
        color: 'text-purple-400',
        reports: [
            { id: 'sales_per_waiter', label: 'Sales Per Waiter', filters: ['startDate', 'endDate', 'waiter'], description: 'Breakdown of sales performance per staff member.' },
            { id: 'waiter_commission', label: 'Shift Summary', filters: ['startDate', 'endDate', 'waiter'], description: 'Orders handled and total value per waiter shift.' },
        ],
    },
    {
        id: 'stock',
        label: 'Stock Reports',
        icon: Package,
        color: 'text-orange-400',
        reports: [
            { id: 'current_stock', label: 'Current Stock Levels', filters: ['category'], description: 'Live snapshot of all inventory quantities.' },
            { id: 'low_stock', label: 'Low Stock Alert List', filters: ['category'], description: 'All items with stock below the reorder threshold.' },
            { id: 'stock_value', label: 'Stock Value Report', filters: ['category'], description: 'Total monetary value of current inventory.' },
        ],
    },
    {
        id: 'payments',
        label: 'Payment Reports',
        icon: CreditCard,
        color: 'text-emerald-400',
        reports: [
            { id: 'payment_method', label: 'By Payment Method', filters: ['startDate', 'endDate', 'paymentMethod'], description: 'Sales broken down by cash, M-Pesa, and card.' },
            { id: 'mpesa_collection', label: 'M-Pesa Collections', filters: ['startDate', 'endDate'], description: 'All transactions settled via M-Pesa only.' },
        ],
    },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportCenter() {
    const { completedOrders, products, currency, businessName } = useBusinessStore();

    const [expandedGroup, setExpandedGroup] = useState<string | null>('sales');
    const [selectedReport, setSelectedReport] = useState<ReportDef>(REPORT_GROUPS[0].reports[0]);
    const [previewed, setPreviewed] = useState(false);

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [month, setMonth] = useState('');
    const [waiter, setWaiter] = useState('All');
    const [category, setCategory] = useState('All');
    const [paymentMethod, setPaymentMethod] = useState('All');

    // Derived filter options
    const waiters = useMemo(() =>
        ['All', ...Array.from(new Set(completedOrders.map(o => o.waiterName)))], [completedOrders]);
    const categories = useMemo(() =>
        ['All', ...Array.from(new Set(products.map((p: any) => p.category)))], [products]);
    const months = useMemo(() => {
        const m = Array.from(new Set(completedOrders.map(o => {
            const d = new Date(o.timestamp);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        })));
        return m.sort().reverse();
    }, [completedOrders]);

    // ─── Data Engine ──────────────────────────────────────────────────────────
    const reportData = useMemo(() => {
        if (!previewed) return null;

        const filterByDate = (orders: any[]) => {
            return orders.filter(o => {
                const d = new Date(o.timestamp).toISOString().split('T')[0];
                const matchStart = !startDate || d >= startDate;
                const matchEnd = !endDate || d <= endDate;
                const matchMonth = !month || new Date(o.timestamp).toISOString().startsWith(month);
                return matchStart && matchEnd && matchMonth;
            });
        };

        const filterByWaiter = (orders: any[]) =>
            waiter === 'All' ? orders : orders.filter(o => o.waiterName === waiter);
        const filterByPayment = (orders: any[]) =>
            paymentMethod === 'All' ? orders : orders.filter(o => (o.paymentMode || '').toUpperCase() === paymentMethod);
        const filterByCategory = (prods: any[]) =>
            category === 'All' ? prods : prods.filter(p => p.category === category);

        switch (selectedReport.id) {
            case 'daily_sales':
            case 'monthly_summary':
            case 'revenue_totals': {
                const orders = filterByWaiter(filterByDate(completedOrders));
                return { type: 'orders', rows: orders };
            }
            case 'sales_per_waiter': {
                const orders = filterByDate(completedOrders);
                const byWaiter: Record<string, { name: string; count: number; total: number }> = {};
                orders.forEach((o: any) => {
                    if (!byWaiter[o.waiterName]) byWaiter[o.waiterName] = { name: o.waiterName, count: 0, total: 0 };
                    byWaiter[o.waiterName].count += 1;
                    byWaiter[o.waiterName].total += Number(o.total) || 0;
                });
                return { type: 'waiter_summary', rows: Object.values(byWaiter) };
            }
            case 'waiter_commission': {
                const orders = filterByWaiter(filterByDate(completedOrders));
                const byWaiter: Record<string, { name: string; orders: number; total: number }> = {};
                orders.forEach((o: any) => {
                    if (!byWaiter[o.waiterName]) byWaiter[o.waiterName] = { name: o.waiterName, orders: 0, total: 0 };
                    byWaiter[o.waiterName].orders += 1;
                    byWaiter[o.waiterName].total += Number(o.total) || 0;
                });
                return { type: 'shift_summary', rows: Object.values(byWaiter) };
            }
            case 'current_stock': {
                return { type: 'stock', rows: filterByCategory(products) };
            }
            case 'low_stock': {
                const prods = filterByCategory(products).filter((p: any) => p.stock <= (p.threshold || 10));
                return { type: 'low_stock', rows: prods };
            }
            case 'stock_value': {
                const prods = filterByCategory(products);
                return { type: 'stock_value', rows: prods };
            }
            case 'payment_method': {
                const orders = filterByPayment(filterByDate(completedOrders));
                return { type: 'orders', rows: orders };
            }
            case 'mpesa_collection': {
                const orders = filterByDate(completedOrders).filter((o: any) =>
                    (o.paymentMode || '').toUpperCase() === 'MPESA');
                return { type: 'orders', rows: orders };
            }
            default:
                return null;
        }
    }, [previewed, selectedReport, startDate, endDate, month, waiter, category, paymentMethod, completedOrders, products]);

    // ─── Summary Stats ──────────────────────────────────────────────────────────
    const summaryStats = useMemo(() => {
        if (!reportData) return null;
        if (reportData.type === 'orders') {
            const rows = reportData.rows as any[];
            const total = rows.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0);
            return [
                { label: 'Total Transactions', value: rows.length },
                { label: 'Total Revenue', value: `${currency} ${total.toLocaleString()}` },
                { label: 'Avg Sale', value: `${currency} ${rows.length ? (total / rows.length).toFixed(0) : 0}` },
            ];
        }
        if (reportData.type === 'stock' || reportData.type === 'stock_value' || reportData.type === 'low_stock') {
            const rows = reportData.rows as any[];
            const totalValue = rows.reduce((s: number, p: any) => s + (p.stock * p.price), 0);
            return [
                { label: 'Products Listed', value: rows.length },
                { label: 'Total Stock Value', value: `${currency} ${totalValue.toLocaleString()}` },
                { label: 'Low Stock Items', value: rows.filter((p: any) => p.stock <= (p.threshold || 10)).length },
            ];
        }
        if (reportData.type === 'waiter_summary' || reportData.type === 'shift_summary') {
            const rows = reportData.rows as any[];
            const total = rows.reduce((s: number, r: any) => s + (Number(r.total) || 0), 0);
            return [
                { label: 'Staff Members', value: rows.length },
                { label: 'Combined Revenue', value: `${currency} ${total.toLocaleString()}` },
                { label: 'Top Performer', value: rows.sort((a: any, b: any) => b.total - a.total)[0]?.name || '—' },
            ];
        }
        return null;
    }, [reportData, currency]);

    // ─── Print / Download ──────────────────────────────────────────────────────
    const buildPrintHTML = () => {
        if (!reportData) return '';
        const rows = reportData.rows as any[];
        const now = new Date().toLocaleString();
        const filterLabel = [
            startDate && `From: ${startDate}`,
            endDate && `To: ${endDate}`,
            month && `Month: ${month}`,
            waiter !== 'All' && `Waiter: ${waiter}`,
            category !== 'All' && `Category: ${category}`,
            paymentMethod !== 'All' && `Payment: ${paymentMethod}`,
        ].filter(Boolean).join(' | ') || 'No filters applied';

        let tableHTML = '';
        if (reportData.type === 'orders') {
            tableHTML = `
        <table>
          <thead><tr><th>Order ID</th><th>Date & Time</th><th>Waiter</th><th>Items</th><th>Payment</th><th>Total (${currency})</th></tr></thead>
          <tbody>
            ${rows.map((o: any) => `
              <tr>
                <td>${o.id}</td>
                <td>${new Date(o.timestamp).toLocaleString()}</td>
                <td>${o.waiterName || '—'}</td>
                <td>${o.items?.length || 0} items</td>
                <td>${o.paymentMode || 'N/A'}</td>
                <td style="text-align:right;font-weight:700;">${Number(o.total).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot><tr><td colspan="5" style="text-align:right;font-weight:700;">TOTAL</td><td style="text-align:right;font-weight:900;">${rows.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0).toLocaleString()}</td></tr></tfoot>
        </table>`;
        } else if (reportData.type === 'waiter_summary' || reportData.type === 'shift_summary') {
            tableHTML = `
        <table>
          <thead><tr><th>Waiter / Staff</th><th>Orders / Sessions</th><th>Total Revenue (${currency})</th></tr></thead>
          <tbody>${rows.map((r: any) => `<tr><td>${r.name}</td><td>${r.count || r.orders}</td><td style="text-align:right;font-weight:700;">${Number(r.total).toLocaleString()}</td></tr>`).join('')}</tbody>
        </table>`;
        } else if (reportData.type === 'stock' || reportData.type === 'low_stock' || reportData.type === 'stock_value') {
            tableHTML = `
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Unit Price (${currency})</th><th>Total Value (${currency})</th></tr></thead>
          <tbody>${rows.map((p: any) => `<tr><td>${p.name}</td><td>${p.category || '—'}</td><td style="${p.stock <= (p.threshold || 10) ? 'color:red;font-weight:700;' : ''}">${p.stock}</td><td style="text-align:right;">${Number(p.price).toLocaleString()}</td><td style="text-align:right;font-weight:700;">${(p.stock * p.price).toLocaleString()}</td></tr>`).join('')}</tbody>
          <tfoot><tr><td colspan="4" style="text-align:right;font-weight:700;">TOTAL VALUE</td><td style="text-align:right;font-weight:900;">${rows.reduce((s: number, p: any) => s + p.stock * p.price, 0).toLocaleString()}</td></tr></tfoot>
        </table>`;
        }

        return `<!DOCTYPE html><html><head><title>${selectedReport.label} — ${businessName}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; color: #111; }
      h1 { font-size: 18px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px; }
      .meta { font-size: 10px; color: #666; margin-bottom: 16px; }
      .filters { background: #f5f5f5; border: 1px solid #ddd; padding: 8px 12px; border-radius: 4px; font-size: 10px; margin-bottom: 16px; }
      .stats { display: flex; gap: 20px; margin-bottom: 20px; }
      .stat { background: #f9f9f9; border: 1px solid #ddd; padding: 10px 16px; border-radius: 6px; }
      .stat-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #888; }
      .stat-value { font-size: 16px; font-weight: 900; color: #111; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th { background: #111; color: white; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
      td { padding: 7px 8px; border-bottom: 1px solid #eee; font-size: 10px; }
      tr:nth-child(even) { background: #fafafa; }
      tfoot td { background: #f0f0f0; font-weight: 700; border-top: 2px solid #ddd; }
      .footer { text-align: center; margin-top: 24px; font-size: 9px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
      @media print { @page { margin: 10mm; } }
    </style></head>
    <body>
      <h1>${selectedReport.label}</h1>
      <div class="meta">${businessName} &nbsp;|&nbsp; Generated: ${now}</div>
      <div class="filters">🔽 Filters Applied: ${filterLabel}</div>
      ${summaryStats ? `<div class="stats">${summaryStats.map(s => `<div class="stat"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div>`).join('')}</div>` : ''}
      ${tableHTML}
      <div class="footer">Powered by BarPOS LBSPOS | Confidential</div>
    </body></html>`;
    };

    const handlePrint = () => {
        const html = buildPrintHTML();
        if (!html) return;
        const w = window.open('', '_blank', 'width=900,height=700');
        if (!w) { alert('Please allow popups to print.'); return; }
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); w.close(); }, 400);
    };

    const handleDownload = () => {
        const html = buildPrintHTML();
        if (!html) return;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport.id}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const selectReport = (report: ReportDef) => {
        setSelectedReport(report);
        setPreviewed(false);
        setStartDate(''); setEndDate(''); setMonth('');
        setWaiter('All'); setCategory('All'); setPaymentMethod('All');
    };

    return (
        <div className="flex h-[calc(100vh-80px)] -m-6 lg:-m-12 overflow-hidden">

            {/* ── Left Panel: Report Tree ── */}
            <aside className="w-64 bg-navy-900/80 border-r border-white/5 flex flex-col overflow-hidden flex-shrink-0">
                <div className="p-6 border-b border-white/5">
                    <div className="text-[9px] font-black text-brand-blue uppercase tracking-[3px] mb-1">Fiscal Intelligence</div>
                    <h2 className="text-xl font-black text-white font-outfit uppercase">Report Center</h2>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                    {REPORT_GROUPS.map(group => (
                        <div key={group.id}>
                            {/* Group Header */}
                            <button
                                onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <group.icon size={16} className={group.color} />
                                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">{group.label}</span>
                                </div>
                                {expandedGroup === group.id ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                            </button>

                            {/* Report Items */}
                            <AnimatePresence>
                                {expandedGroup === group.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden pl-3"
                                    >
                                        {group.reports.map(report => (
                                            <button
                                                key={report.id}
                                                onClick={() => selectReport(report)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all",
                                                    selectedReport.id === report.id
                                                        ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                <ArrowUpRight size={12} />
                                                <span className="text-[11px] font-bold">{report.label}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* ── Right Panel: Filters + Preview ── */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[3px] mb-1">{selectedReport.description}</p>
                        <h1 className="text-4xl font-black text-white font-outfit uppercase">{selectedReport.label}</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownload}
                            disabled={!previewed || !reportData}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Download size={16} /> Download
                        </button>
                        <button
                            onClick={handlePrint}
                            disabled={!previewed || !reportData}
                            className="flex items-center gap-2 bg-brand-blue px-5 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Printer size={16} /> Print
                        </button>
                    </div>
                </div>

                {/* ── Filter Card ── */}
                <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Filter size={16} /> Report Filters
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Start Date */}
                        {selectedReport.filters.includes('startDate') && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => { setStartDate(e.target.value); setPreviewed(false); }}
                                    className="w-full bg-navy-950 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-brand-blue/50"
                                    title="Start Date"
                                />
                            </div>
                        )}

                        {/* End Date */}
                        {selectedReport.filters.includes('endDate') && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => { setEndDate(e.target.value); setPreviewed(false); }}
                                    className="w-full bg-navy-950 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-brand-blue/50"
                                    title="End Date"
                                />
                            </div>
                        )}

                        {/* Month */}
                        {selectedReport.filters.includes('month') && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Month</label>
                                <select
                                    value={month}
                                    onChange={e => { setMonth(e.target.value); setPreviewed(false); }}
                                    className="w-full bg-navy-950 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                                    title="Select Month"
                                >
                                    <option value="">All Time</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Waiter */}
                        {selectedReport.filters.includes('waiter') && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Waiter / Staff</label>
                                <select
                                    value={waiter}
                                    onChange={e => { setWaiter(e.target.value); setPreviewed(false); }}
                                    className="w-full bg-navy-950 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                                    title="Select Waiter"
                                >
                                    {waiters.map(w => <option key={w} value={w}>{w === 'All' ? 'All Staff' : w}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Category */}
                        {selectedReport.filters.includes('category') && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Category</label>
                                <select
                                    value={category}
                                    onChange={e => { setCategory(e.target.value); setPreviewed(false); }}
                                    className="w-full bg-navy-950 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                                    title="Select Category"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Payment Method */}
                        {selectedReport.filters.includes('paymentMethod') && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={e => { setPaymentMethod(e.target.value); setPreviewed(false); }}
                                    className="w-full bg-navy-950 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                                    title="Select Payment Method"
                                >
                                    <option value="All">All Methods</option>
                                    <option value="CASH">Cash</option>
                                    <option value="MPESA">M-Pesa</option>
                                    <option value="CARD">Card</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Preview Button */}
                    <button
                        onClick={() => setPreviewed(true)}
                        className="flex items-center gap-3 premium-gradient text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Eye size={18} /> Generate Preview
                    </button>
                </div>

                {/* ── Summary Stats ── */}
                <AnimatePresence>
                    {previewed && summaryStats && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                        >
                            {summaryStats.map((s, i) => (
                                <div key={i} className="glass-card p-6 rounded-[2rem] border-white/5">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</div>
                                    <div className="text-2xl font-black text-white font-outfit">{s.value}</div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Preview Table ── */}
                <AnimatePresence>
                    {previewed && reportData && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-[2.5rem] overflow-hidden border-white/5"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                                <FileText size={18} className="text-brand-blue" />
                                <span className="text-sm font-black text-white uppercase tracking-widest">
                                    Live Preview — {(reportData.rows as any[]).length} Record(s)
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                {/* Orders Table */}
                                {reportData.type === 'orders' && (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                                <th className="px-6 py-4">Order ID</th>
                                                <th className="px-6 py-4">Date & Time</th>
                                                <th className="px-6 py-4">Waiter</th>
                                                <th className="px-6 py-4">Items</th>
                                                <th className="px-6 py-4">Payment</th>
                                                <th className="px-6 py-4 text-right">Total ({currency})</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {(reportData.rows as any[]).map(o => (
                                                <tr key={o.id} className="hover:bg-white/[0.02] text-xs transition-colors">
                                                    <td className="px-6 py-4 font-black text-white">#{o.id.slice(-6)}</td>
                                                    <td className="px-6 py-4 text-slate-400">{new Date(o.timestamp).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-white font-bold uppercase">{o.waiterName}</td>
                                                    <td className="px-6 py-4 text-slate-400">{o.items?.length} items</td>
                                                    <td className="px-6 py-4"><span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase", o.paymentMode === 'MPESA' ? 'bg-emerald-500/10 text-emerald-400' : o.paymentMode === 'CARD' ? 'bg-purple-500/10 text-purple-400' : 'bg-brand-blue/10 text-brand-blue')}>{o.paymentMode || 'N/A'}</span></td>
                                                    <td className="px-6 py-4 text-right font-black text-white">{Number(o.total).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-white/5 font-black text-sm">
                                                <td colSpan={5} className="px-6 py-4 text-right text-slate-400 uppercase tracking-widest text-xs">Grand Total</td>
                                                <td className="px-6 py-4 text-right text-white text-base">
                                                    {currency} {(reportData.rows as any[]).reduce((s: number, o: any) => s + (Number(o.total) || 0), 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                )}

                                {/* Waiter Summary Table */}
                                {(reportData.type === 'waiter_summary' || reportData.type === 'shift_summary') && (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                                <th className="px-6 py-4">Staff Member</th>
                                                <th className="px-6 py-4 text-center">Orders</th>
                                                <th className="px-6 py-4 text-right">Total Revenue ({currency})</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {(reportData.rows as any[]).sort((a, b) => b.total - a.total).map((r: any) => (
                                                <tr key={r.name} className="hover:bg-white/[0.02] text-xs transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black uppercase text-xs">{r.name.charAt(0)}</div>
                                                            <span className="text-white font-bold uppercase">{r.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center text-white font-black">{r.count || r.orders}</td>
                                                    <td className="px-6 py-5 text-right text-emerald-400 font-black text-base">{Number(r.total).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* Stock Table */}
                                {(reportData.type === 'stock' || reportData.type === 'low_stock' || reportData.type === 'stock_value') && (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                                <th className="px-6 py-4">Product</th>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4 text-center">Stock</th>
                                                <th className="px-6 py-4 text-right">Unit Price</th>
                                                <th className="px-6 py-4 text-right">Total Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {(reportData.rows as any[]).map((p: any) => (
                                                <tr key={p.id} className="hover:bg-white/[0.02] text-xs transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                                                <Wine size={14} className="text-brand-blue" />
                                                            </div>
                                                            <span className="text-white font-bold uppercase">{p.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400 font-bold uppercase text-[10px]">{p.category || '—'}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={cn("px-3 py-1 rounded-full font-black text-[10px]",
                                                            p.stock === 0 ? 'bg-red-500/10 text-red-400' :
                                                                p.stock <= (p.threshold || 10) ? 'bg-orange-500/10 text-orange-400' :
                                                                    'bg-emerald-500/10 text-emerald-400'
                                                        )}>
                                                            {p.stock === 0 ? 'OUT' : p.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-white font-bold">{currency} {Number(p.price).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right font-black text-white">{currency} {(p.stock * p.price).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-white/5">
                                                <td colSpan={4} className="px-6 py-4 text-right text-slate-400 text-xs font-black uppercase tracking-widest">Total Inventory Value</td>
                                                <td className="px-6 py-4 text-right font-black text-white text-base">
                                                    {currency} {(reportData.rows as any[]).reduce((s: number, p: any) => s + p.stock * p.price, 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                )}

                                {/* Empty State */}
                                {(reportData.rows as any[]).length === 0 && (
                                    <div className="py-20 text-center">
                                        <AlertTriangle size={48} className="mx-auto mb-4 text-slate-700" />
                                        <p className="text-slate-500 font-black uppercase tracking-widest">No records found for the selected filters</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty / Prompt State */}
                {!previewed && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                            <BarChart3 size={40} className="text-slate-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">Select a Report & Apply Filters</h3>
                        <p className="text-slate-600 text-sm mt-2">Choose a report type from the left panel, set your filters above, then click Generate Preview.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
