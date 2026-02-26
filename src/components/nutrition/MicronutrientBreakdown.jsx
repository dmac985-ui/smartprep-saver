import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Pill, Heart, Eye, Bone, Droplet } from "lucide-react";

export default function MicronutrientBreakdown({ log }) {
  if (!log) return null;

  if (!log) return null;

  const micronutrients = [
    {
      name: 'Fiber',
      icon: Pill,
      value: log.fiber || 0,
      goal: 30,
      unit: 'g',
      color: 'emerald',
      description: 'Daily fiber intake'
    },
    {
      name: 'Sugar',
      icon: Heart,
      value: log.sugar || 0,
      goal: 50,
      unit: 'g',
      color: 'red',
      description: 'Added sugars',
      warning: true
    },
    {
      name: 'Sodium',
      icon: Droplet,
      value: log.sodium || 0,
      goal: 2300,
      unit: 'mg',
      color: 'blue',
      description: 'Daily sodium intake',
      warning: true
    },
    {
      name: 'Cholesterol',
      icon: Heart,
      value: log.cholesterol || 0,
      goal: 300,
      unit: 'mg',
      color: 'rose',
      description: 'Daily cholesterol',
      warning: true
    },
  ];

  const vitamins = [
    {
      name: 'Vitamin A',
      value: log.vitamin_a || 0,
      goal: 900,
      unit: 'mcg',
      icon: Eye
    },
    {
      name: 'Vitamin C',
      value: log.vitamin_c || 0,
      goal: 90,
      unit: 'mg',
      icon: Pill
    },
    {
      name: 'Vitamin D',
      value: log.vitamin_d || 0,
      goal: 20,
      unit: 'mcg',
      icon: Bone
    },
    {
      name: 'Calcium',
      value: log.calcium || 0,
      goal: 1000,
      unit: 'mg',
      icon: Bone
    },
    {
      name: 'Iron',
      value: log.iron || 0,
      goal: 18,
      unit: 'mg',
      icon: Droplet
    },
    {
      name: 'Potassium',
      value: log.potassium || 0,
      goal: 3400,
      unit: 'mg',
      icon: Heart
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Micronutrients */}
      <Card className="bg-white/80 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Key Micronutrients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {micronutrients && Array.isArray(micronutrients) && micronutrients.map((nutrient) => {
              const Icon = nutrient.icon;
              const percent = Math.min((nutrient.value / nutrient.goal) * 100, 100);
              const isOver = nutrient.value > nutrient.goal && nutrient.warning;
              
              return (
                <div key={nutrient.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-${nutrient.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${nutrient.color}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{nutrient.name}</p>
                        <p className="text-xs text-slate-500">{nutrient.description}</p>
                      </div>
                    </div>
                    {isOver && (
                      <Badge variant="outline" className="border-orange-200 text-orange-700 text-xs">
                        Over
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-slate-800">
                      {nutrient.value}
                    </span>
                    <span className="text-sm text-slate-500">
                      / {nutrient.goal} {nutrient.unit}
                    </span>
                  </div>
                  <Progress 
                    value={percent} 
                    className={`h-2 ${isOver ? 'bg-orange-100' : ''}`}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Vitamins & Minerals */}
      <Card className="bg-white/80 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Vitamins & Minerals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {vitamins && Array.isArray(vitamins) && vitamins.map((vitamin) => {
              const Icon = vitamin.icon;
              const percent = Math.min((vitamin.value / vitamin.goal) * 100, 100);
              
              return (
                <div key={vitamin.name} className="text-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <Icon className="w-5 h-5 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-700 mb-1">{vitamin.name}</p>
                  <p className="text-lg font-bold text-slate-800">
                    {vitamin.value}
                  </p>
                  <p className="text-xs text-slate-500 mb-2">
                    / {vitamin.goal} {vitamin.unit}
                  </p>
                  <Progress value={percent} className="h-1" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}