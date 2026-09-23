export const mockCategories = [
  { id: '1', name: 'Lawyer Fees', color: '#1e3a8a' }, // Deep Navy
  { id: '2', name: 'Court Fees', color: '#3b82f6' }, // Soft Blue
  { id: '3', name: 'Mudda Darta', color: '#10b981' }, // Emerald
  { id: '4', name: 'Documentation', color: '#f59e0b' }, // Amber
  { id: '5', name: 'Travel', color: '#8b5cf6' }, // Violet
  { id: '6', name: 'Property-related', color: '#ef4444' }, // Red
  { id: '7', name: 'Miscellaneous', color: '#64748b' }, // Slate
];

export const mockExpenses = [
  {
    id: 'e1',
    date: '2023-09-10',
    description: 'Paid advocate for initial hearing preparation and consultation.',
    amount: 5000,
    categoryId: '1',
    paidTo: 'Advocate Sharma',
    notes: 'Initial fee only. Additional fees expected for final argument.',
  },
  {
    id: 'e2',
    date: '2023-09-15',
    description: 'Case file submission and court registry fees.',
    amount: 2500,
    categoryId: '2',
    paidTo: 'District Court Registry',
    notes: 'Receipt attached in physical file folder.',
  },
  {
    id: 'e3',
    date: '2023-09-22',
    description: 'Travel to court for the first hearing.',
    amount: 1000,
    categoryId: '5',
    paidTo: 'Taxi / Local Transport',
    notes: 'Round trip from home.',
  },
  {
    id: 'e4',
    date: '2023-10-05',
    description: 'Photocopying of property deeds and old tax receipts.',
    amount: 450,
    categoryId: '4',
    paidTo: 'Local Print Shop',
    notes: '5 sets of 30 pages each.',
  },
  {
    id: 'e5',
    date: '2023-10-20',
    description: 'Payment for Malpot (Land Revenue) office verification.',
    amount: 1500,
    categoryId: '6',
    paidTo: 'Malpot Office',
    notes: 'Verified the 1995 registration documents.',
  }
];

export const mockTimelineEvents = [
  {
    id: 't1',
    date: '2023-09-10',
    title: 'Lawyer Consultation',
    description: 'Initial meeting with Advocate Sharma to discuss the property dispute and outline the legal strategy.',
    type: 'meeting',
    relatedExpenseId: 'e1'
  },
  {
    id: 't2',
    date: '2023-09-15',
    title: 'Case Filed',
    description: 'Officially submitted the Mudda Darta at the District Court.',
    type: 'filing',
    relatedExpenseId: 'e2'
  },
  {
    id: 't3',
    date: '2023-09-22',
    title: 'First Court Hearing',
    description: 'Both parties present. The judge requested verified land documents from the Malpot office before the next hearing.',
    type: 'hearing',
    relatedExpenseId: 'e3'
  },
  {
    id: 't4',
    date: '2023-10-20',
    title: 'Document Verification',
    description: 'Obtained official verification of the 1995 ancestral property division from the local Land Revenue Office.',
    type: 'document',
    relatedExpenseId: 'e5'
  }
];

export const dashboardSummary = {
  totalSpent: 10450,
  expenseCount: 5,
  currentMonthSpent: 1950,
  recentExpenses: mockExpenses.slice().reverse().slice(0, 3)
};
