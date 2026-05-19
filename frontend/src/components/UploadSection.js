import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { uploadExpenseImage } from '../api/expenseApi';
import OCRResult from './OCRResult';
import './UploadSection.css';

function UploadSection({ onExpenseSaved }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setOcrResult(null);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setOcrResult(null);

    try {
      const result = await uploadExpenseImage(selectedFile);
      setOcrResult(result);
      toast.success('Receipt processed successfully!');
      onExpenseSaved();
    } catch (error) {
      toast.error(error.message || 'Failed to process image. Check your API key.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="upload-section">
      <div className="upload-grid">
        {/* Left: Upload Panel */}
        <div className="upload-panel card">
          <h2 className="panel-title">Upload Receipt</h2>
          <p className="panel-desc">
            Upload a photo of your bill or receipt. Gemini Vision will extract all expense details automatically.
          </p>

          {/* Drop Zone */}
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <div className="preview-container">
                <img src={previewUrl} alt="Receipt preview" className="preview-image" />
                <button className="remove-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div className="drop-placeholder">
                <span className="drop-icon">🖼️</span>
                <p className="drop-text">Drag & drop your receipt here</p>
                <p className="drop-subtext">or click to browse</p>
                <p className="drop-hint">Supports JPEG, PNG, GIF, WEBP · Max 10MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden-input"
            aria-label="Upload receipt image"
          />

          {/* File info */}
          {selectedFile && (
            <div className="file-info">
              <span className="file-icon">📄</span>
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              📁 Browse File
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                '🔍 Extract Text'
              )}
            </button>
          </div>

          {isProcessing && (
            <div className="processing-status">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p>Analyzing receipt with Gemini Vision OCR...</p>
            </div>
          )}
        </div>

        {/* Right: OCR Result */}
        <div className="result-panel">
          {ocrResult ? (
            <OCRResult result={ocrResult} />
          ) : (
            <div className="result-placeholder card">
              <span className="placeholder-icon">📊</span>
              <h3>Extracted Data Appears Here</h3>
              <p>Upload a receipt image and click "Extract Text" to see the results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadSection;
