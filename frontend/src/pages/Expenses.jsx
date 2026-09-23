import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, Search, PlusCircle, FileText, ArrowUpDown, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { mockCategories } from '../data/mockData';
import { api } from '../services/api';
import AddExpenseModal from '../components/AddExpenseModal';

const Expenses = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let startDate = '';
      let endDate = '';
      const now = new Date();

      if (dateFilter === 'this-month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      } else if (dateFilter === 'last-month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
      } else if (dateFilter === 'this-year') {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString();
        endDate = new Date(now.getFullYear(), 11, 31).toISOString();
      }

      const data = await api.getExpenses({
        search: searchTerm,
        category: selectedCategory,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      setExpenses(data);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, dateFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    window.addEventListener('expense-updated', fetchExpenses);
    return () => window.removeEventListener('expense-updated', fetchExpenses);
  }, [fetchExpenses]);

  // Handle open modal from other routes (e.g. Header button)
  useEffect(() => {
    if (location.state?.openModal) {
      setExpenseToEdit(null);
      setIsAddModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleEdit = (expense) => {
    setExpenseToEdit(expense);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (expense) => {
    if (window.confirm(`Are you sure you want to delete this expense: "${expense.description}"?`)) {
      try {
        await api.deleteExpense(expense._id);
        fetchExpenses();
      } catch (err) {
        alert(err.message || 'Failed to delete expense');
      }
    }
  };

  return (
    <div className="page-container" style={{ padding: '0' }}>
      <div style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="h2" style={{ margin: 0 }}>Expenses Ledger</h1>
            <p className="text-muted" style={{ marginTop: '0.25rem' }}>
              Detailed record of all case-related financial transactions.
            </p>
          </div>
          
          <button
            className="btn btn-primary"
            onClick={() => {
              setExpenseToEdit(null);
              setIsAddModalOpen(true);
            }}
          >
            <PlusCircle size={18} />
            Record Expense
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '220px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search expenses by description, paid to, notes..."
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                className="form-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="">All Categories</option>
                {mockCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              
              <select
                className="form-input"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="">All Dates</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-year">This Year</option>
              </select>

              <select
                className="form-input"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  setSortBy(sb);
                  setSortOrder(so);
                }}
                style={{ width: 'auto' }}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="card">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-light)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
              <p className="text-muted text-small">Loading expense records...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="empty-state" style={{ border: 'none' }}>
              <FileText className="empty-icon" />
              <h3 className="empty-title">No expenses found</h3>
              <p className="empty-desc">
                {searchTerm || selectedCategory || dateFilter
                  ? 'No expenses matched your filter criteria. Try adjusting or clearing your search.'
                  : 'Start by recording your first case-related expense.'}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setExpenseToEdit(null);
                  setIsAddModalOpen(true);
                }}
              >
                <PlusCircle size={18} />
                Record First Expense
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Paid To</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => {
                    const category = mockCategories.find((c) => c.id === expense.categoryId);
                    return (
                      <tr key={expense._id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <div
                            style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--primary-color)' }}
                            onClick={() => navigate(`/expenses/${expense._id || expense.id}`)}
                          >
                            {expense.description}
                          </div>
                          {expense.notes && (
                            <div className="text-muted text-small" style={{ marginTop: '0.2rem' }}>
                              {expense.notes}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: `${category?.color || '#3b82f6'}20`,
                              color: category?.color || '#3b82f6',
                            }}
                          >
                            {category?.name || 'General'}
                          </span>
                        </td>
                        <td>{expense.paidTo || '-'}</td>
                        <td style={{ fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          NPR {Number(expense.amount).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem', border: 'none', background: 'transparent' }}
                            title="View Details"
                            onClick={() => navigate(`/expenses/${expense._id || expense.id}`)}
                          >
                            <FileText size={16} className="text-muted" />
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem', border: 'none', background: 'transparent' }}
                            title="Edit"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit2 size={16} style={{ color: 'var(--primary-light)' }} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem', border: 'none', background: 'transparent' }}
                            title="Delete"
                            onClick={() => handleDelete(expense)}
                          >
                            <Trash2 size={16} style={{ color: 'var(--danger-color)' }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        expenseToEdit={expenseToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSuccess={fetchExpenses}
      />

    </div>
  );
};

export default Expenses;
