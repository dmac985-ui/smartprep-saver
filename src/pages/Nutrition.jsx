import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Sparkles, Loader2, Activity } from "lucide-react";

import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import DailyNutritionCard from '@/components/nutrition/DailyNutritionCard';
import NutritionGoals from '@/components/nutrition/NutritionGoals';
import NutritionSummary from '@/components/nutrition/NutritionSummary';
import NutritionInsights from '@/components/nutrition/NutritionInsights';
import MicronutrientBreakdown from '@/components/nutrition/MicronutrientBreakdown';
import AdvancedGoals from '@/components/nutrition/AdvancedGoals';
import NutritionProgress from '@/components/nutrition/NutritionProgress';

export default function Nutrition() {
  const [timeRange, setTimeRange] = useState('week');

  const { data: profiles, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
  });

  const { data: nutritionLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['nutritionLogs'],
    queryFn: () => base44.entities.NutritionLog.list('-date', 90),
  });

  const profile = profiles?.[0];
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todayLog = useMemo(() => {
    if (!nutritionLogs || !Array.isArray(nutritionLogs)) return null;
    return nutritionLogs.find(log => log.date === todayStr);
  }, [nutritionLogs, todayStr]);

  const filteredLogs = useMemo(() => {
    if (!nutritionLogs || !Array.isArray(nutritionLogs)) return [];
    const now = new Date();
    let startDate;
    
    if (timeRange === 'week') {
      startDate = startOfWeek(now);
    } else if (timeRange === 'month') {
      startDate = startOfMonth(now);
    } else {
      startDate = subDays(now, 7);
    }
    
    return nutritionLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= now;
    });
  }, [nutritionLogs, timeRange]);

  const averages = useMemo(() => {
    if (!filteredLogs || !Array.isArray(filteredLogs) || !filteredLogs.length) return null;
    
    const total = filteredLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fats: acc.fats + (log.fats || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    
    const count = filteredLogs.length;
    return {
      calories: Math.round(total.calories / count),
      protein: Math.round(total.protein / count),
      carbs: Math.round(total.carbs / count),
      fats: Math.round(total.fats / count),
    };
  }, [filteredLogs]);

  if (profileLoading || logsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Health Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300 rounded-2xl text-center">
        ⚕️ <strong>Health Disclaimer:</strong> Nutrition information is for general guidance only — not medical advice. Always consult a qualified healthcare provider.
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Nutrition Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor your daily nutrition & goals</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Today's Progress */}
        <DailyNutritionCard log={todayLog} profile={profile} />

        {/* Goals Section */}
        <NutritionGoals profile={profile} />

        {/* Micronutrient Breakdown */}
        {todayLog && <MicronutrientBreakdown log={todayLog} />}

        {/* Advanced Goals */}
        <AdvancedGoals profile={profile} />

        {/* Progress Charts */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Progress & Trends</h2>
          <NutritionProgress logs={nutritionLogs} profile={profile} timeRange={30} />
        </div>

        {/* Time Range Tabs */}
        <Card className="bg-white/80 border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Nutrition Summary
              </CardTitle>
              <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
                <TabsList className="bg-slate-100">
                  <TabsTrigger value="week" className="text-xs">This Week</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs">This Month</TabsTrigger>
                  <TabsTrigger value="7days" className="text-xs">Last 7 Days</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {averages ? (
              <NutritionSummary 
                averages={averages} 
                profile={profile}
                logs={filteredLogs}
                timeRange={timeRange}
              />
            ) : (
              <p className="text-center text-slate-500 py-8">No nutrition data for this period</p>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        {filteredLogs && Array.isArray(filteredLogs) && filteredLogs.length > 0 && (
          <NutritionInsights logs={filteredLogs} profile={profile} timeRange={timeRange} />
        )}

        {/* Empty State */}
        {!todayLog && (!nutritionLogs || nutritionLogs.length === 0) && (
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Start Tracking Your Nutrition</h3>
              <p className="text-emerald-100 mb-6 max-w-md mx-auto">
                Use the AI assistant to log your meals and get personalized insights on your eating habits.
              </p>
              <Button 
                className="bg-white text-emerald-600 hover:bg-emerald-50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Log Your First Meal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}