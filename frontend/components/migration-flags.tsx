import { CheckCircle, Clock, Zap, AlertCircle } from 'lucide-react';

interface FlagCard {
  flag: number;
  label: string;
  count: number;
  icon: React.ReactNode;
}

export default function MigrationFlags() {
  const flags: FlagCard[] = [
    { flag: 0, label: 'Normal', count: 1254, icon: <CheckCircle size={22} /> },
    { flag: 1, label: 'Initiated', count: 342, icon: <Clock size={22} /> },
    { flag: 2, label: 'Activated + Balance Migration', count: 876, icon: <Zap size={22} /> },
    { flag: 3, label: 'History Migration', count: 523, icon: <AlertCircle size={22} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Cards per Migration Flag</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {flags.map((flag) => (
            <div key={flag.flag} className="kpi-card">
              <div className="kpi-card-icon">{flag.icon}</div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground mb-0.5">Flag {flag.flag}</p>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{flag.label}</h3>
                <p className="text-2xl font-bold text-primary">{flag.count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">cards</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
