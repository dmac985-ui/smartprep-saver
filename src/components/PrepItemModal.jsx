import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Seafood', 'Grains', 'Pantry', 'Frozen', 'Beverages', 'Snacks', 'Other'];

const DEFAULT_FORM = { name: '', quantity: '', unit_price: '', category: '', expiry_date: '', notes: '' };

export default function PrepItemModal({ open, onClose, onSaved, editingItem }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name || '',
        quantity: editingItem.quantity ?? '',
        unit_price: editingItem.unit_price ?? '',
        category: editingItem.category || '',
        expiry_date: editingItem.expiry_date || '',
        notes: editingItem.notes || '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [editingItem, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.unit_price || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      quantity: parseFloat(form.quantity),
      unit_price: parseFloat(form.unit_price),
      category: form.category,
      expiry_date: form.expiry_date || undefined,
      notes: form.notes || undefined,
    };
    if (editingItem?.id) {
      await base44.entities.PrepItem.update(editingItem.id, payload);
      toast.success('Item updated');
    } else {
      await base44.entities.PrepItem.create(payload);
      toast.success('Item added');
    }
    setSaving(false);
    onSaved();
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target?.value ?? e }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Prep Item' : 'Add Prep Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label>Name *</Label>
            <Input value={form.name} onChange={set('name')} placeholder="e.g. Chicken Breast" className="mt-1 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantity *</Label>
              <Input type="number" min="0" step="0.01" value={form.quantity} onChange={set('quantity')} placeholder="e.g. 2" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Unit Price ($) *</Label>
              <Input type="number" min="0" step="0.01" value={form.unit_price} onChange={set('unit_price')} placeholder="e.g. 4.99" className="mt-1 rounded-xl" />
            </div>
          </div>
          <div>
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={set('category')}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Expiry Date</Label>
            <Input type="date" value={form.expiry_date} onChange={set('expiry_date')} className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={form.notes} onChange={set('notes')} placeholder="Optional notes..." className="mt-1 rounded-xl" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}