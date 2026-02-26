import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AppFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200/60 bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p className="text-center md:text-left max-w-xl">
            <strong className="text-slate-700">Health Disclaimer:</strong> SmartPrep Saver is for informational purposes only. Not medical or nutritional advice. Consult your doctor before changing your diet.
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <Link to={createPageUrl('Privacy')} className="hover:text-emerald-600 underline underline-offset-2 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-300">|</span>
            <span>© 2026 SmartPrep Saver</span>
          </div>
        </div>
      </div>
    </footer>
  );
}