import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { updateExpense } from '../api/expenseApi';
import './EditExpenseModal.css';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Healthcare', 'Utilities', 'Entertainment', 'Other'];

function EditExpenseModal({ expense, onClose, onSaved }) {
  const [form, setForm] = useState({
    vendor: '',
    date: '',
    totalAmount: '',
    category: 'Other',
    rawText: '',
    items: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        vendor:      expense.vendor || '',
        date:        expense.date || '',
        totalAmount: expense.totalAmount || expense.total_amount || '',
        category:    expense.category || 'Other',
        rawText:     expense.rawText || expense.raw_text || '',
        items:       Array.isArray(expense.items) ? expense.items.join('\n') : '',
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateExpense(expense._id || expense.id, {
        vendor:      form.vendor,
        date:        form.date,
        totalAmount: form.totalAmount,
        category:    form.category,
        rawText:     form.rawText,
        items:       form.items.split('\n').map((i) => i.trim()).filter(Boolean),
      });
      toast.success('Expense updated successfully');
      onSaved(updated);
      onClose();
    } catch (err) {
      toast.error('Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit Expense</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Vendor / Store</label>
            <input
              name="vendor"
              value={form.vendor}
              onChange={handleChange}
              placeholder="e.g. Walmart"
              required
            />
          </div>

          <div className="form-row">
            <label>Date</label>
            <input
              name="date"
              value={form.date}
              onChange={handleChange}
              placeholder="e.g. 2024-05-19"
            />
          </div>

          <div className="form-row">
            <label>Total Amount</label>
            <input
              name="totalAmount"
              value={form.totalAmount}
              onChange={handleChange}
              placeholder="e.g. $45.99"
            />
          </div>

          <div className="form-row">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Items <span className="hint">(one per line)</span></label>
            <textarea
              name="items"
              value={form.items}
              onChange={handleChange}
              rows={4}
              placeholder="Coffee: $3.50&#10;Sandwich: $8.00"
            />
          </div>

          <div className="form-row">
            <label>Raw Text</label>
            <textarea
              name="rawText"
              value={form.rawText}
              onChange={handleChange}
              rows={5}
              placeholder="Extracted text from receipt..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditExpenseModal;
