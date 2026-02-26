import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lightbulb, TrendingUp, Award, Loader2 } from "lucide-react";

export default function NutritionInsights({ logs, profile, timeRange }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (logs && Array.isArray(logs) && logs.length > 0) {
      generateInsights();
    }
  }, [logs, timeRange]);

  const generateInsights = async () => {
    if (!logs || !Array.isArray(logs) || logs.length === 0) return;
    
    setIsLoading(true);
    try {
      const summary = logs.map(log => ({
        date: log.date,
        calories: log.calories || 0,
        protein: log.protein || 0,
        carbs: log.carbs || 0,
        fats: log.fats || 0,
        fiber: log.fiber || 0,
        vitamin_c: log.vitamin_c || 0,
        calcium: log.calcium || 0,
        iron: log.iron || 0,
      }));

      const goals = {
        calories: profile?.daily_calories || 2000,
        protein: profile?.protein_goal || 150,
        carbs: profile?.carbs_goal || 200,
        fats: profile?.fats_goal || 65,
        ...profile?.micronutrient_goals,
      };

      const healthObjectives = profile?.health_objectives || [];

      const prompt = `Analyze this nutrition tracking data and provide 3-4 concise, actionable insights:

Time Period: ${timeRange}
Goals: ${JSON.stringify(goals)}
Health Objectives: ${JSON.stringify(healthObjectives)}
Data: ${JSON.stringify(summary)}

Provide insights as a JSON array with format:
[
  {
    "type": "positive" | "neutral" | "attention",
    "title": "Brief insight title",
    "message": "One sentence explanation with specific recommendation"
  }
]

Focus on: consistency, progress toward goals, macro balance, micronutrient optimization, alignment with health objectives (like muscle gain, heart health, etc.), and practical tips.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  message: { type: "string" }
                }
              }
            }
          }
        }
      });

      setInsights(result.insights || []);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return Award;
      case 'attention': return TrendingUp;
      default: return Lightbulb;
    }
  };

  const getInsightStyle = (type) => {
    switch (type) {
      case 'positive': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'attention': return 'bg-amber-50 border-amber-200 text-amber-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <Card className="bg-white/80 border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <span className="ml-2 text-slate-500">Analyzing your nutrition data...</span>
          </div>
        ) : insights && Array.isArray(insights) && insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, idx) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border-2 ${getInsightStyle(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm leading-relaxed">{insight.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-4">
            Track more meals to unlock personalized insights
          </p>
        )}
      </CardContent>
    </Card>
  );
}