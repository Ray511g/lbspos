"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  Wine, 
  ShieldCheck,
  X,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessStore, Product } from '@/store/businessStore';

export default function LiquorInventory() {
  const { products, addProduct, updateProduct, deleteProduct, currency } = useBusinessStore();
  const [activeTab, setActiveTab] = useState<'all' | 'low' | 'categories'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Beer',
    stock: 0,
    volume: '750ml'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      setEditingProduct(null);
    } else {
      addProduct({
        ...formData,
        id: `P-${Date.now()}`
      } as Product);
    }
    setShowAddModal(false);
    setFormData({ name: '', price: 0, category: 'Beer', stock: 0, volume: '750ml' });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'low' && p.stock < 15);
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-white font-outfit mb-2">Liquor <span className="text-brand-blue">Vault</span></h1>
          <p className="text-slate-400">Managing <span className="text-white font-bold">{products.length}</span> high-value alcohol lines and government excise compliance.</p>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white font-bold hover:bg-white/10 transition-all text-sm">
            <ShieldCheck size={18} className="text-emerald-400" />
            STAMP SCANNER
          </button>
          <button 
            onClick={() => { setEditingProduct(null); setShowAddModal(true); }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 premium-gradient px-8 py-4 rounded-2xl text-white font-black shadow-xl shadow-brand-blue/20 hover:scale-[1.02] transition-all text-sm"
          >
            <Plus size={20} />
            ADD NEW PRODUCT
          </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'In Stock', icon: Wine },
            { id: 'low', label: 'Low Stock', icon: AlertTriangle },
            { id: 'categories', label: 'By Category', icon: Filter },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-brand-blue text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <tab.icon size={16} />
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search vault (e.g. Whiskey)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white font-semibold outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm"
          />
        </div>
      </div>

      {/* Modern Table */}
      <div className="glass-card rounded-[3rem] overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-6 text-slate-500 text-[10px] font-black uppercase tracking-[2px]">Product & Size</th>
                <th className="px-8 py-6 text-slate-500 text-[10px] font-black uppercase tracking-[2px]">Unit Price</th>
                <th className="px-8 py-6 text-slate-500 text-[10px] font-black uppercase tracking-[2px]">On Hand</th>
                <th className="px-8 py-6 text-slate-500 text-[10px] font-black uppercase tracking-[2px]">Compliance</th>
                <th className="px-8 py-6 text-center text-slate-500 text-[10px] font-black uppercase tracking-[2px]">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                        <Wine size={20} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{item.name}</h4>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{item.category} • {item.volume}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-white font-black">{currency} {item.price.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-black text-lg",
                        item.stock < 15 ? "text-orange-500" : "text-white"
                      )}>{item.stock}</span>
                      <span className="text-slate-500 text-[10px] font-bold">REORDER AT 15</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "flex items-center gap-2 font-black text-[9px] uppercase tracking-tighter px-3 py-1 rounded-full w-fit",
                      "text-emerald-400 bg-emerald-400/10"
                    )}>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      SYSTEM VERIFIED
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => { setEditingProduct(item); setFormData(item); setShowAddModal(true); }}
                        className="p-2.5 rounded-xl text-slate-600 hover:bg-brand-blue/20 hover:text-brand-blue transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteProduct(item.id)}
                        className="p-2.5 rounded-xl text-slate-600 hover:bg-red-500/10 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card w-full max-w-xl p-10 rounded-[3rem] border-white/10 relative bg-navy-900 border">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white font-outfit uppercase">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white"><X /></button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Product Name</label>
                  <input 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-brand-blue/50" 
                    placeholder="e.g. Jameson Black Barrel" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none"
                    >
                      {['Whiskey', 'Beer', 'Gin', 'Vodka', 'Wine', 'Mixers'].map(c => <option key={c} value={c} className="bg-navy-900">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Volume / Size</label>
                    <input 
                      required 
                      value={formData.volume}
                      onChange={e => setFormData({...formData, volume: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none" 
                      placeholder="e.g. 750ml" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Price ({currency})</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Opening Stock</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none" 
                    />
                  </div>
                </div>

                <button className="w-full py-5 rounded-2xl premium-gradient text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-brand-blue/20">
                  <Save size={20} />
                  {editingProduct ? 'UPDATE VAULT' : 'CONFIRM ADDITION'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
