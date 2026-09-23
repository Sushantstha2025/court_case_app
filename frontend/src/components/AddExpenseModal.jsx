import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Paperclip, Upload } from 'lucide-react';
import { mockCategories } from '../data/mockData';
import { api } from '../services/api';

const AddExpenseModal = ({ isOpen, onClose, onSuccess, expenseToEdit = null }) => {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [notes, setNotes] = useState('');
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      const formattedDate = expenseToEdit.date 
        ? new Date(expenseToEdit.date).toISOString().split('T')[0] 
        : '';
      setDate(formattedDate);
      setDescription(expenseToEdit.description || '');
      setAmount(expenseToEdit.amount || '');
      setCategoryId(expenseToEdit.categoryId || '');
      setPaidTo(expenseToEdit.paidTo || '');
      setNotes(expenseToEdit.notes || '');
      setSupportingDocument(null);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setAmount('');
      setCategoryId('');
      setPaidTo('');
      setNotes('');
      setSupportingDocument(null);
    }
    setError('');
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!date || !description || !amount || !categoryId) {
      setError('Please fill in Date, Description, Amount, and Category.');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('date', date);
      payload.append('description', description);
      payload.append('amount', String(Number(amount)));
      payload.append('categoryId', categoryId);
      payload.append('paidTo', paidTo);
      payload.append('notes', notes);
      if (supportingDocument) payload.append('supportingDocument', supportingDocument);

      if (expenseToEdit) {
        await api.updateExpense(expenseToEdit._id || expenseToEdit.id, payload);
      } else {
        await api.createExpense(payload);
      }

      window.dispatchEvent(new Event('expense-updated'));
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {expenseToEdit ? 'Edit Expense Record' : 'Record Expense'}
          </h2>
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

          <form id="add-expense-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input 
                type="date" 
                id="date" 
                className="form-input" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <input 
                type="text" 
                id="description" 
                className="form-input" 
                placeholder="What happened on that date?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="amount">Amount (NPR)</label>
                <input 
                  type="number" 
                  id="amount" 
                  className="form-input" 
                  placeholder="e.g. 5000" 
                  min="0" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select 
                  id="category" 
                  className="form-input" 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {mockCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="paidTo">Paid To (Recipient)</label>
              <input 
                type="text" 
                id="paidTo" 
                className="form-input" 
                placeholder="Who received the money?" 
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="notes">Notes / Details</label>
              <textarea 
                id="notes" 
                className="form-input" 
                rows="3" 
                placeholder="Additional details or context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <label className="form-label" htmlFor="supportingDocument">Supporting Document / Receipt</label>
              <label
                htmlFor="supportingDocument"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.9rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius-md)', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <Upload size={18} />
                <span>{supportingDocument ? supportingDocument.name : expenseToEdit?.supportingDocument?.originalName ? `Replace ${expenseToEdit.supportingDocument.originalName}` : 'Choose a receipt or supporting document'}</span>
              </label>
              <input
                id="supportingDocument"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                onChange={(e) => setSupportingDocument(e.target.files?.[0] || null)}
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
              />
              <div className="text-muted text-small" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Paperclip size={14} /> PDF, JPG, PNG, WEBP, DOC, or DOCX — up to 10 MB
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="add-expense-form" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (expenseToEdit ? 'Update Expense' : 'Save Expense')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
