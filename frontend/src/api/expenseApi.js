import axios from 'axios';

const API_BASE = '/api/expenses';

/**
 * Upload an image and process it with OCR
 * @param {File} imageFile
 * @returns {Object} - { expense, ocrResult }
 */
export async function uploadExpenseImage(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60 second timeout for OCR processing
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Upload failed');
    }

    return {
      expense: response.data.expense,
      ocrResult: response.data.ocrResult,
    };
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

/**
 * Get all expenses
 * @returns {Array} - List of expense objects
 */
export async function getAllExpenses() {
  const response = await axios.get(API_BASE);
  if (!response.data.success) {
    throw new Error('Failed to fetch expenses');
  }
  return response.data.expenses;
}

/**
 * Get a single expense by ID
 * @param {string} id
 * @returns {Object} - Expense object
 */
export async function getExpenseById(id) {
  const response = await axios.get(`${API_BASE}/${id}`);
  if (!response.data.success) {
    throw new Error('Expense not found');
  }
  return response.data.expense;
}

/**
 * Delete an expense by ID
 * @param {string} id
 */
export async function deleteExpense(id) {
  const response = await axios.delete(`${API_BASE}/${id}`);
  if (!response.data.success) {
    throw new Error('Failed to delete expense');
  }
  return response.data;
}

/**
 * Update an expense by ID
 * @param {string} id
 * @param {Object} data - { vendor, date, totalAmount, category, items, rawText }
 */
export async function updateExpense(id, data) {
  const response = await axios.put(`${API_BASE}/${id}`, data);
  if (!response.data.success) {
    throw new Error('Failed to update expense');
  }
  return response.data.expense;
}

/**
 * Get expense summary by category
 * @returns {Array} - Summary data
 */
export async function getExpenseSummary() {
  const response = await axios.get(`${API_BASE}/summary`);
  if (!response.data.success) {
    throw new Error('Failed to fetch summary');
  }
  return response.data.summary;
}
