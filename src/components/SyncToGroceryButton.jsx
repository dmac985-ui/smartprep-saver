import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { aggregateIngredients } from '@/components/utils/ingredientAggregator';

export default function SyncToGroceryButton({ mealPlan }) {
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const handleSync = async () => {
    if (!mealPlan?.meals?.length) {
      toast.error('No meal plan to sync');
      return;
    }

    setSyncing(true);
    const loadingToast = toast.loading("Aggregating ingredients from 7-day plan...");

    try {
      // Step 1: Aggregate all ingredients with full normalization
      const aggregated = aggregateIngredients(mealPlan);

      if (aggregated.length === 0) {
        toast.error("No ingredients found in the meal plan.", { id: loadingToast });
        setSyncing(false);
        return;
      }

      // Step 2: Clear all existing grocery items (complete overwrite)
      const existing = await base44.entities.GroceryItem.list();
      if (existing.length > 0) {
        await Promise.allSettled(existing.map(item => base44.entities.GroceryItem.delete(item.id)));
      }

      // Step 3: Check inventory to skip items already in pantry
      const inventory = await base44.entities.PrepItem.list();
      const inventoryNames = new Set(
        (inventory || []).map(i => i.name.toLowerCase().trim())
      );

      const toCreate = aggregated.filter(item => !inventoryNames.has(item.name.toLowerCase().trim()));

      // Step 4: Batch create new grocery items
      if (toCreate.length > 0) {
        await Promise.all(
          toCreate.map(item => base44.entities.GroceryItem.create(item))
        );
      }

      const skipped = aggregated.length - toCreate.length;

      toast.success(
        <div className="flex flex-col gap-2 p-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-slate-900 dark:text-white">{toCreate.length} items added!</span>
          </div>
          {skipped > 0 && <p className="text-xs text-slate-500">{skipped} items skipped (already in pantry).</p>}
          <p className="text-xs text-slate-500">Ingredients normalized & aggregated from all 7 days.</p>
          <button
            className="mt-1 flex items-center gap-1 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline"
            onClick={() => navigate(createPageUrl('GroceryList'))}
          >
            Open Shopping List <ArrowRight className="w-3 h-3" />
          </button>
        </div>,
        { id: loadingToast, duration: 6000 }
      );

    } catch (err) {
      console.error('[Sync Error]', err);
      toast.error('Sync failed — please try again.', { id: loadingToast });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={syncing || !mealPlan}
      className={`h-16 px-8 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all duration-300 shadow-xl active:scale-95 ${
        syncing 
          ? "bg-slate-100 text-slate-400 dark:bg-slate-800" 
          : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-black/20"
      }`}
    >
      {syncing ? (
        <span className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          Aggregating Ingredients...
        </span>
      ) : (
        <span className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5" />
          Generate Grocery List
        </span>
      )}
    </Button>
  );
}