'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const lineData = [
  { month: 'Jan', spending: 2400, income: 4000 },
  { month: 'Feb', spending: 2210, income: 4200 },
  { month: 'Mar', spending: 2290, income: 4100 },
  { month: 'Apr', spending: 2000, income: 4300 },
  { month: 'May', spending: 2181, income: 4100 },
  { month: 'Jun', spending: 2500, income: 4500 },
];

const pieData = [
  { name: 'Housing', value: 35 },
  { name: 'Food', value: 20 },
  { name: 'Transportation', value: 15 },
  { name: 'Entertainment', value: 15 },
  { name: 'Other', value: 15 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Financial Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Spending Chart */}
        <div className="lg:col-span-2 bg-card rounded-lg p-6 border border-border shadow">
          <h3 className="text-lg font-semibold text-foreground mb-4">Income vs Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.6)" />
              <YAxis stroke="rgba(0,0,0,0.6)" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="spending"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by Category */}
        <div className="bg-card rounded-lg p-6 border border-border shadow">
          <h3 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-card rounded-lg p-6 border border-border shadow">
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="month" stroke="rgba(0,0,0,0.6)" />
            <YAxis stroke="rgba(0,0,0,0.6)" />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="spending" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
