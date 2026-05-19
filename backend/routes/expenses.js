const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const upload = require('../middleware/upload');
const { extractExpenseFromImage } = require('../services/ocrService');
const {
  saveExpense,
  getAllExpenses,
  getExpenseById,
  deleteExpense,
  updateExpense,
  getExpenseSummary,
} = require('../services/expenseService');

/**
 * POST /api/expenses/upload
 * Upload an image, run OCR, and save the expense
 */
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  const imagePath = req.file.path;
  const imageName = req.file.filename;

  try {
    // Run OCR via Gemini Vision
    const ocrResult = await extractExpenseFromImage(imagePath);

    // Save to database
    const expense = await saveExpense({
      imageName,
      imagePath: `/uploads/${imageName}`,
      rawText: ocrResult.rawText,
      vendor: ocrResult.vendor,
      date: ocrResult.date,
      totalAmount: ocrResult.totalAmount,
      category: ocrResult.category,
      items: ocrResult.items,
    });

    res.status(201).json({
      success: true,
      message: 'Expense processed and saved successfully',
      expense,
      ocrResult,
    });
  } catch (error) {
    console.error('Upload route error:', error);

    // Clean up uploaded file on error
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process image',
    });
  }
});

/**
 * GET /api/expenses
 * Get all expenses
 */
router.get('/', async (req, res) => {
  try {
    const expenses = await getAllExpenses();
    res.json({ success: true, expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve expenses' });
  }
});

/**
 * GET /api/expenses/summary
 * Get expense summary by category
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = await getExpenseSummary();
    res.json({ success: true, summary });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve summary' });
  }
});

/**
 * GET /api/expenses/:id
 * Get a single expense by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const expense = await getExpenseById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve expense' });
  }
});

/**
 * PUT /api/expenses/:id
 * Update an expense by ID
 */
router.put('/:id', async (req, res) => {
  try {
    const expense = await getExpenseById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const { vendor, date, totalAmount, category, items, rawText } = req.body;
    const updated = await updateExpense(req.params.id, {
      vendor,
      date,
      totalAmount,
      category,
      items,
      rawText,
    });

    res.json({ success: true, message: 'Expense updated successfully', expense: updated });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to update expense' });
  }
});

/**
 * DELETE /api/expenses/:id
 * Delete an expense by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const expense = await getExpenseById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Delete image file from disk
    const fullImagePath = path.join(__dirname, '..', expense.imagePath);
    if (fs.existsSync(fullImagePath)) {
      fs.unlinkSync(fullImagePath);
    }

    const result = await deleteExpense(req.params.id);
    res.json({ success: true, message: 'Expense deleted successfully', result });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete expense' });
  }
});

module.exports = router;
