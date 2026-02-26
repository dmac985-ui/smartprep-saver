// --- MASTER GOALSSTEP.JSX ---
// FULL DARK THEME - MATCHES DIETARYSTEP & MEAL PLANNER

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  Check, TrendingDown, TrendingUp, Dumbbell, Heart, Zap, Brain, DollarSign, Sparkles 
} from "lucide-react";

const GOAL_OPTIONS = [
  { id: 'weight_loss',    name: 'Lose Weight',      icon: TrendingDown, color: 'from-blue-500 to-cyan-600' },
  { id: 'muscle_gain',    name: 'Gain Muscle',      icon: Dumbbell,     color: 'from-purple-500 to-violet-600' },
  { id: 'maintenance',    name: 'Maintain',         icon: TrendingUp,   color: 'from-emerald-500 to-teal-600' },
  { id: 'heart_health',   name: 'Improve Energy',   icon: Zap,          color: 'from-amber-500 to-orange-600' },
  { id: 'better_sleep',   name: 'Better Sleep',     icon: Heart,        color: 'from-rose-500 to-pink-600' },
  { id: 'general_health', name: 'General Health',   icon: Brain,        color: 'from-indigo-500 to-blue-600' },
];

const WEEKLY_TARGETS = [
  { id: 'lose_0.5', label: 'Lose 0.5 lb/week', sub: 'Gentle & Sustainable' },
  { id: 'lose_1',   label: 'Lose 1 lb/week',   sub: 'Recommended' },
  { id: 'lose_2',   label: 'Lose 2 lb/week',   sub: 'Aggressive' },
  { id: 'maintain', label: 'Maintain weight',  sub: 'Balance' },
  { id: 'gain_0.5', label: 'Gain 0.5 lb/week', sub: 'Lean Bulk' },
  { id: 'gain_1',   label: 'Gain 1 lb/week',   sub: 'Mass Build' },
];

export default function GoalsStep({ data = {}, onChange }) {
  const selectedGoals = Array.isArray(data.health_goals) ? data.health_goals : [];

  const toggleGoal = (goalId) => {
    const updated = selectedGoals.includes(goalId)
      ? selectedGoals.filter(g => g !== goalId)
      : [...selectedGoals, goalId];
    onChange('health_goals', updated);
  };

  const handleNumericInput = (field, val, isFloat = false) => {
    if (val === "") return onChange(field, "");
    const parsed = isFloat ? parseFloat(val) : parseInt(val, 10);
    onChange(field, isNaN(parsed) ? "" : parsed);
  };

  return (
    <div className="space-y-10 text-white">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tight">Your Objectives</h2>
        <p className="text-slate-400 mt-2 text-lg">What are we aiming for with your meal plan?</p>
      </div>

      {/* GOALS GRID */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Primary Goals</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GOAL_OPTIONS.map((goal) => {
            const Icon = goal.icon;
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={cn(
                  "relative p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden",
                  "bg-slate-900 border-slate-700 hover:border-slate-600",
                  isSelected && "border-emerald-500 bg-slate-800 shadow-2xl shadow-emerald-500/30 scale-[1.02]"
                )}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={cn(
                  "w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-all",
                  isSelected ? "bg-white text-slate-900" : `bg-gradient-to-br ${goal.color} text-white`
                )}>
                  <Icon className="w-9 h-9" />
                </div>

                <span className={cn(
                  "font-black text-xl text-center block transition-colors",
                  isSelected ? "text-white" : "text-slate-100"
                )}>
                  {goal.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* WEEKLY PACE */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Weekly Pace</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WEEKLY_TARGETS.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange('weekly_target', t.id)}
              className={cn(
                "flex flex-col px-6 py-5 rounded-3xl border-2 transition-all text-left",
                data.weekly_target === t.id
                  ? "border-emerald-500 bg-slate-800 text-white shadow-xl"
                  : "border-slate-700 bg-slate-900 hover:border-slate-600 text-slate-300"
              )}
            >
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">{t.sub}</span>
              <span className="font-bold text-lg mt-1">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* NUMERIC FIELDS */}
      <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Daily Calories</Label>
          <div className="relative">
            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <Input
              type="number"
              value={data.daily_calories ?? ''}
              onChange={(e) => handleNumericInput('daily_calories', e.target.value)}
              placeholder="Auto-calculated"
              className="h-14 pl-10 rounded-3xl border-slate-700 bg-slate-900 text-white font-bold focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Weekly Budget ($)</Label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <Input
              type="number"
              value={data.weekly_budget ?? ''}
              onChange={(e) => handleNumericInput('weekly_budget', e.target.value, true)}
              placeholder="e.g. 100"
              className="h-14 pl-10 rounded-3xl border-slate-700 bg-slate-900 text-white font-bold focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* TIP BOX */}
      <div className="p-6 bg-slate-900 border border-emerald-900/30 rounded-3xl flex items-start gap-4">
        <div className="bg-emerald-500/10 p-3 rounded-2xl">
          <Sparkles className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-slate-400 text-sm">
          SmartPrep prioritizes seasonal produce and bulk staples to stay under your budget.
        </p>
      </div>
    </div>
  );
}