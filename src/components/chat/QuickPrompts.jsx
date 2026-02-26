import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, ShoppingCart, DollarSign, RefreshCw, Utensils, Activity } from "lucide-react";

const prompts = [
  {
    icon: Calendar,
    label: "Create 7-day meal plan",
    prompt: "Create a 7-day meal prep plan for me based on my profile and dietary preferences. Include breakfast, lunch, dinner, snacks, and dessert for each day.",
    color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
  },
  {
    icon: ShoppingCart,
    label: "Generate grocery list",
    prompt: "Generate a consolidated grocery list from my current meal plan, organized by category.",
    color: "text-blue-600 bg-blue-50 hover:bg-blue-100"
  },
  {
    icon: DollarSign,
    label: "Find best deals",
    prompt: "Search for the best grocery deals and compare prices across stores in my area for my grocery list.",
    color: "text-amber-600 bg-amber-50 hover:bg-amber-100"
  },
  {
    icon: RefreshCw,
    label: "Suggest alternatives",
    prompt: "I don't like one of the meals. Can you suggest 3 alternative recipes?",
    color: "text-purple-600 bg-purple-50 hover:bg-purple-100"
  },
  {
    icon: Utensils,
    label: "Show nutrition details",
    prompt: "Show me detailed nutritional breakdown for today's meals including all macros and micronutrients.",
    color: "text-rose-600 bg-rose-50 hover:bg-rose-100"
  },
  {
    icon: Activity,
    label: "Log today's meals",
    prompt: "I want to log my meals for today to track my nutrition. I had eggs and toast for breakfast.",
    color: "text-teal-600 bg-teal-50 hover:bg-teal-100"
  },
];

export default function QuickPrompts({ onSelect }) {
  const safePrompts = Array.isArray(prompts) ? prompts : [];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {safePrompts.map((prompt, idx) => {
        const Icon = prompt.icon;
        return (
          <button
            key={idx}
            onClick={() => onSelect(prompt.prompt)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${prompt.color}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-left">{prompt.label}</span>
          </button>
        );
      })}
    </div>
  );
}