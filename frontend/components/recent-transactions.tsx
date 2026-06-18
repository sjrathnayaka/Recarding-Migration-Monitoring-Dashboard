'use client';

import { ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';

export default function RecentTransactions() {
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = [
    {
      id: 1,
      description: 'Apple Store Purchase',
      category: 'Shopping',
      amount: '-$89.99',
      type: 'debit',
      date: 'Today',
      status: 'Completed',
    },
    {
      id: 2,
      description: 'Salary Deposit',
      category: 'Income',
      amount: '+$4,500.00',
      type: 'credit',
      date: 'Yesterday',
      status: 'Completed',
    },
    {
      id: 3,
      description: 'Netflix Subscription',
      category: 'Entertainment',
      amount: '-$15.99',
      type: 'debit',
      date: 'Jun 15, 2024',
      status: 'Completed',
    },
    {
      id: 4,
      description: 'Amazon Purchase',
      category: 'Shopping',
      amount: '-$245.50',
      type: 'debit',
      date: 'Jun 14, 2024',
      status: 'Completed',
    },
    {
      id: 5,
      description: 'Restaurant - The Olive',
      category: 'Food & Dining',
      amount: '-$67.45',
      type: 'debit',
      date: 'Jun 13, 2024',
      status: 'Completed',
    },
    {
      id: 6,
      description: 'Transfer to Savings',
      category: 'Transfer',
      amount: '-$1,000.00',
      type: 'transfer',
      date: 'Jun 12, 2024',
      status: 'Completed',
    },
  ];

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Recent Transactions</h2>
        <button className="text-primary hover:text-accent font-semibold text-sm flex items-center gap-1">
          View All
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">Description</th>
                <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">Category</th>
                <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">Date</th>
                <th className="text-right px-6 py-4 font-semibold text-foreground text-sm">Amount</th>
                <th className="text-center px-6 py-4 font-semibold text-foreground text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">{transaction.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{transaction.date}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-bold text-sm ${
                        transaction.type === 'credit'
                          ? 'text-green-600 dark:text-green-400'
                          : transaction.type === 'transfer'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-foreground'
                      }`}
                    >
                      {transaction.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing 1-6 of 48 transactions</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm">
            Previous
          </button>
          <button className="px-3 py-1 rounded-lg border border-border bg-primary text-primary-foreground text-sm">
            1
          </button>
          <button className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm">
            2
          </button>
          <button className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
