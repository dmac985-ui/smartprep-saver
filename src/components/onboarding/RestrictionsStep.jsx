// --- MASTER RESTRICTIONSSTEP.JSX ---
// FULL DARK THEME - MATCHES DIETARYSTEP, GOALSSTEP & THE REST OF THE APP

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Plus, ShieldAlert, Ban, Info } from "lucide-react";

const COMMON_ALLERGIES = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Gluten', 'Fish', 'Shellfish'];
const COMMON_DISLIKES = ['Mushrooms', 'Onions', 'Cilantro', 'Olives', 'Spicy Food', 'Tofu'];

export default function RestrictionsStep({ data = {}, onChange }) {
  const [allergyInput, setAllergyInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');

  const allergies = Array.isArray(data.allergies) ? data.allergies : [];
  const dislikes = Array.isArray(data.dislikes) ? data.dislikes : [];

  const handleAddItem = (field, currentItems, value, setInput) => {
    const trimmed = value.trim();
    if (trimmed && !currentItems.includes(trimmed)) {
      onChange(field, [...currentItems, trimmed]);
    }
    setInput('');
  };

  const removeItem = (field, currentItems, itemToRemove) => {
    onChange(field, currentItems.filter(item => item !== itemToRemove));
  };

  const toggleItem = (field, currentItems, item) => {
    if (currentItems.includes(item)) {
      removeItem(field, currentItems, item);
    } else {
      handleAddItem(field, currentItems, item, () => {});
    }
  };

  return (
    <div className="space-y-10 text-white">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight">Food Sensitivities</h2>
        <p className="text-slate-400 mt-2 text-lg">Help us avoid ingredients that don't work for you.</p>
      </div>

      {/* ALLERGIES SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Medical Allergies
          </Label>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">SAFETY CRITICAL</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {COMMON_ALLERGIES.map((allergy) => {
            const isSelected = allergies.includes(allergy);
            return (
              <button
                key={allergy}
                onClick={() => toggleItem('allergies', allergies, allergy)}
                className={cn(
                  "px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all",
                  isSelected 
                    ? "border-rose-500 bg-slate-900 text-white shadow-xl" 
                    : "border-slate-700 bg-slate-900 hover:border-rose-500/50 text-slate-300"
                )}
              >
                {allergy}
              </button>
            );
          })}
        </div>

        <form 
          className="flex gap-3" 
          onSubmit={(e) => { e.preventDefault(); handleAddItem('allergies', allergies, allergyInput, setAllergyInput); }}
        >
          <Input
            placeholder="Other allergy (e.g. Sesame)..."
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            className="h-14 rounded-3xl border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-rose-500"
          />
          <Button type="submit" size="icon" className="h-14 w-14 shrink-0 bg-slate-800 hover:bg-slate-700 rounded-3xl">
            <Plus className="w-5 h-5" />
          </Button>
        </form>

        {allergies.length > 0 && (
          <div className="flex flex-wrap gap-2 p-5 bg-slate-900/70 border border-rose-900/30 rounded-3xl">
            {allergies.map((a) => (
              <Badge key={a} className="bg-slate-800 border-rose-900 text-rose-300 px-4 py-2 rounded-2xl flex items-center gap-2">
                {a}
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-400" onClick={() => removeItem('allergies', allergies, a)} />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* DISLIKES SECTION */}
      <div className="space-y-6 pt-8 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Ban className="w-3.5 h-3.5" /> Ingredient Dislikes
          </Label>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PERSONAL TASTE</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {COMMON_DISLIKES.map((dislike) => {
            const isSelected = dislikes.includes(dislike);
            return (
              <button
                key={dislike}
                onClick={() => toggleItem('dislikes', dislikes, dislike)}
                className={cn(
                  "px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all",
                  isSelected 
                    ? "border-slate-400 bg-slate-900 text-white shadow-xl" 
                    : "border-slate-700 bg-slate-900 hover:border-slate-400 text-slate-300"
                )}
              >
                {dislike}
              </button>
            );
          })}
        </div>

        <form 
          className="flex gap-3"
          onSubmit={(e) => { e.preventDefault(); handleAddItem('dislikes', dislikes, dislikeInput, setDislikeInput); }}
        >
          <Input
            placeholder="Don't like (e.g. Mayo, Raisins)..."
            value={dislikeInput}
            onChange={(e) => setDislikeInput(e.target.value)}
            className="h-14 rounded-3xl border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-slate-400"
          />
          <Button type="submit" size="icon" className="h-14 w-14 shrink-0 bg-slate-800 hover:bg-slate-700 rounded-3xl">
            <Plus className="w-5 h-5" />
          </Button>
        </form>

        {dislikes.length > 0 && (
          <div className="flex flex-wrap gap-2 p-5 bg-slate-900/70 border border-slate-700 rounded-3xl">
            {dislikes.map((d) => (
              <Badge key={d} className="bg-slate-800 border-slate-700 text-slate-300 px-4 py-2 rounded-2xl flex items-center gap-2">
                {d}
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => removeItem('dislikes', dislikes, d)} />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* DISCLAIMER */}
      <div className="p-6 bg-slate-900 border border-slate-700 rounded-3xl flex items-start gap-4">
        <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-slate-400 text-sm leading-relaxed">
          SmartPrep filters recipes based on your selections. Always verify ingredient labels if you have severe allergies.
        </p>
      </div>
    </div>
  );
}