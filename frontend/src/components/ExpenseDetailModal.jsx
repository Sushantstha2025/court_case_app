import React from 'react';
import { X, Calendar, User, AlignLeft, Edit2, Trash2, Paperclip, ExternalLink } from 'lucide-react';
import { mockCategories } from '../data/mockData';
import { api } from '../services/api';

const ExpenseDetailModal = ({ isOpen, onClose, expense, onEdit, onDelete }) => {
  if (!isOpen || !expense) return null;

  const category = mockCategories.find((c) => c.id === expense.categoryId);

  const openSupportingDocument = async () => {
    try {
      const file = await api.getExpenseDocument(expense._id || expense.id);
      const documentUrl = URL.createObjectURL(file);
      window.open(documentUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(documentUrl), 60_000);
    } catch (error) {
      window.alert(error.message || 'Failed to open supporting document');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Expense Details</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <span
              className="badge"
              style={{
                backgroundColor: `${category?.color || '#3b82f6'}20`,
                color: category?.color || '#3b82f6',
                marginBottom: '0.5rem',
              }}
            >
              {category?.name || 'Uncategorized'}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {expense.description}
            </h3>
          </div>

          <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--border-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="text-muted text-small">Total Amount</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>
              NPR {Number(expense.amount).toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={16} className="text-muted" />
              <span className="text-muted" style={{ width: '80px' }}>Date:</span>
              <span style={{ fontWeight: 500 }}>
                {new Date(expense.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={16} className="text-muted" />
              <span className="text-muted" style={{ width: '80px' }}>Paid To:</span>
              <span style={{ fontWeight: 500 }}>{expense.paidTo || 'Not specified'}</span>
            </div>

            {expense.notes && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <AlignLeft size={16} className="text-muted" style={{ marginTop: '3px' }} />
                <span className="text-muted" style={{ width: '80px' }}>Notes:</span>
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{expense.notes}</span>
              </div>
            )}

            {expense.supportingDocument?.originalName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Paperclip size={16} className="text-muted" />
                <span className="text-muted" style={{ width: '80px' }}>Document:</span>
                <button
                  type="button"
                  onClick={openSupportingDocument}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', minWidth: 0 }}
                  title={`Open ${expense.supportingDocument.originalName}`}
                >
                  <ExternalLink size={14} />
                  {expense.supportingDocument.originalName}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            className="btn btn-secondary"
            style={{ color: 'var(--danger-color)', borderColor: '#fca5a5' }}
            onClick={() => {
              onDelete(expense);
              onClose();
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                onEdit(expense);
                onClose();
              }}
            >
              <Edit2 size={16} />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailModal;
