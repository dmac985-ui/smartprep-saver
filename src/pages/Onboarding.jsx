// --- MASTER ONBOARDING.JSX ---
// FULL DARK THEME + GUEST/ANONYMOUS SUPPORT (no AI blocking for guests)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Sparkles, Loader2, Zap } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

import ProfileStep from '@/components/onboarding/ProfileStep';
import DietaryStep from '@/components/onboarding/DietaryStep';
import GoalsStep from '@/components/onboarding/GoalsStep';
import RestrictionsStep from '@/components/onboarding/RestrictionsStep';
import ReviewStep from '@/components/onboarding/ReviewStep';

const steps = [
  { id: 1, title: 'Profile' },
  { id: 2, title: 'Diet' },
  { id: 3, title: 'Goals' },
  { id: 4, title: 'Restrictions' },
  { id: 5, title: 'Review' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(true); // default to guest until proven otherwise

  const [profileData, setProfileData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    activity_level: '',
    zip_code: '',
    dietary_framework: '',
    daily_calories: '',
    weekly_target: '',
    weekly_budget: '',
    health_goals: [],
    allergies: [],
    dislikes: [],
    onboarding_complete: false,
  });

  // Detect if user is logged in or guest (run once)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          setIsGuest(false);
        }
      } catch {
        setIsGuest(true);
      }
    };
    checkSession();
  }, []);

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));

    // Only try to save diet preference if not guest (non-blocking)
    if (field === 'dietary_framework' && value && !isGuest) {
      base44.auth.updateMe({ diet_preference: value }).catch(() => {});
    }
  };

  const loadDemo = () => {
    setProfileData({
      age: 32,
      gender: 'female',
      weight: 155,
      height: 65,
      activity_level: 'moderately_active',
      zip_code: '33166',
      dietary_framework: 'Mediterranean',
      daily_calories: 1800,
      weekly_target: 'lose_1',
      weekly_budget: 100,
      health_goals: ['weight_loss', 'general_health'],
      allergies: [],
      dislikes: ['liver'],
      onboarding_complete: false,
    });
    setCurrentStep(5);
    toast.success('Demo profile loaded!');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!(profileData.age && profileData.gender && profileData.weight && profileData.height && profileData.activity_level && profileData.zip_code);
      case 2: return !!profileData.dietary_framework;
      default: return true;
    }
  };

  const getValidationMessage = () => {
    if (currentStep === 1 && !canProceed()) return 'Please fill all fields to continue';
    if (currentStep === 2 && !canProceed()) return 'Please select a dietary framework';
    return null;
  };

  const calcTDEE = (p) => {
    const weight_kg = (Number(p.weight) || 150) * 0.453592;
    const height_cm = (Number(p.height) || 65) * 2.54;
    const age = Number(p.age) || 30;
    let bmr = p.gender === 'female' ? 10 * weight_kg + 6.25 * height_cm - 5 * age - 161 : 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
    const multipliers = { sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725, extremely_active: 1.9 };
    return Math.round(bmr * (multipliers[p.activity_level] || 1.55));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Guest warning if still in guest mode
      if (isGuest) {
        toast.info("Guest mode: Some AI features limited. Profile saved without full sync.");
      }

      const calculatedTdee = calcTDEE(profileData);

      const finalData = {
        ...profileData,
        age: Number(profileData.age) || null,
        weight: Number(profileData.weight) || null,
        height: Number(profileData.height) || null,
        daily_calories: Number(profileData.daily_calories) || calculatedTdee,
        weekly_budget: Number(profileData.weekly_budget) || null,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
        created_by: isGuest ? 'guest_' + Date.now().toString(36) : (await base44.auth.me())?.email,
      };

      // Save profile (works for guests if public write enabled)
      const existing = await base44.entities.UserProfile.list(); // broad query for simplicity

      if (existing.length > 0) {
        await base44.entities.UserProfile.update(existing[0].id, finalData);
      } else {
        await base44.entities.UserProfile.create(finalData);
      }

      // Skip auth.updateMe for guests (non-blocking)
      if (profileData.dietary_framework && !isGuest) {
        base44.auth.updateMe({ diet_preference: profileData.dietary_framework }).catch(() => {});
      }

      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });

      toast.success('Profile complete! Generating your plan...');
      setTimeout(() => navigate(createPageUrl('MealPlan')), 800);
      
    } catch (error) {
      console.error('COMPLETE ERROR:', error);
      toast.error('Unable to save profile. Try again or sign in for full features.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <ProfileStep data={profileData} onChange={handleChange} />;
      case 2: return <DietaryStep data={profileData} onChange={handleChange} />;
      case 3: return <GoalsStep data={profileData} onChange={handleChange} />;
      case 4: return <RestrictionsStep data={profileData} onChange={handleChange} />;
      case 5: return <ReviewStep data={profileData} onGoToStep={setCurrentStep} />;
      default: return null;
    }
  };

  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">SmartPrep Saver</h1>
          <p className="text-slate-400 text-sm mt-1">Setting up your nutrition framework</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-black text-slate-400 mb-2">
            <span>STEP {currentStep}</span>
            <span>{steps[currentStep-1].title}</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl">
          {renderStep()}
        </div>

        {getValidationMessage() && (
          <div className="mt-4 text-center text-amber-400 text-sm font-medium">
            {getValidationMessage()}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={() => setCurrentStep(s => Math.max(1, s-1))} disabled={currentStep === 1}>
            ← Back
          </Button>

          {currentStep < 5 ? (
            <Button onClick={() => setCurrentStep(s => s+1)} disabled={!canProceed()} className="bg-emerald-600 hover:bg-emerald-700">
              Continue →
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Saving..." : "Generate My Plan"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}