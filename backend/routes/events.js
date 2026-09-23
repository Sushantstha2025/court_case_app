const express = require('express');
const router = express.Router();
const CaseEvent = require('../models/CaseEvent');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/events
// @desc    Get all case events sorted chronologically (ascending or descending)
router.get('/', async (req, res) => {
  try {
    const { order = 'asc' } = req.query;
    const sortOrder = order === 'desc' ? -1 : 1;

    const events = await CaseEvent.find({ user: req.user._id })
      .populate('relatedExpenseId')
      .sort({ date: sortOrder });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// @route   POST /api/events
// @desc    Create a new case event
router.post('/', async (req, res) => {
  try {
    const { date, title, description, relatedExpenseId, notes } = req.body;

    if (!date || !title || !description) {
      return res.status(400).json({ message: 'Please provide date, title, and description' });
    }

    const event = await CaseEvent.create({
      user: req.user._id,
      date,
      title,
      description,
      relatedExpenseId: relatedExpenseId || null,
      notes: notes || ''
    });

    const populatedEvent = await event.populate('relatedExpenseId');
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update a case event
router.put('/:id', async (req, res) => {
  try {
    const event = await CaseEvent.findOne({ _id: req.params.id, user: req.user._id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const { date, title, description, relatedExpenseId, notes } = req.body;

    if (date) event.date = date;
    if (title) event.title = title;
    if (description) event.description = description;
    if (relatedExpenseId !== undefined) event.relatedExpenseId = relatedExpenseId || null;
    if (notes !== undefined) event.notes = notes;

    const updatedEvent = await event.save();
    const populated = await updatedEvent.populate('relatedExpenseId');
    res.json(populated);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete a case event
router.delete('/:id', async (req, res) => {
  try {
    const event = await CaseEvent.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }
    res.json({ message: 'Event removed successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router;
