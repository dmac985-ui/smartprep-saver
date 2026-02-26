import React from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Sparkles, Calendar, ShoppingCart, DollarSign,
  ChefHat, Leaf, TrendingDown, ArrowRight, Loader2,
  ChevronRight, Clock, Flame, Target, Zap
} from "lucide-react";
import { createPageUrl } from "@/utils";

const QUOTES = [
  "Eat well. Live well. Save well.",
  "Your body is a temple. Feed it wisely.",
  "Great meals start with great planning.",
  "Food is fuel. Make every bite count.",
];

const FEATURES = [
  { icon: ChefHat, title: "AI Meal Planning", description: "Personalized 7-day plans based on your goals", color: "from-emerald-500 to-teal-500", light: "bg-emerald-50 dark:bg-emerald-950/30" },
  { icon: Leaf, title: "10+ Diet Types", description: "Keto, Mediterranean, Vegan, Paleo & more", color: "from-teal-500 to-cyan-500", light: "bg-teal-50 dark:bg-teal-950/30" },
  { icon: DollarSign, title: "Smart Savings", description: "Auto deal scanning at local stores", color: "from-amber-500 to-yellow-500", light: "bg-amber-50 dark:bg-amber-950/30" },
  { icon: TrendingDown, title: "Reduce Waste", description: "Shared ingredients across meals", color: "from-rose-500 to-pink-500", light: "bg-rose-50 dark:bg-rose-950/30" },
];

