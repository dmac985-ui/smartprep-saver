import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, MapPin, ShoppingCart, TrendingDown, RefreshCw, Clock, AlertCircle } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import StoreComparisonCards from '@/components/savings/StoreComparisonCards';

const STORE_DISTANCES = {
  'Publix': '1.1 mi', 'Walmart': '2.7 mi', "Sedano's": '1.8 mi',
  'Bravo': '2.3 mi', 'Fresco y Más': '1.4 mi', 'Winn-Dixie': '2.0 mi',
  'Aldi': '3.1 mi', 'The Fresh Market': '3.5 mi', 'CVS': '0.9 mi',
  'Walgreens': '1.0 mi', 'Kroger': '4.2 mi', 'Other Store': '~3 mi',
};

const STORE_EMOJIS = {
  'Publix': '🟢', 'Walmart': '🔵', "Sedano's": '🛒', 'Bravo': '🏬',
  'Fresco y Más': '🍊', 'Winn-Dixie': '🏪', 'Aldi': '🟡',
  'The Fresh Market': '🥬', 'CVS': '❤️', 'Walgreens': '💊',
  'Kroger': '🔴', 'Other Store': '📍',
};

const CACHE_KEY = 'smartprep_flipp_cache';
const CACHE_DURATION = 2 * 60 * 60 * 1000;

function getCache(zip) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (c.zip !== zip || Date.now() - c.ts > CACHE_DURATION) return null;
    return c;
  } catch { return null; }
}
function setCache(zip, stores, scanTime) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ zip, ts: Date.now(), stores, scanTime })); } catch {}
}

const FALLBACK_PRICES = {
  Produce: 2.49, Protein: 5.99, Dairy: 3.49, Grains: 2.99,
  Pantry: 2.99, Frozen: 4.99, Beverages: 2.99, Other: 3.49,
};
const PRICE_CAP = 35;
const capPrice = (p) => Math.min(p, PRICE_CAP);

function buildStoreComparison(flippResults, groceryItems) {
  const merchantMap = {};
  for (const r of flippResults) {
    const gItem = r.item;
    for (const deal of r.deals) {
      const m = deal.merchant;
      if (!merchantMap[m]) merchantMap[m] = { items: {}, logo: null };
      if (!merchantMap[m].logo && deal.merchant_logo) merchantMap[m].logo = deal.merchant_logo;
      const existing = merchantMap[m].items[gItem.id];
      if (!existing || deal.price < existing.price) {
        merchantMap[m].items[gItem.id] = {
          itemId: gItem.id, itemName: gItem.name, category: gItem.category,
          price: deal.price, dealName: deal.name, saleStory: deal.sale_story,
          imageUrl: deal.image_url, validTo: deal.valid_to,
        };
      }
    }
  }

  const stores = [];
  for (const [merchant, data] of Object.entries(merchantMap)) {
    let total = 0;
    let dealsCount = 0;
    const breakdown = [];
    for (const gItem of groceryItems) {
      const deal = data.items[gItem.id];
      const itemEstPrice = capPrice(gItem.estimated_price || FALLBACK_PRICES[gItem.category] || FALLBACK_PRICES.Other);
      if (deal) {
        const cappedDealPrice = capPrice(deal.price || 0);
        total += cappedDealPrice;
        dealsCount++;
        breakdown.push({ ...gItem, storePrice: cappedDealPrice, dealName: deal.dealName, saleStory: deal.saleStory, imageUrl: deal.imageUrl, hasDeal: true, savings: parseFloat(Math.max(0, itemEstPrice - cappedDealPrice).toFixed(2)) });
      } else {
        total += itemEstPrice;
        breakdown.push({ ...gItem, storePrice: itemEstPrice, dealName: null, saleStory: null, imageUrl: null, hasDeal: false, savings: 0 });
      }
    }
    stores.push({ name: merchant, logo: data.logo, distance: STORE_DISTANCES[merchant] || '~3 mi', emoji: STORE_EMOJIS[merchant] || '🏪', totalCost: parseFloat(total.toFixed(2)), dealsCount, itemBreakdown: breakdown });
  }
  stores.sort((a, b) => a.totalCost - b.totalCost);
  return stores.length > 5 ? stores.slice(0, 5) : stores;
}

