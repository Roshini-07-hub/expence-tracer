import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-logo">💰</span>
          <div>
            <h1 className="header-title">Expense Tracker</h1>
            <p className="header-subtitle">Powered by Google Gemini Vision OCR</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
