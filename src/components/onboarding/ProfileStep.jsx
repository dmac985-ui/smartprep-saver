// --- MASTER PROFILESTEP.JSX ---
// FIXED: Gender and Activity dropdowns now have proper contrast (no more invisible text)

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  User, 
  Calendar, 
  Scale, 
  Ruler, 
  Zap, 
  MapPin,
  CircleDashed
} from "lucide-react";

export default function ProfileStep({ data = {}, onChange }) {
  
  const handleNumericChange = (field, value) => {
    const clean = value.replace(/[^0-9]/g, '');
    onChange(field, clean);
  };

  const FieldLabel = ({ icon: Icon, label, htmlFor }) => (
    <Label 
      htmlFor={htmlFor} 
      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 mb-2"
    >
      <Icon className="w-3 h-3 text-emerald-500" />
      {label}
    </Label>
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">The Essentials</h2>
        <p className="text-slate-500 mt-2 font-medium">We use this to calculate your metabolic baseline (TDEE).</p>
      </div>

      {/* CORE BIOMETRICS */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <FieldLabel icon={Calendar} label="Age" htmlFor="age" />
          <Input
            id="age"
            type="text"
            inputMode="numeric"
            placeholder="25"
            value={data.age ?? ''}
            onChange={(e) => handleNumericChange('age', e.target.value)}
            className="h-14 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-bold text-lg px-4 text-slate-900 bg-white"
          />
        </div>

        <div className="space-y-1">
          <FieldLabel icon={User} label="Gender" htmlFor="gender" />
          <Select value={data.gender || ''} onValueChange={(v) => onChange('gender', v)}>
            <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold text-lg px-4 text-slate-900 dark:text-white bg-white dark:bg-slate-800">
              <SelectValue placeholder="Select gender" className="text-slate-500 dark:text-slate-400" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <FieldLabel icon={Scale} label="Weight (lbs)" htmlFor="weight" />
          <Input
            id="weight"
            type="text"
            inputMode="numeric"
            placeholder="150"
            value={data.weight ?? ''}
            onChange={(e) => handleNumericChange('weight', e.target.value)}
            className="h-14 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-bold text-lg px-4 text-slate-900 bg-white"
          />
        </div>

        <div className="space-y-1">
          <FieldLabel icon={Ruler} label="Height (in)" htmlFor="height" />
          <Input
            id="height"
            type="text"
            inputMode="numeric"
            placeholder="65"
            value={data.height ?? ''}
            onChange={(e) => handleNumericChange('height', e.target.value)}
            className="h-14 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-bold text-lg px-4 text-slate-900 bg-white"
          />
        </div>
      </div>

      {/* LIFESTYLE & LOCATION */}
      <div className="space-y-6 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <FieldLabel icon={Zap} label="Daily Activity Level" htmlFor="activity" />
          <Select value={data.activity_level || ''} onValueChange={(v) => onChange('activity_level', v)}>
            <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold text-lg px-4 text-slate-900 dark:text-white bg-white dark:bg-slate-800">
              <SelectValue placeholder="How active are you?" className="text-slate-500 dark:text-slate-400" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="sedentary" className="py-3">
                <div className="flex flex-col">
                  <span className="font-bold">Sedentary</span>
                  <span className="text-[10px] text-slate-400 font-medium">Office job, little to no exercise</span>
                </div>
              </SelectItem>
              <SelectItem value="lightly_active" className="py-3">
                <div className="flex flex-col">
                  <span className="font-bold">Lightly Active</span>
                  <span className="text-[10px] text-slate-400 font-medium">Light exercise 1-3 days / week</span>
                </div>
              </SelectItem>
              <SelectItem value="moderately_active" className="py-3">
                <div className="flex flex-col">
                  <span className="font-bold">Moderately Active</span>
                  <span className="text-[10px] text-slate-400 font-medium">Moderate exercise 3-5 days / week</span>
                </div>
              </SelectItem>
              <SelectItem value="very_active" className="py-3">
                <div className="flex flex-col">
                  <span className="font-bold">Very Active</span>
                  <span className="text-[10px] text-slate-400 font-medium">Hard exercise 6-7 days / week</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <FieldLabel icon={MapPin} label="Zip Code" htmlFor="zip" />
          <Input
            id="zip"
            type="text"
            maxLength={5}
            placeholder="90210"
            value={data.zip_code || ''}
            onChange={(e) => onChange('zip_code', e.target.value.replace(/\D/g, ''))}
            className="h-14 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-bold text-lg px-4 text-slate-900 bg-white"
          />
          <div className="flex items-center gap-1.5 mt-2 text-slate-400">
            <CircleDashed className="w-3 h-3 animate-spin-slow" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Scanning local grocery deals...</p>
          </div>
        </div>
      </div>
    </div>
  );
}