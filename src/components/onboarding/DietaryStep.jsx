// --- MASTER DIETARYSTEP.JSX ---
// FULL COLOR + FIXED TEXT CUT-OFF + PREMIUM DARK THEME

import React from 'react';
import { cn } from "@/lib/utils";
import { 
  Check, Flame, Leaf, Apple, Beef, Salad, Scale, Zap, 
  WheatOff, Droplets, Fish, Sparkles, Heart 
} from "lucide-react";

// 13 DIETS WITH VIBRANT COLORS
const diets = [
  { id: 'Keto',         name: 'Keto',         icon: Flame,   desc: 'HIGH FAT, VERY LOW CARB',     color: 'from-orange-500 to-red-600' },
  { id: 'Vegan',        name: 'Vegan',        icon: Leaf,    desc: 'PLANT-BASED ONLY',            color: 'from-emerald-500 to-green-600' },
  { id: 'Vegetarian',   name: 'Vegetarian',   icon: Apple,   desc: 'NO MEAT OR FISH',             color: 'from-lime-500 to-emerald-600' },
  { id: 'Paleo',        name: 'Paleo',        icon: Beef,    desc: 'WHOLE FOODS, NO GRAINS',      color: 'from-amber-500 to-orange-600' },
  { id: 'Mediterranean',name: 'Mediterranean',icon: Salad,   desc: 'HEART-HEALTHY FRAMEWORK',     color: 'from-sky-500 to-blue-600' },
  { id: 'Low Carb',     name: 'Low Carb',     icon: Scale,   desc: 'REDUCED CARBOHYDRATE INTAKE', color: 'from-indigo-500 to-violet-600' },
  { id: 'High Protein', name: 'High Protein', icon: Zap,     desc: 'MUSCLE BUILDING FOCUSED',     color: 'from-rose-500 to-pink-600' },
  { id: 'Gluten Free',  name: 'Gluten Free',  icon: WheatOff,desc: 'NO WHEAT, BARLEY, OR RYE',     color: 'from-yellow-500 to-amber-600' },
  { id: 'Dairy Free',   name: 'Dairy Free',   icon: Droplets,desc: 'NO MILK-BASED PRODUCTS',      color: 'from-cyan-500 to-teal-600' },
  { id: 'Pescetarian',  name: 'Pescetarian',  icon: Fish,    desc: 'VEGETARIAN + SEAFOOD',        color: 'from-blue-500 to-cyan-600' },
  { id: 'Whole30',      name: 'Whole30',      icon: Sparkles,desc: '30-DAY RESET PROGRAM',        color: 'from-purple-500 to-violet-600' },
  { id: 'Carnivore',    name: 'Carnivore',    icon: Beef,    desc: 'ANIMAL PRODUCTS ONLY',        color: 'from-red-500 to-rose-600' },
  { id: 'DASH',         name: 'DASH',         icon: Heart,   desc: 'BLOOD PRESSURE FOCUSED',      color: 'from-pink-500 to-rose-600' },
];

export default function DietaryStep({ data = {}, onChange }) {
  const currentSelection = data?.dietary_framework || '';

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-white tracking-tight">Dietary Framework</h2>
        <p className="text-slate-400 mt-3 text-lg">Select your primary nutritional guide</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {diets.map((diet) => {
          const Icon = diet.icon;
          const isSelected = currentSelection === diet.id;

          return (
            <button
              key={diet.id}
              type="button"
              onClick={() => onChange('dietary_framework', diet.id)}
              className={cn(
                "group relative p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden",
                "bg-slate-900 border-slate-700 hover:border-slate-500",
                isSelected && "border-emerald-500 bg-slate-800 shadow-2xl shadow-emerald-500/30 scale-[1.02]"
              )}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Colored Icon Background */}
              <div className={cn(
                "w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-all",
                isSelected ? "bg-white text-slate-900" : `bg-gradient-to-br ${diet.color} text-white`
              )}>
                <Icon className="w-9 h-9" />
              </div>

              {/* Name */}
              <h3 className={cn(
                "font-black text-xl text-center mb-1 transition-colors",
                isSelected ? "text-white" : "text-slate-100"
              )}>
                {diet.name}
              </h3>

              {/* Description */}
              <p className="text-center text-xs text-slate-400 font-medium leading-tight">
                {diet.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* AI Sync Box - Dark & Colored */}
      <div className="mt-10 p-6 bg-slate-900 border border-emerald-900/30 rounded-3xl flex items-start gap-4">
        <div className="bg-emerald-500/10 p-3 rounded-2xl">
          <Sparkles className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest">AI Synchronization Active</p>
          <p className="text-slate-400 text-sm leading-relaxed mt-1">
            Your choice here instantly configures your full 7-day meal plan.<br />
            You can still swap meals or change frameworks anytime in the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}