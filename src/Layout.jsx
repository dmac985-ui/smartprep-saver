import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Home, Calendar, ShoppingCart, DollarSign, Activity, Settings, Menu, X, LogOut, Sun, Moon, Package, Target } from "lucide-react";
import { createPageUrl } from "@/utils";
import FloatingAIAssistant from '@/components/FloatingAIAssistant';
import AppFooter from '@/components/AppFooter';
import { toast } from "sonner";

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Hide layout (including chatbot) during onboarding
  if (currentPageName === 'Onboarding') {
    return <div className="min-h-screen">{children}</div>;
  }

  const navItems = [
    { name: 'Home', label: 'Home', icon: Home },
    { name: 'MealPlan', label: 'Meal Planner', icon: Calendar },
    { name: 'GroceryList', label: 'Grocery List', icon: ShoppingCart },
    { name: 'SavingsHub', label: 'Savings Hub', icon: DollarSign },
    { name: 'Nutrition', label: 'Nutrition', icon: Activity },
    { name: 'Inventory', label: 'Prep Inventory', icon: Package },
    { name: 'Savings', label: 'Savings Goals', icon: Target },
  ];

  const isActive = (pageName) => currentPageName === pageName;

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;

    try {
      await base44.auth.logout();
      toast.success("Logged out successfully");
      navigate(createPageUrl('Home'));
      setSidebarOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between px-4 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>

        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
          SmartPrep Saver
        </h1>

        <button
          onClick={() => setDarkMode(d => !d)}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50
          shadow-2xl transition-transform duration-500 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            SmartPrep Saver
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            AI Nutrition & Budget Optimizer
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.name);
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={`
                  w-full justify-start h-12 px-5 rounded-xl text-base font-medium transition-all duration-300
                  ${active
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 hover:shadow-sm'
                  }
                  hover:-translate-y-0.5 active:scale-95
                `}
                onClick={() => {
                  navigate(createPageUrl(item.name));
                  setSidebarOpen(false);
                }}
              >
                <Icon className="w-5 h-5 mr-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Bottom: Dark Mode + Settings + Log Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-12 px-5 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-300"
            onClick={() => setDarkMode(d => !d)}
          >
            {darkMode ? <Sun className="w-5 h-5 mr-4" /> : <Moon className="w-5 h-5 mr-4" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-12 px-5 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            onClick={() => {
              navigate(createPageUrl('Settings'));
              setSidebarOpen(false);
            }}
          >
            <Settings className="w-5 h-5 mr-4" />
            Settings
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start h-12 px-5 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-4" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0 pb-16 lg:pb-0">
        <div className="p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Single Global Floating AI Assistant */}
      <FloatingAIAssistant />

      {/* Footer */}
      <div className="lg:ml-72">
        <AppFooter />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}