const quote = QUOTES[new Date().getDay() % QUOTES.length];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Home() {
  const navigate = useNavigate();

  const { data: profiles, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
  });

  const { data: mealPlans } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-created_date', 1),
    enabled: !!profiles?.[0]?.onboarding_complete,
  });

  const { data: groceryLists } = useQuery({
    queryKey: ['groceryLists'],
    queryFn: () => base44.entities.GroceryList.list('-created_date', 1),
    enabled: !!profiles?.[0]?.onboarding_complete,
  });

  const profile = profiles?.[0];
  const hasProfile = profile?.onboarding_complete;

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  /* ─── LOGGED-IN DASHBOARD ─── */
  if (hasProfile) {
    const currentMealPlan = mealPlans?.[0];
    const currentGroceryList = groceryLists?.[0];
    const groceryItems = currentGroceryList?.items || [];
    const checkedCount = groceryItems.filter(i => i.checked).length;
    const savings = currentMealPlan?.potential_savings || 0;
    const totalCost = currentMealPlan?.total_estimated_cost || 0;
    const tdee = profile?.daily_calories || 2000;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const diet = profile?.dietary_framework || 'balanced';

    return (
      <div className="min-h-screen py-6 lg:py-8 max-w-7xl mx-auto space-y-6">

        {/* ── Health Disclaimer ── */}
        <motion.div {...fadeUp(0)} className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl px-5 py-3 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-3">
          <span className="text-lg shrink-0">⚕️</span>
          <p><strong>Health Disclaimer:</strong> SmartPrep Saver provides general nutrition information only — not medical advice. Consult your healthcare provider before changing your diet.</p>
        </motion.div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-auto">

          {/* HERO TILE — spans 4 cols on xl */}
          <motion.div {...fadeUp(0.05)} className="sm:col-span-2 lg:col-span-2 xl:col-span-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 dark:from-emerald-700 dark:to-teal-900 p-8 shadow-2xl shadow-emerald-500/20 flex flex-col justify-between min-h-[260px]">
            {/* decorative circles */}
            <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-8 w-32 h-32 rounded-full bg-teal-400/20 blur-xl" />

            <div className="relative z-10">
              <p className="text-emerald-200 text-sm font-medium mb-1 tracking-wide">{today}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-emerald-100/90 text-lg">
                {tdee.toLocaleString()} kcal/day &middot; <span className="capitalize">{diet}</span>
                {profile?.zip_code && <span className="ml-2 opacity-70">&middot; 📍 {profile.zip_code}</span>}
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                onClick={() => navigate(createPageUrl('MealPlan'))}
                className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg font-bold px-6 py-3 rounded-2xl transition-all hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {currentMealPlan ? 'View My Plan' : 'Generate My Plan'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(createPageUrl('GroceryList'))}
                className="text-white border border-white/30 hover:bg-white/10 rounded-2xl px-5"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Grocery List
              </Button>
            </div>
          </motion.div>

          {/* SAVINGS TILE */}
          <motion.div {...fadeUp(0.1)} className="xl:col-span-2 rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-200/50 dark:border-amber-800/30 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0.5 duration-300 min-h-[160px]">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <Badge className="bg-amber-500 text-white border-none px-3 py-1 rounded-xl font-bold">This Week</Badge>
            </div>
            <div>
              <p className="text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Estimated Savings</p>
              <p className="text-4xl font-extrabold text-amber-700 dark:text-amber-300">${savings.toFixed(0)}</p>
              <p className="text-amber-600/70 dark:text-amber-500 text-sm mt-1">vs. eating out every day</p>
            </div>
          </motion.div>

          {/* QUOTE TILE */}
          <motion.div {...fadeUp(0.12)} className="sm:col-span-2 lg:col-span-2 xl:col-span-3 rounded-3xl bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/40 p-6 shadow-sm flex flex-col justify-center min-h-[140px]">
            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3">Daily Insight</p>
            <blockquote className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-snug italic">
              "{quote}"
            </blockquote>
          </motion.div>

          {/* STATS ROW — 3 small tiles */}
          {[
            { icon: Calendar, label: 'Days Planned', value: currentMealPlan?.meals?.length || 0, sub: 'this week', color: 'emerald' },
            { icon: ShoppingCart, label: 'Groceries', value: `${checkedCount}/${groceryItems.length}`, sub: 'items checked', color: 'teal' },
            { icon: Flame, label: 'Daily Calories', value: tdee.toLocaleString(), sub: 'kcal target', color: 'rose' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div key={idx} {...fadeUp(0.14 + idx * 0.05)}
                className={`xl:col-span-1 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3 min-h-[130px]
                  ${stat.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/40 dark:border-emerald-800/30' :
                    stat.color === 'teal' ? 'bg-teal-50 dark:bg-teal-950/30 border border-teal-200/40 dark:border-teal-800/30' :
                    'bg-rose-50 dark:bg-rose-950/30 border border-rose-200/40 dark:border-rose-800/30'}`}
              >
                <Icon className={`w-6 h-6 ${stat.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : stat.color === 'teal' ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500 dark:text-rose-400'}`} />
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.sub}</p>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{stat.label}</p>
              </motion.div>
            );
          })}

          {/* GROCERY PREVIEW TILE */}
          <motion.div {...fadeUp(0.22)} className="sm:col-span-2 lg:col-span-2 xl:col-span-3 rounded-3xl bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/40 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Grocery List</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('GroceryList'))} className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl text-xs">
                View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            {groceryItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Approve a meal plan to generate your list</p>
              </div>
            ) : (
              <div className="space-y-2">
                {groceryItems.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.checked ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <span className={`text-sm font-medium ${item.checked ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">${(item.estimated_price || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* QUICK ACTIONS — 2 tiles */}
          {[
            { label: 'Meal Planner', desc: currentMealPlan ? 'View & swap meals' : 'Create your first plan', icon: Calendar, page: 'MealPlan', gradient: 'from-emerald-500 to-teal-600' },
            { label: 'Savings Hub', desc: 'Find best local deals', icon: DollarSign, page: 'SavingsHub', gradient: 'from-amber-500 to-orange-500' },
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.div key={idx} {...fadeUp(0.26 + idx * 0.06)}
                className="xl:col-span-2 rounded-3xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate(createPageUrl(action.page))}
              >
                <div className={`bg-gradient-to-br ${action.gradient} p-6 h-full min-h-[140px] flex flex-col justify-between`}>
                  <Icon className="w-9 h-9 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <h3 className="text-xl font-bold text-white">{action.label}</h3>
                    <p className="text-white/70 text-sm mt-1">{action.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* TIME SAVINGS TILE */}
          <motion.div {...fadeUp(0.3)} className="sm:col-span-2 xl:col-span-2 rounded-3xl bg-slate-900 dark:bg-slate-950 p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
            <Clock className="w-7 h-7 text-emerald-400" />
            <div>
              <p className="text-4xl font-extrabold text-white">~4 hrs</p>
              <p className="text-slate-400 text-sm mt-1">saved vs. manual planning</p>
              <p className="text-xs font-semibold text-emerald-400 mt-3 uppercase tracking-wider">This week's estimate</p>
            </div>
          </motion.div>

        </div>
      </div>
    );
  }

  /* ─── LANDING PAGE (logged-out) ─── */
  return (
    <div className="min-h-screen py-10 md:py-16 max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-auto">

        {/* HERO */}
        <motion.div {...fadeUp(0)} className="sm:col-span-2 lg:col-span-4 xl:col-span-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-10 md:p-14 flex flex-col justify-center min-h-[340px] shadow-2xl shadow-emerald-500/25">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-white/90 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> AI-Powered Nutrition
            </div>
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] mb-4">
              SmartPrep <br /><span className="text-emerald-200">Saver</span>
            </h1>
            <p className="text-xl text-emerald-100/90 max-w-xl mb-8">
              7 days of perfect meals. Zero stress. Real grocery savings.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigate(createPageUrl('Onboarding'))}
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-4 rounded-2xl text-lg shadow-xl transition-all hover:scale-105"
              >
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate(createPageUrl('Onboarding') + '?demo=1')}
                className="text-white border border-white/30 hover:bg-white/10 px-7 py-4 rounded-2xl text-lg"
              >
                Try Demo
              </Button>
            </div>
          </div>
        </motion.div>

        {/* STATS sidebar */}
        <motion.div {...fadeUp(0.08)} className="lg:col-span-2 xl:col-span-2 rounded-3xl bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/40 p-7 flex flex-col gap-6 shadow-sm min-h-[340px] justify-between">
          <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-bold">Why SmartPrep?</p>
          {[
            { icon: Clock, label: '4 hrs saved/week', color: 'text-emerald-600' },
            { icon: DollarSign, label: '$32 avg savings', color: 'text-amber-600' },
            { icon: Leaf, label: '10+ diet types', color: 'text-teal-600' },
            { icon: Zap, label: 'AI-generated in 30s', color: 'text-rose-500' },
          ].map(({ icon: Icon, label, color }, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* FEATURES — 4 small tiles */}
        {FEATURES.map((f, idx) => {
          const Icon = f.icon;
          return (
            <motion.div key={idx} {...fadeUp(0.12 + idx * 0.05)}
              className={`xl:col-span-${idx < 2 ? 2 : 2} rounded-3xl ${f.light} border border-slate-200/40 dark:border-slate-700/30 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{f.description}</p>
            </motion.div>
          );
        })}

        {/* HOW IT WORKS */}
        <motion.div {...fadeUp(0.3)} className="sm:col-span-2 rounded-3xl bg-slate-900 dark:bg-slate-950 p-8 flex flex-col gap-6 shadow-sm">
          <h2 className="text-white font-bold text-xl">How it works</h2>
          {[
            { n: '1', title: 'Tell us about you', desc: 'Goals, diet, allergies, zip code' },
            { n: '2', title: 'Get your plan', desc: 'AI builds 7-day optimized meals' },
            { n: '3', title: 'Shop & save', desc: 'Best local deals, auto-list' },
          ].map(step => (
            <div key={step.n} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                <span className="text-white font-extrabold text-sm">{step.n}</span>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{step.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* QUOTE */}
        <motion.div {...fadeUp(0.32)} className="sm:col-span-2 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/40 dark:border-emerald-800/30 p-8 flex flex-col justify-center">
          <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-3">Today's Motivation</p>
          <blockquote className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug italic">"{quote}"</blockquote>
        </motion.div>

        {/* STORES BANNER */}
        <motion.div {...fadeUp(0.36)} className="sm:col-span-2 lg:col-span-4 xl:col-span-6 rounded-3xl bg-white/50 dark:bg-slate-800/40 backdrop-blur border border-slate-200/40 dark:border-slate-700/30 p-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Weekly deals scanned at →</p>
          <div className="flex flex-wrap gap-5 text-slate-600 dark:text-slate-400 font-semibold text-sm">
            {['Publix', 'Walmart', 'Target', 'Whole Foods', 'Sprouts', 'Winn-Dixie'].map(s => <span key={s}>{s}</span>)}
          </div>
        </motion.div>

      </div>
    </div>
  );
}