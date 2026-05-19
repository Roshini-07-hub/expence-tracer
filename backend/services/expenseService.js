const Expense = require('../models/Expense');

/**
 * Save a new expense record to MongoDB
 */
async function saveExpense(expenseData) {
  const expense = new Expense({
    imageName:   expenseData.imageName,
    imagePath:   expenseData.imagePath,
    rawText:     expenseData.rawText,
    vendor:      expenseData.vendor,
    date:        expenseData.date,
    totalAmount: expenseData.totalAmount,
    category:    expenseData.category,
    items:       expenseData.items || [],
  });

  const saved = await expense.save();
  return saved.toObject();
}

/**
 * Retrieve all expenses, newest first
 */
async function getAllExpenses() {
  const expenses = await Expense.find().sort({ createdAt: -1 }).lean();
  return expenses;
}

/**
 * Retrieve a single expense by MongoDB _id
 */
async function getExpenseById(id) {
  const expense = await Expense.findById(id).lean();
  return expense || null;
}

/**
 * Update an expense by MongoDB _id
 */
async function updateExpense(id, data) {
  const updated = await Expense.findByIdAndUpdate(
    id,
    {
      vendor:      data.vendor,
      date:        data.date,
      totalAmount: data.totalAmount,
      category:    data.category,
      items:       data.items || [],
      rawText:     data.rawText,
    },
    { new: true, runValidators: true }
  ).lean();
  return updated;
}

/**
 * Delete an expense by MongoDB _id
 */
async function deleteExpense(id) {
  const result = await Expense.findByIdAndDelete(id);
  return { deleted: !!result };
}

/**
 * Get expense count grouped by category
 */
async function getExpenseSummary() {
  const summary = await Expense.aggregate([
    {
      $group: {
        _id: '$category',
        category_count: { $sum: 1 },
      },
    },
    { $sort: { category_count: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id',
        category_count: 1,
      },
    },
  ]);
  return summary;
}

module.exports = {
  saveExpense,
  getAllExpenses,
  getExpenseById,
  deleteExpense,
  updateExpense,
  getExpenseSummary,
};
