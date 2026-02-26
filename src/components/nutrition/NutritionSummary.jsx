import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Beef, Wheat, Droplets, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function NutritionSummary({ averages, profile, logs, timeRange }) {
  if (!averages || !logs || !Array.isArray(logs)) return null;
  
  const goals = {
    calories: profile?.daily_calories || 2000,
    protein: profile?.protein_goal || 150,
    carbs: profile?.carbs_goal || 200,
    fats: profile?.fats_goal || 65,
  };

  const getTrend = (avg, goal) => {
    if (!goal) return null;
    const diff = avg - goal;
    const percent = Math.abs((diff / goal) * 100);
    
    if (Math.abs(diff) < goal * 0.05) return { icon: Minus, text: 'On target', color: 'emerald' };
    if (diff > 0) return { icon: TrendingUp, text: `${percent.toFixed(0)}% over`, color: 'orange' };
    return { icon: TrendingDown, text: `${percent.toFixed(0)}% under`, color: 'blue' };
  };

  const nutrients = [
    { 
      name: 'Calories', 
      icon: Flame, 
      avg: averages.calories, 
      goal: goals.calories, 
      unit: 'cal',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    { 
      name: 'Protein', 
      icon: Beef, 
      avg: averages.protein, 
      goal: goals.protein, 
      unit: 'g',
      color: 'text-rose-600',
      bgColor: 'bg-rose-100'
    },
    { 
      name: 'Carbs', 
      icon: Wheat, 
      avg: averages.carbs, 
      goal: goals.carbs, 
      unit: 'g',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    { 
      name: 'Fats', 
      icon: Droplets, 
      avg: averages.fats, 
      goal: goals.fats, 
      unit: 'g',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {nutrients && Array.isArray(nutrients) && nutrients.map((nutrient) => {
          const Icon = nutrient.icon;
          const trend = getTrend(nutrient.avg, nutrient.goal);
          const percent = nutrient.goal ? Math.min((nutrient.avg / nutrient.goal) * 100, 100) : 0;
          const TrendIcon = trend?.icon;

          return (
            <div key={nutrient.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg ${nutrient.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${nutrient.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{nutrient.name}</p>
                    <p className="text-xs text-slate-500">Daily Average</p>
                  </div>
                </div>
                {trend && (
                  <Badge variant="outline" className={`border-${trend.color}-200 text-${trend.color}-700`}>
                    <TrendIcon className="w-3 h-3 mr-1" />
                    {trend.text}
                  </Badge>
                )}
              </div>
              
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-3xl font-bold ${nutrient.color}`}>
                    {nutrient.avg}
                  </span>
                  <span className="text-slate-500">
                    {nutrient.unit} / {nutrient.goal} {nutrient.unit}
                  </span>
                </div>
                <Progress value={percent} className="h-2" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          Based on {logs.length} days of data in the selected {timeRange === '7days' ? 'last 7 days' : timeRange}.
        </p>
      </div>
    </div>
  );
}