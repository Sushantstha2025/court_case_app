const mongoose = require('mongoose');

const caseEventSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  relatedExpenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    default: null
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CaseEvent', caseEventSchema);
