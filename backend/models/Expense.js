const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  categoryId: {
    type: String,
    required: [true, 'Category is required']
  },
  paidTo: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  supportingDocument: {
    filename: { type: String, default: '' },
    originalName: { type: String, default: '' },
    mimetype: { type: String, default: '' },
    size: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
