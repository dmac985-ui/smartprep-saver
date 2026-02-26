import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingDown } from "lucide-react";

const MIAMI_STORES = [
  {
    name: 'Aldi',
    emoji: '🟡',
    distance: '3.1 mi',
    multiplier: 0.80,
    tagline: 'Lowest prices in Miami',
    color: 'from-yellow-500 to-amber-500',
    borderColor: 'border-yellow-400/50',
    deals: [
      '20% off all fresh produce this week',
      'Organic eggs $2.49/dozen',
      'Whole wheat bread $1.29',
      'Ground turkey $3.49/lb',
    ],
  },
  {
    name: 'Walmart',
    emoji: '🔵',
    distance: '2.7 mi',
    multiplier: 0.85,
    tagline: 'Everyday low prices',
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-400/50',
    deals: [
      'Digital coupon: $2 off chicken breast',
      'Great Value rice 5lb $3.98',
      'Rollback: bananas $0.49/lb',
      'Fresh salmon $6.99/lb',
    ],
  },
  {
    name: 'Publix',
    emoji: '🟢',
    distance: '1.1 mi',
    multiplier: 1.00,
    tagline: 'Where shopping is a pleasure',
    color: 'from-emerald-500 to-green-600',
    borderColor: 'border-emerald-400/50',
    deals: [
      'BOGO: dozen large eggs',
      'Pub Sub meal deal $7.99',
      'Buy 1 get 1 free Greek yogurt',
      'Greenwise chicken thighs $4.49/lb',
    ],
  },
  {
    name: 'Whole Foods',
    emoji: '🥬',
    distance: '3.5 mi',
    multiplier: 1.22,
    tagline: 'Premium & organic selection',
    color: 'from-green-700 to-emerald-800',
    borderColor: 'border-green-500/50',
    deals: [
      'Prime Member: 35% off organic berries',
      'Local farm eggs $4.99/dozen',
      'Organic avocados 2 for $4',
      '365 brand pantry items 15% off',
    ],
  },
];

export default function StoreComparisonCards({ items, onSelectStore }) {
  const storeData = useMemo(() => {
    if (!items || items.length === 0) return [];

    const baseTotal = items.reduce((sum, item) => {
      return sum + Math.min(item.estimated_price || 3.49, 35);
    }, 0);

    const stores = MIAMI_STORES.map(store => ({
      ...store,
      estimatedTotal: parseFloat((baseTotal * store.multiplier).toFixed(2)),
    }));

    const highestTotal = Math.max(...stores.map(s => s.estimatedTotal));

    return stores.map(store => ({
      ...store,
      savings: parseFloat((highestTotal - store.estimatedTotal).toFixed(2)),
    }));
  }, [items]);

  if (storeData.length === 0) return null;

  const cheapest = storeData[0]?.name;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-emerald-600" />
        Miami Store Comparison — {items.length} Items
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {storeData.map((store) => (
          <Card
            key={store.name}
            className={`overflow-hidden ${store.borderColor} border-2 hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800/90`}
          >
            <div className={`bg-gradient-to-r ${store.color} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{store.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg">{store.name}</h3>
                    <p className="text-white/80 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {store.distance}
                    </p>
                  </div>
                </div>
                {store.name === cheapest && (
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">Best Value</Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">{store.tagline}</p>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Est. Total</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">${store.estimatedTotal.toFixed(2)}</p>
                </div>
                {store.savings > 0 && (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-bold">Save ${store.savings.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">This Week's Deals:</p>
                {store.deals.slice(0, 3).map((deal, i) => (
                  <p key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">•</span> {deal}
                  </p>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 text-xs font-semibold"
                onClick={() => onSelectStore(store.name)}
              >
                Shop Here →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}