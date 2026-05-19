import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllExpenses, deleteExpense } from '../api/expenseApi';
import ExpenseCard from './ExpenseCard';
import EditExpenseModal from './EditExpenseModal';
import './ExpenseList.css';

const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Healthcare: '🏥',
  Utilities: '💡',
  Entertainment: '🎬',
  Other: '📦',
};

function ExpenseList({ refreshTrigger }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllExpenses();
      setExpenses(data);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => (e._id || e.id) !== id));
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleEditSaved = (updated) => {
    setExpenses((prev) =>
      prev.map((e) => (e._id || e.id) === (updated._id || updated.id) ? updated : e)
    );
  };

  // Filter and search
  const filtered = expenses.filter((exp) => {
    const matchesSearch =
      !searchTerm ||
      (exp.vendor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.raw_text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Unique categories from data
  const categories = ['All', ...new Set(expenses.map((e) => e.category).filter(Boolean))];

  // Stats
  const totalCount = expenses.length;

  return (
    <div className="expense-list-section">
      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{totalCount}</span>
          <span className="stat-label">Total Receipts</span>
        </div>
        {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => {
          const count = expenses.filter((e) => e.category === cat).length;
          if (count === 0) return null;
          return (
            <div key={cat} className="stat-item">
              <span className="stat-number">{icon} {count}</span>
              <span className="stat-label">{cat}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="🔍 Search by vendor, category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          aria-label="Search expenses"
        />
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat !== 'All' && CATEGORY_ICONS[cat] ? `${CATEGORY_ICONS[cat]} ` : ''}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading expenses...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">{expenses.length === 0 ? '🧾' : '🔍'}</span>
          <h3>{expenses.length === 0 ? 'No expenses yet' : 'No results found'}</h3>
          <p>
            {expenses.length === 0
              ? 'Upload your first receipt to get started.'
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="expense-grid">
          {filtered.map((expense) => (
            <ExpenseCard
              key={expense._id || expense.id}
              expense={expense}
              onDelete={handleDelete}
              onEdit={setEditingExpense}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}

export default ExpenseList;
