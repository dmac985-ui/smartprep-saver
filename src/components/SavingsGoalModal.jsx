import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Groceries', 'Meal Prep', 'Eating Out', 'Supplements', 'Kitchen Equipment', 'Other'];
const DEFAULT_FORM = { description: '', target_amount: '', current_amount: '', category: '', target_date: '', is_completed: false };

export default function SavingsGoalModal({ open, onClose, onSaved, editingGoal }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setForm({
        description: editingGoal.description || '',
        target_amount: editingGoal.target_amount ?? '',
        current_amount: editingGoal.current_amount ?? '',
        category: editingGoal.category || '',
        target_date: editingGoal.target_date || '',
        is_completed: editingGoal.is_completed || false,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [editingGoal, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.target_amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    const payload = {
      description: form.description,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
      category: form.category || 'Other',
      target_date: form.target_date || undefined,
      is_completed: form.is_completed,
    };
    if (editingGoal?.id) {
      await base44.entities.SavingsGoal.update(editingGoal.id, payload);
      toast.success('Goal updated');
    } else {
      await base44.entities.SavingsGoal.create(payload);
      toast.success('Goal created');
    }
    setSaving(false);
    onSaved();
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target?.value ?? e }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>{editingGoal ? 'Edit Savings Goal' : 'New Savings Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label>Description *</Label>
            <Input value={form.description} onChange={set('description')} placeholder="e.g. Monthly grocery budget" className="mt-1 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Target ($) *</Label>
              <Input type="number" min="0" step="0.01" value={form.target_amount} onChange={set('target_amount')} placeholder="e.g. 300" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Current ($)</Label>
              <Input type="number" min="0" step="0.01" value={form.current_amount} onChange={set('current_amount')} placeholder="e.g. 120" className="mt-1 rounded-xl" />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={set('category')}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Target Date</Label>
            <Input type="date" value={form.target_date} onChange={set('target_date')} className="mt-1 rounded-xl" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}