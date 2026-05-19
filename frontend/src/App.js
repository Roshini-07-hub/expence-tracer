import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import ExpenseList from './components/ExpenseList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseSaved = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('history');
  };

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        {/* Tab Navigation */}
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <span className="tab-icon">📷</span>
            Upload Receipt
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="tab-icon">📋</span>
            Expense History
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'upload' && (
            <UploadSection onExpenseSaved={handleExpenseSaved} />
          )}
          {activeTab === 'history' && (
            <ExpenseList refreshTrigger={refreshTrigger} />
          )}
        </div>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
