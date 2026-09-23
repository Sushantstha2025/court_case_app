import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const AddEventModal = ({ isOpen, onClose, onSuccess, eventToEdit = null }) => {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [relatedExpenseId, setRelatedExpenseId] = useState('');
  const [notes, setNotes] = useState('');
  const [availableExpenses, setAvailableExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load user expenses for optional association
      api.getExpenses()
        .then((data) => setAvailableExpenses(data))
        .catch((err) => console.error('Failed to load expenses for event linkage:', err));

      if (eventToEdit) {
        setDate(eventToEdit.date ? new Date(eventToEdit.date).toISOString().split('T')[0] : '');
        setTitle(eventToEdit.title || '');
        setDescription(eventToEdit.description || '');
        setRelatedExpenseId(eventToEdit.relatedExpenseId?._id || eventToEdit.relatedExpenseId || '');
        setNotes(eventToEdit.notes || '');
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setTitle('');
        setDescription('');
        setRelatedExpenseId('');
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, eventToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!date || !title || !description) {
      setError('Please provide Date, Event Title, and Description.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        date,
        title,
        description,
        relatedExpenseId: relatedExpenseId || null,
        notes,
      };

      if (eventToEdit) {
        await api.updateEvent(eventToEdit._id, payload);
      } else {
        await api.createEvent(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{eventToEdit ? 'Edit Case Event' : 'Add Case Event'}</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form id="add-event-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="event-date">Date of Event</label>
              <input
                type="date"
                id="event-date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="event-title">Event Title</label>
              <input
                type="text"
                id="event-title"
                className="form-input"
                placeholder="e.g. Court Hearing / Lawyer Consultation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="event-desc">Description</label>
              <textarea
                id="event-desc"
                className="form-input"
                rows="3"
                placeholder="What occurred during this event?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="event-expense">Linked Expense (Optional)</label>
              <select
                id="event-expense"
                className="form-input"
                value={relatedExpenseId}
                onChange={(e) => setRelatedExpenseId(e.target.value)}
              >
                <option value="">None (No expense associated)</option>
                {availableExpenses.map((exp) => (
                  <option key={exp._id} value={exp._id}>
                    {new Date(exp.date).toLocaleDateString()} — {exp.description} (NPR {exp.amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="event-notes">Additional Notes</label>
              <input
                type="text"
                id="event-notes"
                className="form-input"
                placeholder="Optional comments or next steps..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="add-event-form" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (eventToEdit ? 'Update Event' : 'Save Event')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
