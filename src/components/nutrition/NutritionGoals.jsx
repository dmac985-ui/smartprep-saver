import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function NutritionGoals({ profile }) {
  const [isEditing, setIsEditing] = useState(false);
  
  React.useEffect(() => {
    if (profile) {
      setGoals({
        daily_calories: profile?.daily_calories || 0,
        protein_goal: profile?.protein_goal || 0,
        carbs_goal: profile?.carbs_goal || 0,
        fats_goal: profile?.fats_goal || 0,
      });
    }
  }, [profile]);

  const [goals, setGoals] = useState({
    daily_calories: profile?.daily_calories || 0,
    protein_goal: profile?.protein_goal || 0,
    carbs_goal: profile?.carbs_goal || 0,
    fats_goal: profile?.fats_goal || 0,
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setIsEditing(false);
      toast.success('Goals updated successfully');
    },
  });

  const handleSave = () => {
    updateMutation.mutate(goals);
  };

  const handleCancel = () => {
    setGoals({
      daily_calories: profile?.daily_calories || 0,
      protein_goal: profile?.protein_goal || 0,
      carbs_goal: profile?.carbs_goal || 0,
      fats_goal: profile?.fats_goal || 0,
    });
    setIsEditing(false);
  };

  return (
    <Card className="bg-white/80 border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Daily Nutritional Goals
          </CardTitle>
          {!isEditing ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-emerald-600 border-emerald-200"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Goals
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calories">Daily Calories</Label>
            {isEditing ? (
              <Input
                id="calories"
                type="number"
                value={goals.daily_calories}
                onChange={(e) => setGoals({...goals, daily_calories: Number(e.target.value)})}
                className="mt-1"
              />
            ) : (
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {goals.daily_calories ? `${goals.daily_calories} cal` : 'Not set'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="protein">Protein Goal (g)</Label>
            {isEditing ? (
              <Input
                id="protein"
                type="number"
                value={goals.protein_goal}
                onChange={(e) => setGoals({...goals, protein_goal: Number(e.target.value)})}
                className="mt-1"
              />
            ) : (
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {goals.protein_goal ? `${goals.protein_goal} g` : 'Not set'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="carbs">Carbs Goal (g)</Label>
            {isEditing ? (
              <Input
                id="carbs"
                type="number"
                value={goals.carbs_goal}
                onChange={(e) => setGoals({...goals, carbs_goal: Number(e.target.value)})}
                className="mt-1"
              />
            ) : (
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {goals.carbs_goal ? `${goals.carbs_goal} g` : 'Not set'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="fats">Fats Goal (g)</Label>
            {isEditing ? (
              <Input
                id="fats"
                type="number"
                value={goals.fats_goal}
                onChange={(e) => setGoals({...goals, fats_goal: Number(e.target.value)})}
                className="mt-1"
              />
            ) : (
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {goals.fats_goal ? `${goals.fats_goal} g` : 'Not set'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}