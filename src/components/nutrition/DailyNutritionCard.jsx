import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, Beef, Wheat, Droplets, CheckCircle, TrendingUp } from "lucide-react";
import { format } from 'date-fns';

export default function DailyNutritionCard({ log, profile }) {
  const today = format(new Date(), 'EEEE, MMMM d');
  
  const goals = {
    calories: profile?.daily_calories || 2000,
    protein: profile?.protein_goal || 150,
    carbs: profile?.carbs_goal || 200,
    fats: profile?.fats_goal || 65,
  };

  const current = {
    calories: log?.calories || 0,
    protein: log?.protein || 0,
    carbs: log?.carbs || 0,
    fats: log?.fats || 0,
  };

  const percentages = {
    calories: goals.calories ? Math.min((current.calories / goals.calories) * 100, 100) : 0,
    protein: goals.protein ? Math.min((current.protein / goals.protein) * 100, 100) : 0,
    carbs: goals.carbs ? Math.min((current.carbs / goals.carbs) * 100, 100) : 0,
    fats: goals.fats ? Math.min((current.fats / goals.fats) * 100, 100) : 0,
  };

  const nutrients = [
    { name: 'Protein', icon: Beef, current: current.protein, goal: goals.protein, color: 'rose', percent: percentages.protein },
    { name: 'Carbs', icon: Wheat, current: current.carbs, goal: goals.carbs, color: 'amber', percent: percentages.carbs },
    { name: 'Fats', icon: Droplets, current: current.fats, goal: goals.fats, color: 'blue', percent: percentages.fats },
  ];

  return (
    <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-xl shadow-emerald-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <CardTitle className="text-lg">{today}</CardTitle>
          </div>
          {log && (
            <Badge className="bg-white/20 text-white border-0">
              <CheckCircle className="w-3 h-3 mr-1" />
              Logged
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5" />
              <span className="font-semibold">Calories</span>
            </div>
            <span className="text-2xl font-bold">
              {current.calories} <span className="text-sm font-normal text-emerald-100">/ {goals.calories}</span>
            </span>
          </div>
          <Progress value={percentages.calories} className="h-3 bg-white/20" />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          {nutrients.map((nutrient) => {
            const Icon = nutrient.icon;
            return (
              <div key={nutrient.name}>
                <div className="flex items-center gap-1 mb-1">
                  <Icon className="w-3 h-3" />
                  <span className="text-xs text-emerald-100">{nutrient.name}</span>
                </div>
                <p className="text-xl font-bold">{nutrient.current}g</p>
                <p className="text-xs text-emerald-100">of {nutrient.goal}g</p>
                <Progress value={nutrient.percent} className="h-1.5 bg-white/20 mt-1" />
              </div>
            );
          })}
        </div>

        {/* Meals Today */}
        {log?.meals && Array.isArray(log.meals) && log.meals.length > 0 && (
          <div className="pt-3 border-t border-white/20">
            <p className="text-sm text-emerald-100 mb-2">{log.meals.length} meals logged today</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}