export default function SavingsHub() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [storeResults, setStoreResults] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanTime, setScanTime] = useState(null);
  const [highlightedMiamiStore, setHighlightedMiamiStore] = useState(null);
  const autoScanned = useRef(false);

  // Fresh data fetch — refetchOnMount ensures no stale cache on navigation
  const { data: groceryItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['groceryItems'],
    queryFn: () => base44.entities.GroceryItem.list('-created_date'),
    initialData: [],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const { data: profiles, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfileSavings'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
    initialData: [],
  });

  // Real-time subscription: auto-refresh when GroceryItem changes from any page
  useEffect(() => {
    const unsubscribe = base44.entities.GroceryItem.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] });
    });
    return unsubscribe;
  }, [queryClient]);

  const profile = profiles && profiles.length > 0 ? profiles[0] : null;
  const zipCode = profile?.zip_code || '33166';
  const items = groceryItems.filter(i => !i.is_purchased);

  // Clear all deal state when items become empty
  useEffect(() => {
    if (items.length === 0) {
      setStoreResults([]);
      setSelectedStore(null);
      setScanTime(null);
      setHighlightedMiamiStore(null);
      autoScanned.current = false;
    }
  }, [items.length]);

  const runScan = useCallback(async (force = false) => {
    setStoreResults([]);
    setSelectedStore(null);
    setScanTime(null);

    if (items.length === 0) {
      toast.error('Your grocery list is empty — generate one from the Meal Planner first.');
      return;
    }
    if (!force) {
      const cached = getCache(zipCode);
      if (cached) {
        setStoreResults(cached.stores);
        setSelectedStore(cached.stores[0] || null);
        setScanTime(cached.scanTime);
        return;
      }
    }
    setIsScanning(true);
    const tid = toast.loading(`Scanning deals near ${zipCode}…`);

    try {
      const payload = {
        items: items.map(i => ({ id: i.id, name: i.name, category: i.category, estimated_price: i.estimated_price })),
        postal_code: zipCode,
      };
      const res = await base44.functions.invoke('scanFlippDeals', payload);
      if (!res.data?.success) throw new Error(res.data?.error || 'Scan failed');

      const stores = buildStoreComparison(res.data.results, items);
      const now = new Date().toLocaleTimeString();
      setStoreResults(stores);
      setSelectedStore(stores[0] || null);
      setScanTime(now);
      setCache(zipCode, stores, now);

      if (stores.length > 0) {
        toast.success(`Best price: ${stores[0].name} at $${stores[0].totalCost.toFixed(2)}`, { id: tid });
      } else {
        toast.info('No current promotions found for your list.', { id: tid });
      }
    } catch (err) {
      console.error("Flipp scan error:", err);
      toast.error('Scan failed — try again.', { id: tid });
      setStoreResults([]);
      setSelectedStore(null);
      setScanTime(null);
    } finally {
      setIsScanning(false);
    }
  }, [items, zipCode]);

  // Auto-scan on first load when items exist
  useEffect(() => {
    if (!itemsLoading && !profileLoading && items.length > 0 && storeResults.length === 0 && !isScanning && !autoScanned.current) {
      autoScanned.current = true;
      setTimeout(() => runScan(false), 100);
    }
  }, [items.length, itemsLoading, profileLoading, storeResults.length, isScanning, runScan]);

  const groupedStores = storeResults;
  const bestStore = groupedStores[0] ?? null;
  const top3Stores = groupedStores.slice(0, 3);
  const avgTotal = groupedStores.length > 1
    ? groupedStores.reduce((s, st) => s + (st?.totalCost ?? 0), 0) / groupedStores.length : null;
  const bestSavings = avgTotal && bestStore ? parseFloat((avgTotal - (bestStore?.totalCost ?? 0)).toFixed(2)) : 0;

  return (
    <div className="max-w-7xl mx-auto pt-8 px-4 pb-16 space-y-10 relative">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Savings Hub 💰</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {items.length > 0
              ? <>Real-time deals for your <strong>{items.length} items</strong> near <strong>{zipCode}</strong></>
              : 'Your grocery list is empty'}
          </p>
          {scanTime && <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> Last scanned at {scanTime}</p>}
        </div>
        {items.length > 0 && (
          <Button variant="outline" onClick={() => runScan(true)} disabled={isScanning} className="shrink-0">
            {isScanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Rescan Deals
          </Button>
        )}
      </div>

      {/* CONTENT — only when items exist */}
      {items.length > 0 && (
        <>
          {/* 4 MIAMI STORE COMPARISON CARDS — TOP */}
          <StoreComparisonCards
            items={items}
            onSelectStore={(storeName) => setHighlightedMiamiStore(prev => prev === storeName ? null : storeName)}
          />

          {/* Highlighted store filter indicator */}
          {highlightedMiamiStore && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                Showing focus for: <strong>{highlightedMiamiStore}</strong>
              </p>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setHighlightedMiamiStore(null)}>
                Clear Filter
              </Button>
            </div>
          )}

          {/* BEST DEAL HERO (from Flipp scan) */}
          {bestStore && (
            <Card className="overflow-hidden border-emerald-400 shadow-xl">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 md:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Trophy className="w-10 h-10 shrink-0" />
                  <div>
                    <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Best Flipp Deal This Week</p>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                      {bestStore?.logo && <img src={bestStore.logo} alt="" className="w-8 h-8 rounded-lg bg-white/20 object-contain" />}
                      <span className="text-3xl">{bestStore?.emoji || '🏪'}</span>
                      {bestStore?.name || 'Miami Deals'}
                    </h2>
                    <div className="flex items-center gap-1 mt-1 text-emerald-100 text-sm">
                      <MapPin className="w-4 h-4" /> {bestStore?.distance || '~2 mi'} away • {bestStore?.dealsCount ?? 0} items on sale
                    </div>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-emerald-100 text-sm">Your total</p>
                  <div className="text-5xl font-extrabold">${(bestStore?.totalCost ?? 0).toFixed(2)}</div>
                  {bestSavings > 0 && (
                    <Badge className="mt-2 bg-white text-emerald-700 font-bold">Save ${bestSavings.toFixed(2)} vs avg</Badge>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* FLIPP PRICE COMPARISON GRID */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Flipp Deal Comparison — {items.length} Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedStores.length > 0 ? (
                top3Stores.map((store, rank) => {
                  if (!store) return null;
                  return (
                    <button
                      key={store?.name || rank}
                      onClick={() => setSelectedStore(store)}
                      className={`rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md ${
                        selectedStore?.name === store?.name
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {store?.logo && <img src={store.logo} alt="" className="w-8 h-8 rounded-lg object-contain bg-slate-100" />}
                        <span className="text-3xl">{store?.emoji || '🏪'}</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{store?.name || 'Store'}</h3>
                        {rank === 0 && <Badge className="bg-emerald-600 text-white text-xs">Cheapest</Badge>}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {store?.distance || '~3 mi'}
                      </p>
                      <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">${(store?.totalCost ?? 0).toFixed(2)}</div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{store?.dealsCount ?? 0} deals found</p>
                      {rank > 0 && bestStore && (
                        <p className="text-xs text-red-500 mt-1">+${((store?.totalCost ?? 0) - (bestStore?.totalCost ?? 0)).toFixed(2)} more</p>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100">No current promotions found</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Use the store comparison cards above for estimated pricing.</p>
                  <Button onClick={() => runScan(true)} className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl text-lg h-auto">
                    Rescan Deals Now
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ITEM BREAKDOWN */}
          {selectedStore && (
            <Card>
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-2 text-xl">
                  {selectedStore?.logo && <img src={selectedStore.logo} alt="" className="w-6 h-6 rounded object-contain" />}
                  <span className="text-xl">{selectedStore?.emoji || '🏪'}</span>
                  Item Prices at {selectedStore?.name || 'Store'}
                  <span className="text-slate-400 font-normal text-base ml-auto">{selectedStore?.distance || ''}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
                {(selectedStore?.itemBreakdown ?? []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item?.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{item?.name || 'Item'}</p>
                        {item?.hasDeal && item?.dealName && (
                          <p className="text-xs text-slate-400 truncate max-w-[250px]">{item.dealName}</p>
                        )}
                        {item?.saleStory && (
                          <p className="text-xs text-amber-600 font-semibold">{item.saleStory}</p>
                        )}
                        {!item?.hasDeal && (
                          <p className="text-xs text-slate-400 italic flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Est. price — no deal found
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {item?.hasDeal && (item?.savings ?? 0) > 0 && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">-${(item?.savings ?? 0).toFixed(2)}</Badge>
                      )}
                      <span className={`font-bold text-base tabular-nums ${item?.hasDeal ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'}`}>
                        ${(item?.storePrice ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-4 mt-2">
                  <p className="text-sm text-slate-500">Estimated total at {selectedStore?.name || 'Store'}</p>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">${(selectedStore?.totalCost ?? 0).toFixed(2)}</p>
                    <p className="text-sm text-slate-500">{selectedStore?.dealsCount ?? 0} of {items.length} items on sale</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* HOW IT WORKS */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 border-emerald-200 dark:border-emerald-800/30">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-600" /> How We Find Your Savings
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• <strong>Store comparison cards</strong> show estimated totals at 4 major Miami stores</li>
                <li>• We scan <strong>Flipp</strong> for real-time flyer deals from stores near {zipCode}</li>
                <li>• Each grocery item is searched across all available store circulars</li>
                <li>• Prices are grouped by merchant — we show the cheapest option at each store</li>
                <li>• Items without a Flipp deal use estimated average prices</li>
                <li>• Results are cached for 2 hours — hit "Rescan Deals" for fresh prices</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {/* SCANNING OVERLAY */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300 text-lg">Scanning {items.length} items for deals…</p>
          <p className="text-sm text-slate-500 mt-2">This may take 10–20 seconds</p>
        </motion.div>
      )}

      {/* EMPTY STATE */}
      {items.length === 0 && !itemsLoading && !profileLoading && (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-100">No Items to Compare</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
            Your grocery list is empty. Generate one from the Meal Planner to see deals and store comparisons.
          </p>
          <Button onClick={() => navigate(createPageUrl('MealPlan'))} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Go to Meal Planner
          </Button>
        </div>
      )}
    </div>
  );
}