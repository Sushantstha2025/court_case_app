import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Download, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { mockCategories } from '../data/mockData';
import { api } from '../services/api';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      setError('');
      try {
        const [summaryData, expenseList] = await Promise.all([
          api.getDashboardSummary(),
          api.getExpenses(),
        ]);
        setSummary(summaryData);
        setExpenses(expenseList);
      } catch (err) {
        setError(err.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  // Compute category breakdown from live data
  const categoryData = mockCategories.map((cat) => {
    const total = (summary?.categoryTotals && summary.categoryTotals[cat.id]) || 0;
    return {
      name: cat.name,
      value: total,
      color: cat.color,
    };
  }).filter((d) => d.value > 0);

  // Compute top category
  const topCategory = categoryData.length > 0 
    ? [...categoryData].sort((a, b) => b.value - a.value)[0]
    : null;

  const topCategoryPercentage = summary?.totalSpent && topCategory
    ? Math.round((topCategory.value / summary.totalSpent) * 100)
    : 0;

  const averageExpense = summary?.expenseCount && summary.expenseCount > 0
    ? Math.round(summary.totalSpent / summary.expenseCount)
    : 0;

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert('No expense data available to export.');
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Paid To', 'Amount (NPR)', 'Notes'];
    const rows = expenses.map((e) => {
      const cat = mockCategories.find((c) => c.id === e.categoryId)?.name || 'General';
      const cleanDate = new Date(e.date).toISOString().split('T')[0];
      const desc = `"${(e.description || '').replace(/"/g, '""')}"`;
      const paidTo = `"${(e.paidTo || '').replace(/"/g, '""')}"`;
      const notes = `"${(e.notes || '').replace(/"/g, '""')}"`;
      return [cleanDate, desc, cat, paidTo, e.amount, notes].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Court_Expenses_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--surface-color)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name || payload[0].payload.month}</p>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>NPR {Number(payload[0].value).toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="h2" style={{ margin: 0 }}>Financial Reports</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Visual breakdowns and summaries of case expenses.
          </p>
        </div>
        
        <button className="btn btn-secondary" onClick={handleExportCSV} disabled={expenses.length === 0}>
          <Download size={18} />
          Export CSV Ledger
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
          <p className="text-muted text-small">Analyzing financial reports...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <FileSpreadsheet className="empty-icon" />
          <h3 className="empty-title">Insufficient data for reporting</h3>
          <p className="empty-desc">
            As you log court and legal expenses, category distributions and trend charts will be automatically generated here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {/* Expenses by Category Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Expenses by Category</h3>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Expenses Over Time Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Spending Trend (Last 6 Months)</h3>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary?.monthlyTrend || []} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `NPR ${value}`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-hover)' }} />
                    <Bar dataKey="spent" fill="var(--primary-color)" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <h3 className="card-title">Executive Summary</h3>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--border-radius-md)' }}>
                <div className="text-muted text-small" style={{ marginBottom: '0.25rem' }}>Total Expenditure</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  NPR {(summary?.totalSpent || 0).toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--border-radius-md)' }}>
                <div className="text-muted text-small" style={{ marginBottom: '0.25rem' }}>Highest Expense Category</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  {topCategory ? `${topCategory.name} (${topCategoryPercentage}%)` : 'None'}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--border-radius-md)' }}>
                <div className="text-muted text-small" style={{ marginBottom: '0.25rem' }}>Average Expense Size</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  NPR {averageExpense.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--border-radius-md)' }}>
                <div className="text-muted text-small" style={{ marginBottom: '0.25rem' }}>Total Logged Records</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  {summary?.expenseCount || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
