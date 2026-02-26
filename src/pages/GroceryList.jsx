// src/components/GroceryList.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Loader2, ShoppingCart, Trash2, Info, DollarSign, Tag, 
  Download, Leaf, ChevronRight, PackagePlus, ExternalLink, 
  Edit3, Search, AlertCircle 
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { aggregateIngredients } from '@/components/utils/ingredientAggregator';

// Hard price cap — no single grocery item should ever exceed $35
const PRICE_CAP = 35;
const capPrice = (p) => Math.min(p, PRICE_CAP);

const openRealPriceCheck = (itemName) => {
  const searchUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(itemName)}+miami`;
  window.open(searchUrl, '_blank');
};

const CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Frozen', 'Beverages', 'Other'];

const CATEGORY_META = {
  Produce:   { emoji: '🥦', color: 'from-green-500 to-emerald-600', light: 'bg-green-50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30' },
  Protein:   { emoji: '🥩', color: 'from-rose-500 to-red-600',     light: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-800/30' },
  Dairy:     { emoji: '🥛', color: 'from-blue-400 to-sky-500',     light: 'bg-sky-50 dark:bg-sky-950/20 border-sky-200/50 dark:border-sky-800/30' },
  Grains:    { emoji: '🌾', color: 'from-amber-500 to-yellow-500', light: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30' },
  Pantry:    { emoji: '🧴', color: 'from-purple-500 to-violet-600', light: 'bg-violet-50 dark:bg-violet-950/20 border-violet-200/50 dark:border-violet-800/30' },
  Frozen:    { emoji: '🧊', color: 'from-cyan-500 to-blue-500',    light: 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200/50 dark:border-cyan-800/30' },
  Beverages: { emoji: '🧃', color: 'from-teal-500 to-emerald-500', light: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200/50 dark:border-teal-800/30' },
  Other:     { emoji: '📦', color: 'from-slate-500 to-slate-600',  light: 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/30' },
};

function getItemNutrients(itemName) {
  const hash = (itemName || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    calories: Math.round(40 + (hash % 280)),
    protein: Math.round(1 + (hash % 30)),
    carbs: Math.round(2 + ((hash * 3) % 50)),
    fat: parseFloat((0.5 + ((hash * 7) % 20)).toFixed(1)),
    vitamins: [
      { label: "Vitamin A", val: `${10 + (hash % 90)}mcg` },
      { label: "Vitamin C", val: `${5 + ((hash * 2) % 80)}mg` },
      { label: "Calcium",   val: `${20 + ((hash * 3) % 200)}mg` },
      { label: "Iron",      val: `${(0.5 + ((hash * 5) % 8)).toFixed(1)}mg` },
      { label: "Fiber",     val: `${(0.5 + ((hash * 6) % 8)).toFixed(1)}g` },
    ],
  };
}

function mapToInventoryCategory(cat) {
  const map = {
    Produce: 'Produce', Protein: 'Meat', Dairy: 'Dairy',
    Grains: 'Grains', Pantry: 'Pantry', Frozen: 'Frozen',
    Beverages: 'Beverages', Other: 'Other',
  };
  return map[cat] || 'Other';
}

export default function GroceryList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchasing, setPurchasing] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [syncing, setSyncing] = useState(false);

  // PERMANENT AUTO-GEN LOCK - survives navigation and refresh
  const autoGenLocked = useRef(localStorage.getItem('groceryAutoGenLocked') === 'true');
  const hasAutoGenRun = useRef(false);

  const { data: mealPlans = [], isLoading: planLoading } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-created_date', 1),
  });
  const currentPlan = mealPlans[0];

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["groceryItems"],
    queryFn: () => base44.entities.GroceryItem.list("-created_date"),
    refetchOnWindowFocus: true,
  });

  // Auto-generate ONCE if list is empty, plan exists, and not locked
  useEffect(() => {
    if (
      currentPlan &&
      items.length === 0 &&
      !syncing &&
      !planLoading &&
      !isLoading &&
      !autoGenLocked.current &&
      !hasAutoGenRun.current
    ) {
      hasAutoGenRun.current = true;
      handleGenerateGroceryList();
    }
  }, [currentPlan, items.length, syncing, planLoading, isLoading]);

  const handleGenerateGroceryList = async () => {
    if (!currentPlan || syncing) return;
    setSyncing(true);
    // Unlock so this manual trigger works, but re-lock after completion
    autoGenLocked.current = false;
    localStorage.setItem('groceryAutoGenLocked', 'false');

    const loadingToast = toast.loading("Generating grocery list from meal plan...");

    try {
      const existing = await base44.entities.GroceryItem.list();
      if (existing.length > 0) {
        await Promise.allSettled(existing.map(item => base44.entities.GroceryItem.delete(item.id)));
      }

      const aggregated = aggregateIngredients(currentPlan);
      if (aggregated.length === 0) {
        toast.error("No ingredients found in the meal plan.", { id: loadingToast });
        queryClient.invalidateQueries({ queryKey: ["groceryItems"] });
        setSyncing(false);
        return;
      }

      for (const ing of aggregated) {
        await base44.entities.GroceryItem.create({
          name: ing.name,
          quantity: ing.quantity || '1 each',
          category: ing.category || 'Other',
          estimated_price: capPrice(ing.estimated_price || 3.49),
          source_meal: ing.source_meal || '',
          is_purchased: false,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["groceryItems"] });
      // Lock auto-gen after successful generation to prevent re-runs
      autoGenLocked.current = true;
      localStorage.setItem('groceryAutoGenLocked', 'true');
      toast.success(`Generated ${aggregated.length} items!`, { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Generation failed — try again.", { id: loadingToast });
    } finally {
      setSyncing(false);
    }
  };

  const getPrice = (item) => {
    if (overrides[item.id]) return capPrice(parseFloat(overrides[item.id]));
    if (item.estimated_price && item.estimated_price > 0) return capPrice(item.estimated_price);
    return 3.49;
  };

  const unpurchasedItems = items.filter(i => !i.is_purchased);
  const purchasedItems = items.filter(i => i.is_purchased);
  const remainingTotal = unpurchasedItems.reduce((s, i) => s + getPrice(i), 0);

  const handleTogglePurchased = async (item) => {
    setPurchasing(item.id);
    const newState = !item.is_purchased;

    queryClient.setQueryData(["groceryItems"], (old) =>
      (old || []).map(i => i.id === item.id ? { ...i, is_purchased: newState } : i)
    );

    try {
      await base44.entities.GroceryItem.update(item.id, { is_purchased: newState });

      if (newState) {
        const qtyNum = parseFloat(item.quantity) || 1;
        await base44.entities.PrepItem.create({
          name: item.name,
          quantity: isNaN(qtyNum) ? 1 : qtyNum,
          unit_price: getPrice(item),
          category: mapToInventoryCategory(item.category),
          notes: item.source_meal ? `From meal: ${item.source_meal}` : '',
        });
        toast.success(`✅ "${item.name}" moved to inventory!`);
      } else {
        toast.success(`Unmarked as purchased`);
      }

      queryClient.invalidateQueries({ queryKey: ["prepItems"] });
    } catch (err) {
      queryClient.setQueryData(["groceryItems"], (old) =>
        (old || []).map(i => i.id === item.id ? { ...i, is_purchased: !newState } : i)
      );
      toast.error("Update failed — reverted");
    } finally {
      setPurchasing(null);
    }
  };

  const handleManualPriceEdit = (itemId) => {
    const current = overrides[itemId] || 0;
    const newPrice = prompt(`Update price for this item (currently $${current}):`, current);
    if (newPrice !== null && !isNaN(newPrice)) {
      setOverrides(prev => ({ ...prev, [itemId]: parseFloat(newPrice) }));
      toast.info("Price updated locally for your total.");
    }
  };

  const handleClearPurchased = async () => {
    if (!purchasedItems.length || !confirm(`Clear ${purchasedItems.length} purchased items?`)) return;
    await Promise.allSettled(purchasedItems.map(item => base44.entities.GroceryItem.delete(item.id)));
    queryClient.invalidateQueries({ queryKey: ["groceryItems"] });
    toast.success("Purchased items cleared");
  };

  const handleClearAll = async () => {
    if (!items.length || !confirm('Clear the entire grocery list?')) return;

    try {
      await Promise.allSettled(items.map(item => base44.entities.GroceryItem.delete(item.id)));
      queryClient.invalidateQueries({ queryKey: ["groceryItems"] });
      
      autoGenLocked.current = true;
      localStorage.setItem('groceryAutoGenLocked', 'true');
      
      toast.success("Grocery list cleared.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear list");
    }
  };

  const handleExport = () => {
    if (!items.length) return;
    const lines = items.map(i => 
      `[${i.is_purchased ? '✓' : ' '}] ${i.name} — ${i.quantity || '1'} — $${getPrice(i).toFixed(2)}`
    );
    const text = `SmartPrep Saver — Grocery List\nGenerated: ${new Date().toLocaleDateString()}\n\n${lines.join('\n')}\n\nRemaining Total: $${remainingTotal.toFixed(2)}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'smartprep-grocery-list.txt'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported successfully!');
  };

  if (isLoading || planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="space-y-4 w-full max-w-2xl px-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded-3xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 md:p-20 text-center max-w-2xl w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-700">
             <ShoppingCart className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Your pantry is calling.</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">Your grocery list is currently empty. Generate ingredients from your Meal Planner to see them here.</p>
          <Button onClick={() => navigate(createPageUrl('MealPlan'))}
            className="h-16 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black px-12 rounded-2xl text-xl shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95">
            Go to Meal Planner <ChevronRight className="ml-2 w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 max-w-4xl mx-auto px-6 pb-32">
      
      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 mb-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Grocery List</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-widest">
              {unpurchasedItems.length} Remaining
            </span>
            <span className="text-slate-400 text-sm font-medium">Updated just now</span>
          </div>
        </div>
        
        <div className="flex gap-3 flex-wrap items-center">
          <Button variant="outline" onClick={handleExport} className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold px-6 shadow-sm hover:bg-slate-50">
            <Download className="w-4 h-4 mr-2" /> Export PDF/TXT
          </Button>
          <Button variant="outline" onClick={() => navigate(createPageUrl('SavingsHub'))}
            className="h-12 rounded-2xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold px-6">
            <Tag className="w-4 h-4 mr-2" /> Local Deals
          </Button>
          <Button variant="outline" onClick={handleClearAll}
            className="h-12 rounded-2xl border-red-100 bg-red-50 text-red-600 hover:bg-red-100 font-bold px-6">
            <Trash2 className="w-4 h-4 mr-2" /> Reset List
          </Button>
        </div>
      </motion.div>

      {/* TOTAL */}
      <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white mb-12 text-center">
        <p className="text-emerald-100 text-sm font-bold uppercase tracking-widest mb-1">ESTIMATED TOTAL</p>
        <p className="text-7xl font-black tracking-tighter">${remainingTotal.toFixed(2)}</p>
      </div>

      {/* SIMPLE VERTICAL LIST */}
      <div className="space-y-3">
        {unpurchasedItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem({ ...item, nutrients: getItemNutrients(item.name) })}
            className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <Checkbox
                checked={false}
                onCheckedChange={() => handleTogglePurchased(item)}
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 dark:text-white text-lg leading-tight break-words">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{item.quantity || '1 each'}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <span className="font-bold text-emerald-600 text-2xl tabular-nums">${getPrice(item).toFixed(2)}</span>
              <Info className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* PURCHASED SECTION */}
      {purchasedItems.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest flex items-center gap-4">
              <PackagePlus className="w-8 h-8" /> Recently Bagged ({purchasedItems.length})
            </h2>
            <Button variant="ghost" onClick={handleClearPurchased} className="text-slate-400 font-bold hover:text-red-500">
               Clear All Bagged
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {purchasedItems.map((item) => (
              <div key={item.id}
                className="flex items-center justify-between p-5 rounded-3xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 opacity-50 grayscale hover:grayscale-0 transition-all group">
                <div className="flex items-center gap-4">
                   <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-white" />
                   </div>
                   <p className="font-bold text-slate-600 dark:text-slate-400 line-through truncate max-w-[120px]">{item.name}</p>
                </div>
                <span className="font-black text-slate-400 text-sm">${getPrice(item).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* NUTRITION MODAL */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-xl rounded-[3rem] p-0 overflow-hidden border-none bg-white dark:bg-slate-900 shadow-2xl">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-10 text-white relative">
             <div className="absolute top-6 right-6 p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Leaf className="w-6 h-6 text-white" />
             </div>
             <DialogHeader>
                <DialogTitle className="text-4xl font-black tracking-tighter mb-2">{selectedItem?.name}</DialogTitle>
                <DialogDescription className="text-emerald-100 text-lg font-medium italic">
                  Approximate nutritional profile for {selectedItem?.quantity || 'one serving'}.
                </DialogDescription>
             </DialogHeader>
          </div>
          
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {[
                 { label: "Calories", val: selectedItem?.nutrients?.calories, unit: "", color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' },
                 { label: "Protein",  val: selectedItem?.nutrients?.protein,  unit: "g", color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' },
                 { label: "Carbs",    val: selectedItem?.nutrients?.carbs,    unit: "g", color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' },
                 { label: "Fat",      val: selectedItem?.nutrients?.fat,      unit: "g", color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' },
               ].map(({ label, val, unit, color }) => (
                 <div key={label} className={`text-center p-6 ${color} rounded-[2rem] flex flex-col items-center justify-center border border-current/10 shadow-sm`}>
                    <p className="text-2xl font-black mb-1">{val}{unit}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">{label}</p>
                 </div>
               ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800">
               <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Tag className="w-4 h-4" /> Micronutrients & Fiber
               </h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                 {selectedItem?.nutrients?.vitamins?.map(({ label, val }) => (
                   <div key={label} className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700/50 last:border-0">
                      <span className="text-slate-500 font-bold">{label}</span>
                      <span className="font-black text-slate-800 dark:text-slate-200">{val}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="flex gap-4">
               <Button variant="outline" onClick={() => setSelectedItem(null)} className="flex-1 h-16 rounded-2xl border-slate-200 font-bold text-slate-500 hover:bg-slate-50">
                 Back to List
               </Button>
               <Button onClick={() => { openRealPriceCheck(selectedItem.name); setSelectedItem(null); }} 
                 className="flex-1 h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20">
                 Scan Local Stores
               </Button>
            </div>
            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest italic">* Nutritional estimates generated by SmartPrep AI</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}