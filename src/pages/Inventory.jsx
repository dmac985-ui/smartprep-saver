// src/components/PrepInventory.jsx   (or Inventory.jsx - whatever the file name is)
import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Package, Plus, Trash2, Edit2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PrepItemModal from '@/components/PrepItemModal';

const CATEGORY_COLORS = {
  Produce: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  Dairy: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  Meat: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  Seafood: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400',
  Grains: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  Pantry: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  Frozen: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
  Beverages: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  Snacks: 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400',
  Other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

function getStatus(dateStr) {
  if (!dateStr) return null;
  const expiry = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'expiring-soon';
  return 'healthy';
}

export default function Inventory() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // PERMANENT LOCK - survives navigation and refresh
  const [clearLocked, setClearLocked] = useState(() => {
    return localStorage.getItem('prepInventoryClearLocked') === 'true';
  });

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['prepItems'],
    queryFn: async () => {
      const data = await base44.entities.PrepItem.list('-created_date');
      return Array.isArray(data) ? data : [];
    },
    refetchOnWindowFocus: true
  });

  const stats = useMemo(() => {
    return items.reduce((acc, item) => {
      const val = (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0);
      const status = getStatus(item.expiry_date);
      
      acc.totalValue += val;
      if (status === 'expired' || status === 'expiring-soon') acc.alertCount += 1;
      return acc;
    }, { totalValue: 0, alertCount: 0 });
  }, [items]);

  const handleClearAll = async () => {
    if (!items.length || !confirm('Permanently delete ALL items from Prep Inventory? This cannot be undone.')) return;

    setIsClearing(true);
    setClearAllOpen(false);

    try {
      await Promise.allSettled(items.map(item => base44.entities.PrepItem.delete(item.id)));
      
      queryClient.invalidateQueries({ queryKey: ['prepItems'] });
      
      // Lock it permanently until user adds new items manually
      localStorage.setItem('prepInventoryClearLocked', 'true');
      setClearLocked(true);
      
      toast.success('Prep Inventory completely cleared and locked.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear inventory');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this item from inventory?')) return;
    
    const previousItems = queryClient.getQueryData(['prepItems']);
    queryClient.setQueryData(['prepItems'], (old) => old?.filter(item => item.id !== id));

    try {
      await base44.entities.PrepItem.delete(id);
      toast.success('Item deleted successfully');
    } catch (err) {
      queryClient.setQueryData(['prepItems'], previousItems);
      toast.error('Failed to delete item. Reverting changes.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['prepItems'] });
    handleModalClose();
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Database Connection Failed</h2>
        <Button onClick={() => queryClient.invalidateQueries(['prepItems'])}>Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 max-w-6xl mx-auto px-4 pb-28">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Prep Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time stock tracking and expiration alerts</p>
        </div>
        <div className="flex gap-3">
          {items.length > 0 && (
            <Button variant="outline" onClick={() => setClearAllOpen(true)} className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30 rounded-xl px-5 transition-all active:scale-95">
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
          )}
          <Button onClick={() => setModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </motion.div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{items.length}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Stocked Items</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">${stats.totalValue.toFixed(2)}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Inventory Value</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm col-span-2 lg:col-span-1">
          <p className={`text-3xl font-black ${stats.alertCount > 0 ? 'text-amber-500' : 'text-slate-300'}`}>
            {stats.alertCount}
          </p>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Alerts/Expiring</p>
        </div>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="animate-pulse">Loading Inventory...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">Your pantry is empty</h3>
          <Button variant="link" onClick={() => setModalOpen(true)} className="text-emerald-600">Add your first item now</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const status = getStatus(item.expiry_date);
              const itemTotal = (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0);

              return (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border transition-all hover:border-emerald-500/50 hover:shadow-xl ${
                    status === 'expired' ? 'border-red-500/50 bg-red-50/30 dark:bg-red-950/10' : 
                    status === 'expiring-soon' ? 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/10' : 
                    'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{item.name}</h3>
                      <Badge variant="secondary" className={`${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other} border-none`}>
                        {item.category}
                      </Badge>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(item)}>
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-sm">
                      <p className="text-slate-400">Qty: <span className="text-slate-900 dark:text-slate-200 font-medium">{item.quantity}</span></p>
                      <p className="text-slate-400">Unit: <span className="text-slate-900 dark:text-slate-200 font-medium">${parseFloat(item.unit_price || 0).toFixed(2)}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Value</p>
                      <p className="text-xl font-black text-emerald-600">${itemTotal.toFixed(2)}</p>
                    </div>
                  </div>

                  {item.expiry_date && (
                    <div className={`mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs font-bold ${
                      status === 'expired' ? 'text-red-500' : 
                      status === 'expiring-soon' ? 'text-amber-500' : 
                      'text-slate-400'
                    }`}>
                      {(status === 'expired' || status === 'expiring-soon') && <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>
                        {status === 'expired' ? 'EXPIRED' : status === 'expiring-soon' ? 'EXPIRING SOON' : 'EXPIRES'}: 
                        {' '}{new Date(item.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <PrepItemModal 
        open={modalOpen} 
        onClose={handleModalClose} 
        onSaved={handleSaved} 
        editingItem={editingItem} 
      />

      {/* Clear All Confirmation Modal */}
      <Dialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Clear entire inventory?</DialogTitle>
            <DialogDescription className="text-base mt-2">
              This will PERMANENTLY delete all items. They will not regenerate automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setClearAllOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleClearAll} disabled={isClearing} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              {isClearing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Permanently Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}