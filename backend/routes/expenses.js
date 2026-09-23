const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const Expense = require('../models/Expense');
const CaseEvent = require('../models/CaseEvent');
const { protect } = require('../middleware/auth');

// All expense routes are protected
router.use(protect);

const uploadsDirectory = path.join(__dirname, '..', 'uploads');
const allowedDocumentTypes = new Set([
  'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);
const storage = multer.diskStorage({
  destination: uploadsDirectory,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => allowedDocumentTypes.has(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only PDF, image, Word, and DOCX files are supported'))
});
const removeDocument = (document) => {
  if (document?.filename) fs.unlink(path.join(uploadsDirectory, document.filename), () => {});
};

// @route   GET /api/expenses
// @desc    Get all expenses for logged in user with filtering, search, sorting
router.get('/', async (req, res) => {
  try {
    const { search, category, startDate, endDate, sortBy, sortOrder } = req.query;

    const query = { user: req.user._id };

    // Search filter (description or paidTo)
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { paidTo: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.categoryId = category;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // End of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting
    let sort = { date: -1 }; // Default: newest first
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sort = { [sortBy]: order };
    }

    const expenses = await Expense.find(query).sort(sort);
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

// @route   GET /api/expenses/:id
// @desc    Get single expense by ID
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense' });
  }
});

router.get('/:id/document', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense?.supportingDocument?.filename) return res.status(404).json({ message: 'Supporting document not found' });

    const documentPath = path.join(uploadsDirectory, expense.supportingDocument.filename);
    if (!fs.existsSync(documentPath)) return res.status(404).json({ message: 'Supporting document file is unavailable' });

    res.type(expense.supportingDocument.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(expense.supportingDocument.originalName)}"`);
    res.sendFile(documentPath);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving supporting document' });
  }
});

// @route   POST /api/expenses
// @desc    Create a new expense
router.post('/', upload.single('supportingDocument'), async (req, res) => {
  try {
    const { date, description, amount, categoryId, paidTo, notes } = req.body;

    if (!date || !description || amount === undefined || !categoryId) {
      return res.status(400).json({ message: 'Please provide date, description, amount, and category' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      date,
      description,
      amount: Number(amount),
      categoryId,
      paidTo: paidTo || '',
      notes: notes || '',
      supportingDocument: req.file ? {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : undefined
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Error creating expense' });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update an expense
router.put('/:id', upload.single('supportingDocument'), async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    const { date, description, amount, categoryId, paidTo, notes } = req.body;

    if (date) expense.date = date;
    if (description) expense.description = description;
    if (amount !== undefined) expense.amount = Number(amount);
    if (categoryId) expense.categoryId = categoryId;
    if (paidTo !== undefined) expense.paidTo = paidTo;
    if (notes !== undefined) expense.notes = notes;
    if (req.file) {
      removeDocument(expense.supportingDocument);
      expense.supportingDocument = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Error updating expense' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    // Optional: Also unlink from any related case event
    await CaseEvent.updateMany({ relatedExpenseId: req.params.id }, { relatedExpenseId: null });
    removeDocument(expense.supportingDocument);

    res.json({ message: 'Expense removed successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Error deleting expense' });
  }
});

module.exports = router;
