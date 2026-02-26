import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ArrowLeft, User, MapPin, Target, AlertTriangle, 
  ThumbsDown, Save, Loader2, X, Plus, LogOut
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

// Default state for new users to prevent "null" crashes
const defaultProfile = {
  age: 30,
  gender: 'male',
  weight: 160,
  height: 68,
  zip_code: '',
  activity_level: 'moderately_active',
  dietary_framework: 'Mediterranean',
  daily_calories: 2000,
  allergies: [],
  dislikes: [],
  health_goals: []
};

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(null);
  const [newAllergy, setNewAllergy] = useState('');
  const [newDislike, setNewDislike] = useState('');

  const { data: profiles, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
  });

  const profile = profiles?.[0];

  // Initialize form: if profile exists use it, otherwise use defaults
  useEffect(() => {
    if (!profileLoading) {
      if (profile) {
        setFormData({ 
          ...profile,
          allergies: Array.isArray(profile.allergies) ? profile.allergies : [],
          dislikes: Array.isArray(profile.dislikes) ? profile.dislikes : [],
          health_goals: Array.isArray(profile.health_goals) ? profile.health_goals : []
        });
      } else {
        setFormData(defaultProfile);
      }
    }
  }, [profile, profileLoading]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        return base44.entities.UserProfile.update(profile.id, data);
      } else {
        return base44.entities.UserProfile.create(data);
      }
    },
    onSuccess: () => {
      // CRITICAL: Invalidate cache so the rest of the app knows the profile exists
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile saved!');
      // Give the DB a millisecond to breathe before navigating
      setTimeout(() => navigate(createPageUrl('MealPlan')), 500);
    },
    onError: (error) => toast.error('Error saving: ' + error.message),
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (field, value, setter) => {
    if (!value.trim()) return;
    const list = Array.isArray(formData[field]) ? formData[field] : [];
    if (!list.includes(value.trim())) {
      handleChange(field, [...list, value.trim()]);
      setter('');
    }
  };

  const removeItem = (field, item) => {
    const list = Array.isArray(formData[field]) ? formData[field] : [];
    handleChange(field, list.filter(i => i !== item));
  };

  if (profileLoading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-8 px-4 max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 mr-2" /> Back</Button>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>
        <Button 
          onClick={() => saveMutation.mutate(formData)} 
          disabled={saveMutation.isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
          Save Profile
        </Button>
      </div>

      <div className="grid gap-6">
        {/* PHYSICAL INFO */}
        <Card className="card-glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-emerald-500" /> Physical Profile</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" value={formData.age} onChange={e => handleChange('age', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={v => handleChange('gender', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Weight (lbs)</Label>
              <Input type="number" value={formData.weight} onChange={e => handleChange('weight', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Height (in)</Label>
              <Input type="number" value={formData.height} onChange={e => handleChange('height', parseInt(e.target.value))} />
            </div>
          </CardContent>
        </Card>

        {/* PREFERENCES */}
        <Card className="card-glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-emerald-500" /> Nutrition Goals</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Dietary Framework</Label>
              <Select value={formData.dietary_framework} onValueChange={v => handleChange('dietary_framework', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Keto">Keto</SelectItem>
                  <SelectItem value="Vegan">Vegan</SelectItem>
                  <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="Paleo">Paleo</SelectItem>
                  <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="Low Carb">Low Carb</SelectItem>
                  <SelectItem value="High Protein">High Protein</SelectItem>
                  <SelectItem value="Gluten Free">Gluten Free</SelectItem>
                  <SelectItem value="Dairy Free">Dairy Free</SelectItem>
                  <SelectItem value="Pescetarian">Pescetarian</SelectItem>
                  <SelectItem value="Whole30">Whole30</SelectItem>
                  <SelectItem value="Carnivore">Carnivore</SelectItem>
                  <SelectItem value="DASH">DASH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Daily Calories</Label>
              <Input type="number" value={formData.daily_calories} onChange={e => handleChange('daily_calories', parseInt(e.target.value))} />
            </div>
          </CardContent>
        </Card>

        {/* RESTRICTIONS */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Allergies</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input value={newAllergy} onChange={e => setNewAllergy(e.target.value)} placeholder="e.g. Nuts" />
                <Button size="icon" onClick={() => addItem('allergies', newAllergy, setNewAllergy)}><Plus /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map(item => (
                  <Badge key={item} variant="secondary" className="pl-3">
                    {item} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => removeItem('allergies', item)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ThumbsDown className="w-4 h-4 text-slate-500" /> Dislikes</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input value={newDislike} onChange={e => setNewDislike(e.target.value)} placeholder="e.g. Mushrooms" />
                <Button size="icon" onClick={() => addItem('dislikes', newDislike, setNewDislike)}><Plus /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.dislikes.map(item => (
                  <Badge key={item} variant="secondary" className="pl-3">
                    {item} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => removeItem('dislikes', item)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}