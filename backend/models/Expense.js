const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    imageName: { type: String },
    imagePath: { type: String },
    rawText:   { type: String },
    vendor:    { type: String, default: 'Unknown' },
    date:      { type: String, default: 'Unknown' },
    totalAmount: { type: String, default: 'Unknown' },
    category:  { type: String, default: 'Other' },
    items:     { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
