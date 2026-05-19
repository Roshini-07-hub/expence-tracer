import React, { useState } from 'react';
import './OCRResult.css';

const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Healthcare: '🏥',
  Utilities: '💡',
  Entertainment: '🎬',
  Other: '📦',
};

function OCRResult({ result }) {
  const [activeTab, setActiveTab] = useState('structured');

  if (!result) return null;

  const { expense, ocrResult } = result;
  const categoryIcon = CATEGORY_ICONS[expense?.category] || '📦';

  return (
    <div className="ocr-result card">
      <div className="result-header">
        <h2 className="result-title">
          <span>{categoryIcon}</span> Extracted Expense
        </h2>
        <span className="result-badge">✓ Saved</span>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Vendor</span>
          <span className="summary-value">{expense?.vendor || 'Unknown'}</span>
        </div>
        <div className="summary-card highlight">
          <span className="summary-label">Total Amount</span>
          <span className="summary-value amount">{expense?.total_amount || 'N/A'}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Date</span>
          <span className="summary-value">{expense?.date || 'Unknown'}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Category</span>
          <span className="summary-value">
            {categoryIcon} {expense?.category || 'Other'}
          </span>
        </div>
      </div>

      {/* Items List */}
      {expense?.items && expense.items.length > 0 && (
        <div className="items-section">
          <h3 className="section-label">Items</h3>
          <ul className="items-list">
            {expense.items.map((item, idx) => (
              <li key={idx} className="item-row">
                <span className="item-bullet">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw / Full Text Tabs */}
      <div className="text-tabs">
        <div className="text-tab-nav">
          <button
            className={`text-tab-btn ${activeTab === 'structured' ? 'active' : ''}`}
            onClick={() => setActiveTab('structured')}
          >
            Structured
          </button>
          <button
            className={`text-tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            Raw Text
          </button>
          <button
            className={`text-tab-btn ${activeTab === 'full' ? 'active' : ''}`}
            onClick={() => setActiveTab('full')}
          >
            Full Response
          </button>
        </div>

        <div className="text-content">
          {activeTab === 'structured' && (
            <pre className="text-pre">{formatStructured(expense)}</pre>
          )}
          {activeTab === 'raw' && (
            <pre className="text-pre">{ocrResult?.rawText || expense?.raw_text || 'No raw text available'}</pre>
          )}
          {activeTab === 'full' && (
            <pre className="text-pre">{ocrResult?.fullResponse || 'No full response available'}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

function formatStructured(expense) {
  if (!expense) return '';
  return [
    `Vendor       : ${expense.vendor || 'Unknown'}`,
    `Date         : ${expense.date || 'Unknown'}`,
    `Total Amount : ${expense.total_amount || 'N/A'}`,
    `Category     : ${expense.category || 'Other'}`,
    ``,
    `Items:`,
    ...(expense.items || []).map((item) => `  • ${item}`),
  ].join('\n');
}

export default OCRResult;
