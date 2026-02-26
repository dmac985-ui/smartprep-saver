import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';

const FUN_TIPS = [
  "Freezing leftovers saves money and reduces waste.",
  "Batch cooking cuts prep time by up to 60%.",
  "Smart ingredient swaps can save $20+/week.",
  "Planning ahead reduces food waste by up to 40%.",
];

export default function MealPlanGeneratingOverlay({ visible, diet }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!visible) { setElapsed(0); setTipIndex(0); return; }
    const timer = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % FUN_TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [visible]);

  const isLong = elapsed > 45;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg w-full mx-6 bg-slate-900 border border-slate-800 rounded-[3rem] p-12 text-center shadow-2xl"
          >
            <div className="relative mx-auto w-20 h-20 mb-8">
              <Loader2 className="w-20 h-20 text-emerald-500 animate-spin" />
              <Sparkles className="w-6 h-6 text-amber-400 absolute top-0 right-0 animate-pulse" />
            </div>

            <AnimatePresence mode="wait">
              <motion.h2
                key={isLong ? 'long' : 'normal'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3"
              >
                {isLong ? 'Almost there… optimizing your final meals' : `Crafting your ${diet} plan…`}
              </motion.h2>
            </AnimatePresence>

            <p className="text-slate-400 font-medium mb-2">
              {isLong ? 'Finishing up — just a few more seconds' : 'Usually 20–30 seconds'}
            </p>
            <p className="text-emerald-400 text-xs font-bold tabular-nums mb-6">
              {elapsed}s elapsed
            </p>

            {/* Indeterminate progress bar */}
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden mb-8">
              <motion.div
                className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <div className="bg-slate-800/60 rounded-2xl px-6 py-4 flex items-start gap-3 text-left min-h-[72px]">
              <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-slate-300 font-medium leading-relaxed"
                >
                  {FUN_TIPS[tipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}