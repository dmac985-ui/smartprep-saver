import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { format, subDays } from 'date-fns';

export default function NutritionProgress({ logs, profile, timeRange = 30 }) {
  const chartData = useMemo(() => {
    if (!logs || !Array.isArray(logs)) return [];
    
    const now = new Date();
    const data = [];
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = logs.find(l => l.date === dateStr);
      
      data.push({
        date: format(date, 'MMM d'),
        calories: log?.calories || 0,
        protein: log?.protein || 0,
        carbs: log?.carbs || 0,
        fats: log?.fats || 0,
        calorieGoal: profile?.daily_calories || 0,
        proteinGoal: profile?.protein_goal || 0,
      });
    }
    
    return data;
  }, [logs, profile, timeRange]);

  const micronutrientData = useMemo(() => {
    if (!logs || !Array.isArray(logs)) return [];
    
    const now = new Date();
    const data = [];
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = logs.find(l => l.date === dateStr);
      
      data.push({
        date: format(date, 'MMM d'),
        fiber: log?.fiber || 0,
        vitamin_c: log?.vitamin_c || 0,
        calcium: log?.calcium || 0,
        iron: log?.iron || 0,
      });
    }
    
    return data;
  }, [logs, timeRange]);

  const trends = useMemo(() => {
    if (!chartData || !Array.isArray(chartData) || chartData.length < 7) return null;
    
    const recent = chartData.slice(-7);
    const older = chartData.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.calories, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.calories, 0) / older.length;
    
    const calorieChange = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      calories: {
        change: calorieChange,
        trend: calorieChange > 0 ? 'up' : 'down'
      }
    };
  }, [chartData]);

  if (!logs || logs.length === 0) {
    return (
      <Card className="bg-white/80 border-slate-200">
        <CardContent className="p-12 text-center">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Start tracking meals to see your progress over time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trends Summary */}
      {trends && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Calorie Trend</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {trends.calories.change > 0 ? '+' : ''}{trends.calories.change.toFixed(1)}%
                  </p>
                </div>
                {trends.calories.trend === 'up' ? (
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-rose-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">Last 7 days vs previous week</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Macros Chart */}
      <Card className="bg-white/80 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Calorie & Macro Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Calories" />
              <Line type="monotone" dataKey="calorieGoal" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" name="Goal" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Macros Breakdown */}
      <Card className="bg-white/80 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Macronutrient Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={(chartData && Array.isArray(chartData)) ? chartData.slice(-7) : []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="protein" fill="#f43f5e" name="Protein (g)" />
              <Bar dataKey="carbs" fill="#f59e0b" name="Carbs (g)" />
              <Bar dataKey="fats" fill="#3b82f6" name="Fats (g)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Micronutrients Chart */}
      <Card className="bg-white/80 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Micronutrient Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={micronutrientData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="fiber" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} name="Fiber (g)" />
              <Line type="monotone" dataKey="vitamin_c" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} name="Vitamin C (mg)" />
              <Line type="monotone" dataKey="calcium" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} name="Calcium (mg)" />
              <Line type="monotone" dataKey="iron" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} name="Iron (mg)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}