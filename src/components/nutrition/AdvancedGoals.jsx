import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Target, Edit2, Check, X, Plus, Trash2,
  Heart, Dumbbell, Zap, Bone, Brain, Shield, Apple
} from "lucide-react";
import { toast } from "sonner";

const healthObjectives = [
  { id: 'muscle_gain', label: 'Muscle Gain', icon: Dumbbell, color: 'purple' },
  { id: 'weight_loss', label: 'Weight Loss', icon: Target, color: 'rose' },
  { id: 'heart_health', label: 'Heart Health', icon: Heart, color: 'red' },
  { id: 'energy_boost', label: 'Energy Boost', icon: Zap, color: 'amber' },
  { id: 'bone_health', label: 'Bone Health', icon: Bone, color: 'slate' },
  { id: 'immune_support', label: 'Immune Support', icon: Shield, color: 'emerald' },
  { id: 'digestive_health', label: 'Digestive Health', icon: Apple, color: 'green' },
  { id: 'cognitive_function', label: 'Cognitive Function', icon: Brain, color: 'indigo' },
];

const micronutrientDefaults = {
  fiber: 30,
  sugar: 50,
  sodium: 2300,
  cholesterol: 300,
  vitamin_a: 900,
  vitamin_c: 90,
  vitamin_d: 20,
  calcium: 1000,
  iron: 18,
  potassium: 3400,
};

export default function AdvancedGoals({ profile }) {
  const queryClient = useQueryClient();
  const [editingMicros, setEditingMicros] = useState(false);
  const [microGoals, setMicroGoals] = useState(profile?.micronutrient_goals || {});
  const [objectives, setObjectives] = useState(
    Array.isArray(profile?.health_objectives) ? profile.health_objectives : []
  );
  const [showObjectiveForm, setShowObjectiveForm] = useState(false);
  const [newObjective, setNewObjective] = useState({
    objective: '',
    priority: 'medium',
    target_date: '',
    custom_notes: ''
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      toast.success('Goals updated successfully');
      setEditingMicros(false);
      setShowObjectiveForm(false);
    },
  });

  const saveMicroGoals = () => {
    updateMutation.mutate({ micronutrient_goals: microGoals });
  };

  const addObjective = () => {
    if (!newObjective.objective) {
      toast.error('Please select a health objective');
      return;
    }
    const currentObjectives = Array.isArray(objectives) ? objectives : [];
    const updated = [...currentObjectives, newObjective];
    setObjectives(updated);
    updateMutation.mutate({ health_objectives: updated });
    setNewObjective({ objective: '', priority: 'medium', target_date: '', custom_notes: '' });
  };

  const removeObjective = (index) => {
    const currentObjectives = Array.isArray(objectives) ? objectives : [];
    const updated = currentObjectives.filter((_, i) => i !== index);
    setObjectives(updated);
    updateMutation.mutate({ health_objectives: updated });
  };

  return (
    <div className="space-y-6">
      {/* Micronutrient Goals */}
      <Card className="bg-white/80 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Custom Micronutrient Goals
            </CardTitle>
            {!editingMicros ? (
              <Button size="sm" variant="outline" onClick={() => setEditingMicros(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingMicros(false)}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={saveMicroGoals} className="bg-emerald-600">
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(micronutrientDefaults).map(([key, defaultValue]) => (
              <div key={key} className="space-y-2">
                <Label className="capitalize text-sm font-medium">
                  {key.replace('_', ' ')}
                </Label>
                {editingMicros ? (
                  <Input
                    type="number"
                    value={microGoals[key] || defaultValue}
                    onChange={(e) => setMicroGoals({ ...microGoals, [key]: Number(e.target.value) })}
                    placeholder={defaultValue}
                  />
                ) : (
                  <div className="px-3 py-2 bg-slate-50 rounded-lg text-slate-700 font-medium">
                    {microGoals[key] || defaultValue} {key.includes('vitamin') || key === 'vitamin_d' ? 'mcg' : key.includes('cholesterol') || key.includes('sodium') || key === 'calcium' || key === 'iron' || key === 'potassium' ? 'mg' : 'g'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Objectives */}
      <Card className="bg-white/80 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              Health Objectives
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowObjectiveForm(!showObjectiveForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Objective
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Objective Form */}
          {showObjectiveForm && (
            <div className="p-4 bg-slate-50 rounded-lg space-y-3 border border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {healthObjectives.map((obj) => {
                  const Icon = obj.icon;
                  return (
                    <button
                      key={obj.id}
                      onClick={() => setNewObjective({ ...newObjective, objective: obj.id })}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium flex flex-col items-center gap-2 ${
                        newObjective.objective === obj.id
                          ? `border-${obj.color}-500 bg-${obj.color}-50 text-${obj.color}-700`
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {obj.label}
                    </button>
                  );
                })}
              </div>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Priority</Label>
                  <select
                    value={newObjective.priority}
                    onChange={(e) => setNewObjective({ ...newObjective, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Target Date</Label>
                  <Input
                    type="date"
                    value={newObjective.target_date}
                    onChange={(e) => setNewObjective({ ...newObjective, target_date: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Notes (optional)</Label>
                <Input
                  placeholder="Any specific targets or notes..."
                  value={newObjective.custom_notes}
                  onChange={(e) => setNewObjective({ ...newObjective, custom_notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setShowObjectiveForm(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={addObjective} className="bg-emerald-600">
                  Add Objective
                </Button>
              </div>
            </div>
          )}

          {/* Current Objectives */}
          <div className="space-y-3">
            {objectives && Array.isArray(objectives) && objectives.length > 0 ? (
              objectives.map((obj, idx) => {
                const objData = healthObjectives.find(o => o.id === obj.objective);
                if (!objData) return null;
                const Icon = objData.icon;
                
                return (
                  <div key={idx} className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${objData.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${objData.color}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{objData.label}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Badge variant="outline" className={`border-${objData.color}-200 text-${objData.color}-700`}>
                            {obj.priority} priority
                          </Badge>
                          {obj.target_date && (
                            <span>Target: {new Date(obj.target_date).toLocaleDateString()}</span>
                          )}
                        </div>
                        {obj.custom_notes && (
                          <p className="text-xs text-slate-600 mt-1">{obj.custom_notes}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeObjective(idx)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-slate-500 py-8">
                No health objectives set. Add one to get personalized nutrition recommendations.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}