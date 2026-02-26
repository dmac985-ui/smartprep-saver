import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Trash2, Edit2, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import SavingsGoalModal from '@/components/SavingsGoalModal';

const CATEGORY_COLORS = {
  Groceries: 'bg-green-100 text-green-700',
  'Meal Prep': 'bg-emerald-100 text-emerald-700',
  'Eating Out': 'bg-orange-100 text-orange-700',
  Supplements: 'bg-blue-100 text-blue-700',
  'Kitchen Equipment': 'bg-purple-100 text-purple-700',
  Other: 'bg-slate-100 text-slate-700',
};

function ProgressRing({ pct }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width="80" height="80" className="rotate-[-90deg]">
      <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-slate-700" />
      <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="text-emerald-500 transition-all duration-700" />
    </svg>
  );
}

export default function Savings() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['savingsGoals'],
    queryFn: () => base44.entities.SavingsGoal.list('-created_date'),
  });

  const totalTarget = goals.reduce((s, g) => s + (g.target_amount || 0), 0);
  const totalCurrent = goals.reduce((s, g) => s + (g.current_amount || 0), 0);
  const overallPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await base44.entities.SavingsGoal.delete(id);
    queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
    toast.success('Goal deleted');
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingGoal(null);
  };

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
    handleModalClose();
  };

  return (
    <div className="min-h-screen py-6 max-w-6xl mx-auto pb-28">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Savings Goals</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your food budget and savings targets</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl px-6">
          <Plus className="w-4 h-4 mr-2" /> New Goal
        </Button>
      </motion.div>

      {/* Overview Banner */}
      {goals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 mb-6 text-white flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-emerald-500/20">
          <div className="relative">
            <ProgressRing pct={overallPct} />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold rotate-90">{overallPct}%</span>
          </div>
          <div className="text-center md:text-left">
            <p className="text-emerald-200 text-sm font-semibold mb-1">Overall Progress</p>
            <p className="text-3xl font-extrabold">${totalCurrent.toFixed(2)} <span className="text-emerald-200 text-lg font-normal">/ ${totalTarget.toFixed(2)}</span></p>
            <p className="text-emerald-200 text-sm mt-1">{goals.filter(g => g.is_completed).length} of {goals.length} goals completed</p>
          </div>
          <div className="ml-auto hidden md:flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">${(totalTarget - totalCurrent).toFixed(2)} remaining</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goals Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : goals.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <Target className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-500 mb-2">No savings goals yet</h3>
          <p className="text-slate-400 mb-6">Set your first food budget or savings target</p>
          <Button onClick={() => setModalOpen(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Create First Goal
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {goals.map((goal) => {
              const pct = goal.target_amount > 0 ? Math.min(Math.round(((goal.current_amount || 0) / goal.target_amount) * 100), 100) : 0;
              const completed = goal.is_completed || pct >= 100;
              return (
                <motion.div key={goal.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white/80 dark:bg-slate-800/70 rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${completed ? 'border-emerald-300 dark:border-emerald-700' : 'border-slate-200/50 dark:border-slate-700/40'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {completed && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{goal.description}</h3>
                      </div>
                      <Badge className={`text-xs ${CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Other}`}>{goal.category || 'Other'}</Badge>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => handleEdit(goal)}>
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>${(goal.current_amount || 0).toFixed(2)} saved</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${completed ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-emerald-400 to-teal-400'}`}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Target: ${goal.target_amount.toFixed(2)}</span>
                      {goal.target_date && <span>By {new Date(goal.target_date).toLocaleDateString()}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-slate-500">
                      {completed ? 'Goal reached! 🎉' : `$${((goal.target_amount || 0) - (goal.current_amount || 0)).toFixed(2)} to go`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <SavingsGoalModal open={modalOpen} onClose={handleModalClose} onSaved={handleSaved} editingGoal={editingGoal} />
    </div>
  );
}