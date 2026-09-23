const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/dashboard/summary
// @desc    Get aggregated statistics for dashboard and reports
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. All expenses for user
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

    const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
    const expenseCount = expenses.length;

    // 2. Current month's spending
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const currentMonthExpenses = expenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate >= startOfCurrentMonth && expDate <= endOfCurrentMonth;
    });

    const currentMonthSpent = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);

    // 3. Category breakdown
    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.categoryId] = (categoryTotals[e.categoryId] || 0) + e.amount;
    });

    // 4. Monthly spending trend (Last 6 calendar months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthName = monthStart.toLocaleString('default', { month: 'short' });

      const monthSpent = expenses
        .filter(e => {
          const d = new Date(e.date);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, item) => sum + item.amount, 0);

      monthlyTrend.push({
        month: monthName,
        year: monthStart.getFullYear(),
        spent: monthSpent
      });
    }

    // 5. Recent 5 expenses
    const recentExpenses = expenses.slice(0, 5);

    res.json({
      totalSpent,
      expenseCount,
      currentMonthSpent,
      recentExpenses,
      categoryTotals,
      monthlyTrend
    });
  } catch (error) {
    console.error('Error generating dashboard summary:', error);
    res.status(500).json({ message: 'Error generating summary data' });
  }
});

module.exports = router;
