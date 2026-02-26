// --- MASTER REVIEWSTEP.JSX ---
// FULL DARK THEME - MATCHES THE REST OF THE APP

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Pencil, 
  User, 
  Utensils, 
  Target, 
  ShieldAlert, 
  Info,
  CheckCircle2
} from "lucide-react";

// AUTHORITATIVE MAPPING - SYNCHRONIZED WITH DIETARYSTEP
const DIET_LABELS = {
  'Keto': 'Keto',
  'Vegan': 'Vegan',
  'Vegetarian': 'Vegetarian',
  'Paleo': 'Paleo',
  'Mediterranean': 'Mediterranean',
  'Low Carb': 'Low Carb',
  'High Protein': 'High Protein',
  'Gluten Free': 'Gluten Free',
  'Dairy Free': 'Dairy Free',
  'Pescetarian': 'Pescetarian',
  'Whole30': 'Whole30',
  'Carnivore': 'Carnivore',
  'DASH': 'DASH'
};

const GOAL_LABELS = {
  weight_loss: 'Lose Weight',
  muscle_gain: 'Gain Muscle',
  maintenance: 'Maintain Weight',
  heart_health: 'Improve Energy',
  better_sleep: 'Better Sleep',
  general_health: 'General Health',
};

const WEEKLY_TARGET_LABELS = {
  'lose_0.5': 'Lose 0.5 lb/week',
  'lose_1': 'Lose 1 lb/week',
  'lose_2': 'Lose 2 lb/week',
  'gain_0.5': 'Gain 0.5 lb/week',
  'gain_1': 'Gain 1 lb/week',
  'maintain': 'Maintain weight',
};

export default function ReviewStep({ data, onGoToStep }) {
  const Row = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
      <span className="text-slate-400 text-sm font-medium">{label}</span>
      <span className="font-bold text-white text-sm text-right max-w-[60%]">
        {value || <span className="text-slate-500 font-normal">Not set</span>}
      </span>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, step }) => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-black text-white uppercase text-xs tracking-widest flex items-center gap-2">
        <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
          <Icon className="w-3.5 h-3.5" />
        </div>
        {title}
      </h3>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onGoToStep(step)} 
        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-8 rounded-xl font-bold text-xs transition-all"
      >
        <Pencil className="w-3 h-3 mr-1.5" /> Edit
      </Button>
    </div>
  );

  return (
    <div className="space-y-8 text-white">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
          <CheckCircle2 className="w-3 h-3" /> Final Verification
        </div>
        <h2 className="text-3xl font-black tracking-tight">Review Your Profile</h2>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          Everything looks correct? Your 7-day plan will be generated based on these parameters.
        </p>
      </div>

      <div className="space-y-4">
        {/* PROFILE SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
          <SectionHeader icon={User} title="Physical Profile" step={1} />
          <div className="grid grid-cols-1 gap-1">
            <Row label="Age" value={data.age ? `${data.age} years` : null} />
            <Row label="Gender" value={data.gender ? (data.gender.charAt(0).toUpperCase() + data.gender.slice(1)) : null} />
            <Row label="Weight" value={data.weight ? `${data.weight} lbs` : null} />
            <Row label="Height" value={data.height ? `${data.height} inches` : null} />
            <Row label="Activity Level" value={data.activity_level?.replace(/_/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase())} />
            <Row label="ZIP Code" value={data.zip_code} />
          </div>
        </div>

        {/* DIET SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
          <SectionHeader icon={Utensils} title="Nutritional Framework" step={2} />
          <Row label="Active Diet" value={DIET_LABELS[data.dietary_framework] || data.dietary_framework} />
        </div>

        {/* GOALS SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
          <SectionHeader icon={Target} title="Goals & Budget" step={3} />
          <div className="mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Health Objectives</p>
            <div className="flex flex-wrap gap-2">
              {(data.health_goals || []).length > 0 ? (
                data.health_goals.map(g => (
                  <Badge key={g} className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 rounded-lg px-3 py-1 text-[10px] font-bold uppercase">
                    {GOAL_LABELS[g] || g.replace(/_/g, ' ')}
                  </Badge>
                ))
              ) : (
                <span className="text-slate-500 text-sm italic">No goals selected</span>
              )}
            </div>
          </div>
          <Row label="Weekly Target" value={WEEKLY_TARGET_LABELS[data.weekly_target]} />
          <Row label="Daily Calories" value={data.daily_calories ? `${data.daily_calories} kcal` : 'Auto-calculated'} />
          <Row label="Weekly Budget" value={data.weekly_budget ? `$${data.weekly_budget}` : null} />
        </div>

        {/* RESTRICTIONS SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
          <SectionHeader icon={ShieldAlert} title="Sensitivities" step={4} />
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {(data.allergies || []).length > 0
                  ? data.allergies.map(a => <Badge key={a} className="bg-rose-500/10 border-rose-500/30 text-rose-300 rounded-lg px-3 py-1 text-[10px] font-bold uppercase">{a}</Badge>)
                  : <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">None reported</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Ingredient Dislikes</p>
              <div className="flex flex-wrap gap-2">
                {(data.dislikes || []).length > 0
                  ? data.dislikes.map(d => <Badge key={d} className="bg-orange-500/10 border-orange-500/30 text-orange-300 rounded-lg px-3 py-1 text-[10px] font-bold uppercase">{d}</Badge>)
                  : <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">None reported</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-start gap-4">
        <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-slate-400 text-sm leading-relaxed">
          SmartPrep Saver is an AI assistant. Please verify recipes against your medical dietary requirements.
        </p>
      </div>
    </div>
  );
}