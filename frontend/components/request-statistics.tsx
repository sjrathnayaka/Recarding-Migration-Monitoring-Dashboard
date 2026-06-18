import { Clock, CheckCircle, Zap, XCircle } from 'lucide-react';

interface RequestStat {
  label: string;
  count: number;
  description: string;
  icon: React.ReactNode;
}

export default function RequestStatistics() {
  const stats: RequestStat[] = [
    { label: 'Pending Requests', count: 287, description: 'Awaiting processing', icon: <Clock size={22} /> },
    { label: 'Processed Requests', count: 5342, description: 'In progress or queued', icon: <Zap size={22} /> },
    { label: 'Completed Requests', count: 12856, description: 'Successfully completed', icon: <CheckCircle size={22} /> },
    { label: 'Failed / Rejected Requests', count: 145, description: 'Failed or rejected', icon: <XCircle size={22} /> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Request Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="kpi-card">
            <div className="kpi-card-icon">{stat.icon}</div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-primary mb-1">{stat.count.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
