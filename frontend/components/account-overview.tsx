'use client';

import { ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';

export default function AccountOverview() {
  const accounts = [
    {
      name: 'Checking Account',
      balance: '$12,450.75',
      change: '+2.5%',
      type: 'Primary',
      icon: 'CA',
    },
    {
      name: 'Savings Account',
      balance: '$45,230.00',
      change: '+5.2%',
      type: 'Savings',
      icon: 'SA',
    },
    {
      name: 'Investment Account',
      balance: '$125,680.50',
      change: '+12.8%',
      type: 'Investment',
      icon: 'IA',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-8 text-primary-foreground shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Welcome back, John</h2>
        <p className="opacity-90">Your accounts are secure and up to date</p>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((account, i) => (
          <div key={i} className="bg-card rounded-lg p-6 shadow border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{account.type}</p>
                <h3 className="text-lg font-semibold text-foreground mt-1">{account.name}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-primary" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-foreground">{account.balance}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${parseFloat(account.change) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {account.change}
                </span>
                <span className="text-xs text-muted-foreground">This month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Balance" value="$183,361.25" />
        <StatCard label="Monthly Spending" value="$3,245.80" />
        <StatCard label="Pending Transfers" value="2" />
        <StatCard label="Alerts" value="1 New" />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-foreground mt-2">{value}</p>
    </div>
  );
}
