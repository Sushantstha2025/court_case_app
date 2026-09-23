import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Calendar, Download, FileText, Paperclip, User } from 'lucide-react';
import { mockCategories } from '../data/mockData';
import { api } from '../services/api';
import AddExpenseModal from '../components/AddExpenseModal';

const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchExpense = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setExpense(await api.getExpenseById(id));
    } catch (err) {
      setError(err.message || 'Failed to load expense details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExpense();
  }, [fetchExpense]);

  useEffect(() => {
    if (!expense?.supportingDocument?.originalName) {
      setDocumentUrl('');
      return undefined;
    }

    let currentUrl = '';
    api.getExpenseDocument(expense._id)
      .then((file) => {
        currentUrl = URL.createObjectURL(file);
        setDocumentUrl(currentUrl);
      })
      .catch((err) => setError(err.message || 'Failed to load supporting document'));

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [expense]);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }} className="text-muted">Loading expense details...</div>;
  }

  if (error && !expense) {
    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/expenses')}><ArrowLeft size={16} /> Back to Expenses</button>
        <p style={{ color: 'var(--danger-color)', marginTop: '1rem' }}>{error}</p>
      </div>
    );
  }

  const category = mockCategories.find((item) => item.id === expense.categoryId);
  const document = expense.supportingDocument;
  const isImage = document?.mimetype?.startsWith('image/');
  const isPdf = document?.mimetype === 'application/pdf';

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/expenses')}><ArrowLeft size={16} /> Back to Expenses</button>
        <button className="btn btn-primary" onClick={() => setIsEditModalOpen(true)}>Edit Expense</button>
      </div>

      {error && (
        <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--danger-color)', background: 'var(--danger-bg)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <span className="badge" style={{ backgroundColor: `${category?.color || '#3b82f6'}20`, color: category?.color || '#3b82f6', marginBottom: '0.75rem' }}>
            {category?.name || 'Uncategorized'}
          </span>
          <h1 className="h2" style={{ marginBottom: '0.5rem' }}>{expense.description}</h1>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)' }}>NPR {Number(expense.amount).toLocaleString()}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h2 className="card-title">Expense Information</h2></div>
        <div className="card-body" style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Calendar size={18} className="text-muted" /><div><div className="text-muted text-small">Date</div><div>{new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><User size={18} className="text-muted" /><div><div className="text-muted text-small">Paid To</div><div>{expense.paidTo || 'Not specified'}</div></div></div>
          <div><div className="text-muted text-small" style={{ marginBottom: '0.3rem' }}>Notes</div><div>{expense.notes || 'No additional notes provided.'}</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="card-title">Supporting Document</h2></div>
        <div className="card-body">
          {!document?.originalName ? (
            <div className="text-muted">No supporting document was attached to this expense.</div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowWrap: 'anywhere' }}><Paperclip size={18} /> {document.originalName}</div>
                {documentUrl && <a href={documentUrl} download={document.originalName} className="btn btn-secondary"><Download size={16} /> Download</a>}
              </div>
              {documentUrl && isImage && <img src={documentUrl} alt={document.originalName} style={{ width: '100%', maxHeight: '600px', objectFit: 'contain', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />}
              {documentUrl && isPdf && <iframe title={document.originalName} src={documentUrl} style={{ width: '100%', height: '620px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />}
              {documentUrl && !isImage && !isPdf && <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={18} /> Preview is unavailable for this file type. Download it to view.</div>}
            </>
          )}
        </div>
      </div>

      <AddExpenseModal
        isOpen={isEditModalOpen}
        expenseToEdit={expense}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchExpense}
      />
    </div>
  );
};

export default ExpenseDetails;
