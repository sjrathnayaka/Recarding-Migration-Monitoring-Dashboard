import { Clock, CheckCircle, Zap, XCircle } from 'lucide-react';

interface RequestStat {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

export default function RequestStatistics() {
  const stats: RequestStat[] = [
    {
      label: 'Pending Requests',
      count: 287,
      icon: <Clock size={24} />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Awaiting processing',
    },
    {
      label: 'Processed Requests',
      count: 5342,
      icon: <Zap size={24} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'In progress or queued',
    },
    {
      label: 'Completed Requests',
      count: 12856,
      icon: <CheckCircle size={24} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Successfully completed',
    },
    {
      label: 'Failed / Rejected Requests',
      count: 145,
      icon: <XCircle size={24} />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Failed or rejected',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Request Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className={`${stat.bgColor} ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground mb-2">{stat.count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
