import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { mockCategories } from '../data/mockData';
import { api } from '../services/api';
import AddExpenseModal from '../components/AddExpenseModal';

const Dashboard = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    window.addEventListener('expense-updated', fetchSummary);
    return () => window.removeEventListener('expense-updated', fetchSummary);
  }, []);

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="h2" style={{ margin: 0 }}>Dashboard</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Financial overview and recent case activity.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
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

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-light)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p className="text-muted text-small">Calculating financials...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card">
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--info-bg)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <div className="text-muted text-small" style={{ fontWeight: 500 }}>Total Spent</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    NPR {(summary?.totalSpent || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={24} />
                </div>
                <div>
                  <div className="text-muted text-small" style={{ fontWeight: 500 }}>Total Records</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {summary?.expenseCount || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="text-muted text-small" style={{ fontWeight: 500 }}>This Month</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    NPR {(summary?.currentMonthSpent || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Spending History (Last 6 Months)</h3>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary?.monthlyTrend || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} tickFormatter={(val) => `NPR ${val}`} />
                      <Tooltip 
                        formatter={(val) => [`NPR ${Number(val).toLocaleString()}`, 'Spent']}
                        cursor={{ fill: 'var(--surface-hover)' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
                      />
                      <Bar dataKey="spent" fill="var(--primary-light)" radius={[4, 4, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Expenses List */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Expenses</h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                onClick={() => navigate('/expenses')}
              >
                View All <ArrowRight size={14} style={{ marginLeft: '4px' }} />
              </button>
            </div>
            <div className="table-container">
              {summary?.recentExpenses?.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  No expenses recorded yet. Click "Record Expense" to get started.
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Paid To</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.recentExpenses?.map((expense) => {
                      const category = mockCategories.find((c) => c.id === expense.categoryId);
                      return (
                        <tr key={expense._id}>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                              <Clock size={14} />
                              {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td style={{ fontWeight: 500 }}>{expense.description}</td>
                          <td>
                            <span 
                              className="badge" 
                              style={{ backgroundColor: `${category?.color || '#3b82f6'}20`, color: category?.color || '#3b82f6' }}
                            >
                              {category?.name || 'General'}
                            </span>
                          </td>
                          <td>{expense.paidTo || '-'}</td>
                          <td style={{ fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>
                            NPR {Number(expense.amount).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSummary}
      />
    </div>
  );
};

export default Dashboard;
