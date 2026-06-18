'use client';

import { Activity, Clock, Play, Cpu, Timer, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceMetric {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const performanceData = [
  { time: '12:00', processedCards: 245, processingTime: 1.2 },
  { time: '12:15', processedCards: 312, processingTime: 1.5 },
  { time: '12:30', processedCards: 289, processingTime: 1.3 },
  { time: '12:45', processedCards: 356, processingTime: 1.4 },
  { time: '13:00', processedCards: 298, processingTime: 1.2 },
  { time: '13:15', processedCards: 342, processingTime: 1.6 },
  { time: '13:30', processedCards: 378, processingTime: 1.3 },
];

export default function EnginePerformance() {
  const metrics: PerformanceMetric[] = [
    {
      label: 'Engine Status',
      value: 'Running',
      icon: <Activity size={22} />,
    },
    {
      label: 'Last Execution Timestamp',
      value: '2024-06-18 13:45:32',
      icon: <Clock size={22} />,
    },
    {
      label: 'Next Scheduled Run',
      value: '2024-06-18 14:00:00',
      icon: <Play size={22} />,
    },
    {
      label: 'Cards Processed per Run',
      value: '2,847',
      icon: <Layers size={22} />,
    },
    {
      label: 'Average Processing Time',
      value: '1.38 sec/card',
      icon: <Timer size={22} />,
    },
    {
      label: 'Parallel Threads',
      value: '8 threads',
      icon: <Cpu size={22} />,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Migration Service Engine Performance</h2>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="kpi-card">
            {metric.icon && <div className="kpi-card-icon">{metric.icon}</div>}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                {metric.label === 'Engine Status' && (
                  <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse" />
                )}
              </div>
              <p className="text-2xl font-bold text-primary">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Performance Metrics Timeline</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Line
                type="monotone"
                dataKey="processedCards"
                stroke="var(--chart-1)"
                strokeWidth={2}
                name="Cards Processed"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="processingTime"
                stroke="var(--chart-2)"
                strokeWidth={2}
                name="Processing Time (sec)"
                dot={false}
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dashboard-card p-6">
          <p className="text-sm text-muted-foreground font-medium mb-3">Monitoring Period</p>
          <p className="text-2xl font-bold text-foreground mb-4">Today (Last 24 hours)</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Start: 2024-06-18 00:00:00</p>
            <p>End: 2024-06-18 23:59:59</p>
          </div>
        </div>

        <div className="dashboard-card p-6">
          <p className="text-sm text-muted-foreground font-medium mb-3">System Status</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CPU Usage</span>
              <div className="w-24 bg-muted rounded-full h-2">
                <div className="bg-chart-1 h-2 rounded-full w-1/2"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Memory Usage</span>
              <div className="w-24 bg-muted rounded-full h-2">
                <div className="bg-chart-1 h-2 rounded-full w-2/3"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Queue Depth</span>
              <div className="w-24 bg-muted rounded-full h-2">
                <div className="bg-chart-2 h-2 rounded-full w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
