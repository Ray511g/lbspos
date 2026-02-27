"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard, 
  Smartphone, 
  Zap,
  Printer,
  ChevronRight,
  User,
  X,
  CheckCircle,
  Clock,
  Wine,
  GlassWater,
  PackageCheck,
  AlertCircle,
  Truck,
  Send,
  Coins,
  RefreshCw,
  SmartphoneNfc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';
import ReceiptPreview from '@/components/ReceiptPreview';
import { useRouter } from 'next/navigation';

// Products are now pulled from useBusinessStore
const CATEGORIES = ['All', 'Beer', 'Whiskey', 'Gin', 'Mixers'];

export default function DistributedPOS() {
  const { items, addItem, removeItem, updateQuantity, subtotal, taxTotal, total, clearCart } = useCartStore();
  const { currency, createOrder, activeOrders, dispatchOrder, completeOrder, recordSale, voidOrder, products } = useBusinessStore();
  const { currentUser } = useAuthStore();
  const router = useRouter();
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MPESA' | 'CARD' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState(false);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<any>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [posMode, setPosMode] = useState<'SALES' | 'DISPATCH' | 'PAYMENTS'>('SALES');
  const [phone, setPhone] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [stkStatus, setStkStatus] = useState<'IDLE' | 'SENDING' | 'WAITING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [showWaiterStats, setShowWaiterStats] = useState(false);
  
  useEffect(() => {
    if (!currentUser) router.push('/login');
  }, [currentUser]);

  if (!currentUser) return null;

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    if (currentUser.role === 'WAITER') {
       // Waiters send to counter directly now (per request: let orders go to dispatch first)
       confirmAndSendOrder();
    } else {
       // Cashiers/Admins do direct payment
       setShowPaymentModal(true);
    }
  };

  const confirmAndSendOrder = () => {
     const newOrder = {
       id: `ORD-${Date.now()}`,
       waiterId: currentUser.id,
       waiterName: currentUser.name,
       items: [...items],
       total,
       status: 'PENDING' as const,
       timestamp: new Date().toISOString()
     };
     createOrder(newOrder);
     clearCart();
     setReviewingOrder(false);
     alert("Order sent to Counter successfully!");
  };

  const handleSTKPush = async () => {
    if (!phone) return alert("Please enter customer phone number");
    setStkStatus('SENDING');
    
    try {
      const res = await fetch('/api/mpesa/stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, phone, orderId: `INV-${Date.now()}` })
      });
      
      const data = await res.json();
      if (data.success) {
        setStkStatus('WAITING');
        // In production, we would poll for status here
        setTimeout(() => {
          setStkStatus('SUCCESS');
          processPayment();
        }, 5000);
      } else {
        setStkStatus('ERROR');
        alert(data.message || "STK Push failed");
      }
    } catch (err) {
      setStkStatus('ERROR');
      alert("Network error. Check connection.");
    }
  };

  const processPayment = () => {
    setProcessing(true);
    // Record the sale in the business store (deducts stock & logs audit)
    recordSale([...items], total, currentUser.name);
    
    setTimeout(() => {
      setProcessing(false);
      setOrderComplete(true);
    }, 1200);
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-[calc(100dvh-64px)] lg:h-[calc(100vh-64px)] overflow-hidden flex flex-col -m-4 lg:-m-8">
      {/* Dynamic Header */}
      <div className="bg-navy-900 border-b border-white/10 px-4 lg:px-8 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-4 flex-1 max-w-2xl pl-12 lg:pl-0">
           <div className="flex bg-white/5 p-1 rounded-xl mr-4 border border-white/5">
                <button 
                  onClick={() => setPosMode('SALES')}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest", posMode === 'SALES' ? "bg-brand-blue text-white" : "text-slate-500")}
                >
                  SALES
                </button>
                 <button 
                  onClick={() => setPosMode('DISPATCH')}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest flex items-center gap-2", posMode === 'DISPATCH' ? "bg-emerald-500 text-white" : "text-slate-500")}
                >
                  {currentUser.role === 'WAITER' ? 'QUEUE' : 'DISPATCH'} {activeOrders.filter(o => o.status === 'PENDING').length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </button>
                <button 
                  onClick={() => setPosMode('PAYMENTS')}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest", posMode === 'PAYMENTS' ? "bg-purple-500 text-white" : "text-slate-500")}
                >
                  SETTLEMENTS
                </button>
           </div>
          {posMode === 'SALES' && (
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Find drinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-500 font-semibold text-xs lg:text-sm outline-none"
              />
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-white uppercase">{currentUser.role}: {currentUser.name}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative bg-navy-950">
        {posMode === 'SALES' ? (
          <>
            {/* Catalog */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
               <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-2">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                        activeCategory === cat ? "bg-brand-blue text-white" : "bg-white/5 text-slate-500 hover:text-white"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map(p => (
                    <motion.div 
                      key={p.id} 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addItem(p as any)}
                      className="glass-card p-4 rounded-3xl border-white/5 cursor-pointer hover:border-brand-blue/30 transition-all group"
                    >
                       <div className="aspect-square bg-white/5 rounded-2xl mb-4 flex items-center justify-center text-brand-blue">
                          <Wine size={40} className="group-hover:scale-110 transition-transform" />
                       </div>
                       <h4 className="text-white font-bold text-xs lg:text-sm truncate">{p.name}</h4>
                       <div className="flex justify-between items-center mt-3">
                          <div className="flex flex-col">
                             <span className="text-brand-blue font-black">{currency} {p.price.toLocaleString()}</span>
                             <span className={cn(
                               "text-[9px] font-bold uppercase",
                               p.stock < 10 ? "text-orange-500" : "text-slate-500"
                             )}>
                               {p.stock} Left
                             </span>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                             <Plus size={16} />
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Cart Desktop */}
            <div className="hidden lg:flex w-[400px] border-l border-white/10 flex-col bg-navy-900/50">
               <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-xl font-black text-white font-outfit uppercase">Current Session</h3>
                  <button onClick={clearCart} className="text-slate-600 hover:text-red-500"><Trash2 size={20} /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {items.map(item => (
                    <div key={item.id} className="glass-card p-4 rounded-2xl border-white/5 flex items-center gap-4">
                       <div className="flex-1">
                          <h5 className="text-white font-bold text-xs uppercase">{item.name}</h5>
                          <span className="text-brand-blue font-black text-[10px]">{currency} {item.price}</span>
                       </div>
                       <div className="flex items-center gap-3 bg-white/5 px-2 py-1 rounded-xl">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-500"><Minus size={14} /></button>
                          <span className="text-white font-black text-xs w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-500"><Plus size={14} /></button>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-8 border-t border-white/5 space-y-6">
                  <div className="flex justify-between">
                     <span className="text-slate-500 font-black text-xs uppercase tracking-widest">Total Payable</span>
                     <span className="text-3xl font-black text-white font-outfit">{currency} {total.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-5 rounded-2xl premium-gradient text-white font-black text-lg flex items-center justify-center gap-3 shadow-2xl"
                  >
                    {currentUser.role === 'WAITER' ? <><Send size={24} /> SEND TO COUNTER</> : <><CreditCard size={24} /> COLLECT PAYMENT</>}
                  </button>
               </div>
            </div>
          </>
        ) : posMode === 'DISPATCH' ? (
          /* Dispatch Mode View (For Cashier/Admin) */
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
             {/* Waiter Analytics Sub-Module (Only for Cashier/Admin) */}
             {(currentUser.role === 'CASHIER' || currentUser.role === 'ADMIN') && (
               <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Digital Staff Ledger</h3>
                     <div className="flex gap-2">
                        <button 
                            onClick={() => window.print()}
                            className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2"
                        >
                            <Printer size={12} /> NIGHTLY AUDIT
                        </button>
                        <button 
                            onClick={() => setShowWaiterStats(!showWaiterStats)}
                            className="text-[10px] font-black text-brand-blue border border-brand-blue/20 px-4 py-2 rounded-xl"
                        >
                            {showWaiterStats ? 'HIDE LEDGER' : 'VIEW WAITER DEBTS'}
                        </button>
                     </div>
                  </div>
                  
                  <AnimatePresence>
                    {showWaiterStats && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                           {useBusinessStore.getState().getWaiterSummary().map(waiter => (
                             <div key={waiter.waiterName} className="glass-card p-6 rounded-[2rem] border-white/5 bg-white/[0.02]">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{waiter.waiterName}</h4>
                                <div className="space-y-2">
                                   <div className="flex justify-between">
                                      <span className="text-[10px] font-bold text-slate-400">UNSETTLED</span>
                                      <span className="text-xs font-black text-red-500">{currency} {waiter.unsettled.toLocaleString()}</span>
                                   </div>
                                   <div className="flex justify-between">
                                      <span className="text-[10px] font-bold text-slate-400">SETTLED</span>
                                      <span className="text-xs font-black text-emerald-500">{currency} {waiter.settled.toLocaleString()}</span>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(currentUser.role === 'WAITER' ? activeOrders.filter(o => o.waiterId === currentUser.id) : activeOrders).map(order => (
                  <motion.div 
                    layout
                    key={order.id} 
                    className={cn(
                      "glass-card rounded-[2.5rem] border-white/5 overflow-hidden",
                      order.status === 'PENDING' ? "border-brand-blue/30 bg-brand-blue/5" : "border-emerald-500/30 bg-emerald-500/5"
                    )}
                  >
                     <div className="p-6 border-b border-white/10 flex justify-between items-start">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <User size={14} className="text-brand-blue" />
                              <span className="text-xs font-black text-white uppercase">{order.waiterName}</span>
                           </div>
                           <span className="text-[10px] text-slate-500 font-bold">{new Date(order.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                          order.status === 'PENDING' ? "bg-brand-blue text-white" : "bg-emerald-500 text-white"
                        )}>{order.status}</span>
                     </div>
                     <div className="p-6 space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-bold">
                             <span className="text-white">{item.quantity} x {item.name}</span>
                             <span className="text-slate-400">{currency} {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                     </div>
                     <div className="p-6 border-t border-white/10 bg-black/20 flex items-center justify-between">
                        <div className="text-xl font-black text-white">{currency} {order.total.toLocaleString()}</div>
                         <div className="flex gap-2">
                            {(order.status === 'DISPATCHED' || currentUser.role !== 'WAITER') && (
                              <button 
                                  onClick={() => setViewingReceiptOrder(order)}
                                  className="bg-white/10 text-white p-2.5 rounded-xl border border-white/5 hover:bg-white/20 transition-all font-black text-[10px] flex items-center gap-2"
                              >
                                  <Printer size={16} /> BILL
                              </button>
                            )}
                            {(currentUser.role === 'CASHIER' || currentUser.role === 'ADMIN') && (
                              order.status === 'PENDING' ? (
                                <button onClick={() => dispatchOrder(order.id, currentUser.name)} className="bg-brand-blue text-white px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2">
                                   <Truck size={14} /> DISPATCH
                                </button>
                              ) : (
                                <button onClick={() => completeOrder(order.id, currentUser.name)} className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2">
                                   <CheckCircle size={14} /> SETTLE BILL
                                </button>
                              )
                            )}
                         </div>
                     </div>
                  </motion.div>
                ))}
                {activeOrders.length === 0 && (
                  <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-600">
                     <Clock size={64} className="mb-4 opacity-20" />
                     <p className="font-black uppercase tracking-[4px]">Queue is empty</p>
                  </div>
                )}
             </div>
          </div>
        ) : (
          /* Payments Module View */
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
             <div className="mb-6">
                <h3 className="text-2xl font-black text-white font-outfit uppercase">Master Settlement Journal</h3>
                <p className="text-slate-500 text-sm">Reviewing all finalized transactions per order.</p>
             </div>
             
             <div className="glass-card rounded-[3rem] overflow-hidden border-white/5">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                         <th className="px-8 py-6">Order Ref</th>
                         <th className="px-8 py-6">Staff</th>
                         <th className="px-8 py-6">Items</th>
                         <th className="px-8 py-6">Total Paid</th>
                         <th className="px-8 py-6 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {(currentUser.role === 'WAITER' 
                         ? useBusinessStore.getState().completedOrders.filter(o => o.waiterId === currentUser.id)
                         : useBusinessStore.getState().completedOrders).map(order => (
                        <tr key={order.id} className="hover:bg-white/[0.02] text-xs transition-colors">
                           <td className="px-8 py-6">
                              <span className="text-white font-black tracking-tighter">#{order.id.slice(-6)}</span>
                              <div className="text-[10px] text-slate-500">{new Date(order.timestamp).toLocaleString()}</div>
                           </td>
                           <td className="px-8 py-6 text-white font-bold">{order.waiterName}</td>
                           <td className="px-8 py-6 text-slate-400">{order.items.length} Products</td>
                           <td className="px-8 py-6 text-emerald-500 font-black">{currency} {order.total.toLocaleString()}</td>
                           <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => setViewingReceiptOrder(order)}
                                className="text-brand-blue font-black tracking-widest uppercase text-[9px] hover:underline"
                              >
                                VIEW RECEIPT
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>

      {/* Floating Mobile Cart */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setShowMobileCart(true)}
          className="w-16 h-16 rounded-full premium-gradient text-white shadow-2xl flex items-center justify-center scale-110"
        >
          <ShoppingCart size={28} />
          {items.length > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black">{items.length}</span>}
        </button>
      </div>

      {/* Mobile Cart Overlay */}
      <AnimatePresence>
        {showMobileCart && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-50 bg-navy-950 flex flex-col lg:hidden">
             <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-black text-white">CART ({items.length})</h3>
                <button onClick={() => setShowMobileCart(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><X /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map(item => (
                   <div key={item.id} className="glass-card p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-bold">{item.name}</h5>
                        <p className="text-brand-blue font-black text-sm">{currency} {item.price}</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-white"><Minus /></button>
                        <span className="text-white font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-white"><Plus /></button>
                      </div>
                   </div>
                ))}
             </div>
             <div className="p-8 border-t border-white/10 space-y-4">
                <div className="flex justify-between text-white font-black text-2xl">
                   <span className="text-slate-500 text-sm py-2">TOTAL</span>
                   <span>{currency} {total.toLocaleString()}</span>
                </div>
                <button onClick={() => { handleCheckout(); setShowMobileCart(false); }} className="w-full py-5 rounded-3xl premium-gradient text-white font-black text-xl flex items-center justify-center gap-3">
                   {currentUser.role === 'WAITER' ? <Send size={24}/> : <CreditCard size={24}/>}
                   {currentUser.role === 'WAITER' ? 'SEND ORDER' : 'CHECKOUT'}
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card w-full max-w-xl p-10 rounded-[3rem] border-white/10 relative bg-navy-900 border overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 premium-gradient" />
               
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-white font-outfit">Settle Payment</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Select method & finalize</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-500 uppercase block">Payable Amount</span>
                    <span className="text-3xl font-black text-brand-blue font-outfit">{currency} {total.toLocaleString()}</span>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { id: 'CASH', label: 'Cash', icon: Coins },
                    { id: 'MPESA', label: 'M-Pesa STK', icon: SmartphoneNfc },
                    { id: 'CARD', label: 'Visa/Debit', icon: CreditCard },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all",
                        paymentMethod === method.id 
                          ? "bg-brand-blue/10 border-brand-blue text-brand-blue" 
                          : "bg-white/5 border-transparent text-slate-500 hover:text-white"
                      )}
                    >
                      <method.icon size={32} className="mb-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                    </button>
                  ))}
               </div>

               {paymentMethod === 'CASH' && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 mb-8">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amount Received</label>
                            <input 
                              type="number"
                              placeholder="0.00"
                              value={amountReceived}
                              onChange={e => setAmountReceived(e.target.value)}
                              className="w-full bg-navy-950 border border-white/10 rounded-2xl p-4 text-white font-bold text-lg outline-none focus:ring-2 focus:ring-brand-blue/50"
                            />
                          </div>
                          <div className="flex flex-col justify-end">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Change Due</label>
                            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-emerald-400 font-black text-xl">
                               {currency} {Number(amountReceived) > total ? (Number(amountReceived) - total).toLocaleString() : '0.00'}
                            </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               )}

               {paymentMethod === 'MPESA' && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 mb-8">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Customer Phone (M-Pesa)</label>
                       <input 
                         placeholder="07XX XXX XXX / 254..." 
                         value={phone}
                         onChange={e => setPhone(e.target.value)}
                         className="w-full bg-navy-950 border border-white/10 rounded-2xl p-4 text-white font-bold text-lg outline-none focus:ring-2 focus:ring-brand-blue/50"
                       />
                       <div className="mt-4 flex items-center gap-3 text-slate-500">
                          {stkStatus === 'SENDING' && <RefreshCw size={16} className="animate-spin text-brand-blue" />}
                          {stkStatus === 'WAITING' && <Clock size={16} className="text-brand-blue" />}
                          <span className="text-[11px] font-bold">
                            {stkStatus === 'IDLE' && "Ready to send STK Push."}
                            {stkStatus === 'SENDING' && "Initializing secure tunnel..."}
                            {stkStatus === 'WAITING' && "Push sent! Waiting for customer PIN response..."}
                            {stkStatus === 'SUCCESS' && "Payment Confirmed! Auto-printing..."}
                          </span>
                       </div>
                    </div>
                 </motion.div>
               )}

               <div className="flex gap-4">
                  <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-5 rounded-2xl bg-white/5 text-slate-400 font-black tracking-widest text-[11px] active:scale-95 transition-transform">CANCEL</button>
                  <button 
                    disabled={processing || (paymentMethod === 'MPESA' && stkStatus !== 'IDLE')}
                    onClick={paymentMethod === 'MPESA' ? handleSTKPush : processPayment}
                    className="flex-[2] py-5 rounded-2xl premium-gradient text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {processing ? <RefreshCw className="animate-spin" size={20} /> : (paymentMethod === 'MPESA' ? <SmartphoneNfc size={20} /> : <CheckCircle size={20} />)}
                    {paymentMethod === 'MPESA' ? 'INITIATE STK PUSH' : 'COMPLETE TRANSACTION'}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Waiter Review Receipt (Before Send) */}
      <AnimatePresence>
        {reviewingOrder && (
          <ReceiptPreview 
            items={[...items]} 
            total={total} 
            subtotal={subtotal} 
            tax={taxTotal} 
            waiterName={currentUser.name}
            onClose={() => setReviewingOrder(false)}
            onConfirm={confirmAndSendOrder}
          />
        )}
      </AnimatePresence>

      {/* 2. Direct Sale Receipt (After Cashier Sells) */}
      <AnimatePresence>
        {orderComplete && (
          <ReceiptPreview 
            items={[...items]} 
            total={total} 
            subtotal={subtotal} 
            tax={taxTotal} 
            waiterName={currentUser.name}
            onClose={() => {
              setOrderComplete(false);
              setShowPaymentModal(false);
              setPaymentMethod(null);
              setPhone('');
              setAmountReceived('');
              setStkStatus('IDLE');
              clearCart();
            }}
          />
        )}
      </AnimatePresence>

      {/* 3. Dispatch Queue Receipt View */}
      <AnimatePresence>
        {viewingReceiptOrder && (
          <ReceiptPreview 
            items={viewingReceiptOrder.items} 
            total={viewingReceiptOrder.total} 
            subtotal={viewingReceiptOrder.total / 1.16} // Estimate subtotal
            tax={viewingReceiptOrder.total - (viewingReceiptOrder.total / 1.16)} // Estimate tax
            waiterName={viewingReceiptOrder.waiterName}
            orderId={viewingReceiptOrder.id}
            isConfirmed={true}
            onClose={() => setViewingReceiptOrder(null)}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
