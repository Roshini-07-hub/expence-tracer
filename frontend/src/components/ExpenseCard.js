import React, { useState } from 'react';
import './ExpenseCard.css';

const CATEGORY_COLORS = {
  Food: { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
  Transport: { bg: '#dbeafe', text: '#2563eb', border: '#bfdbfe' },
  Shopping: { bg: '#fce7f3', text: '#db2777', border: '#fbcfe8' },
  Healthcare: { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
  Utilities: { bg: '#f3e8ff', text: '#9333ea', border: '#e9d5ff' },
  Entertainment: { bg: '#ffedd5', text: '#ea580c', border: '#fed7aa' },
  Other: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
};

const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Healthcare: '🏥',
  Utilities: '💡',
  Entertainment: '🎬',
  Other: '📦',
};

function ExpenseCard({ expense, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);

  const category = expense.category || 'Other';
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  const icon = CATEGORY_ICONS[category] || '📦';

  const formattedDate = expense.createdAt || expense.created_at
    ? new Date(expense.createdAt || expense.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown date';

  return (
    <div className="expense-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="card-vendor">
          <span
            className="category-badge"
            style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}
          >
            {icon} {category}
          </span>
          <h3 className="vendor-name">{expense.vendor || 'Unknown Vendor'}</h3>
        </div>
        <div className="card-amount">{expense.totalAmount || expense.total_amount || 'N/A'}</div>
      </div>

      {/* Card Meta */}
      <div className="card-meta">
        <span className="meta-item">📅 {expense.date || formattedDate}</span>
        <span className="meta-item">🕐 Added {formattedDate}</span>
      </div>

      {/* Receipt Image Thumbnail */}
      {(expense.imagePath || expense.image_path) && (
        <div className="card-image-wrap">
          <img
            src={`http://localhost:5000${expense.imagePath || expense.image_path}`}
            alt="Receipt"
            className="card-image"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Expandable Raw Text */}
      <div className="card-text-section">
        <button
          className="expand-btn"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? '▲ Hide' : '▼ Show'} extracted text
        </button>
        {expanded && (
          <pre className="raw-text">{expense.rawText || expense.raw_text || 'No text extracted'}</pre>
        )}
      </div>

      {/* Items */}
      {expense.items && expense.items.length > 0 && (
        <div className="card-items">
          <p className="items-label">Items ({expense.items.length})</p>
          <ul className="items-mini-list">
            {expense.items.slice(0, 3).map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
            {expense.items.length > 3 && (
              <li className="more-items">+{expense.items.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Card Footer */}
      <div className="card-footer">
        <span className="card-id">ID: {(expense._id || expense.id)?.slice(0, 8)}...</span>
        <div className="card-actions">
          <button
            className="edit-btn"
            onClick={() => onEdit(expense)}
            aria-label="Edit expense"
          >
            ✏️ Edit
          </button>
          <button
            className="delete-btn"
            onClick={() => onDelete(expense._id || expense.id)}
            aria-label="Delete expense"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExpenseCard;
