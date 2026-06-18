import { CheckCircle, Clock, Zap, AlertCircle } from 'lucide-react';

interface FlagCard {
  flag: number;
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function MigrationFlags() {
  const flags: FlagCard[] = [
    {
      flag: 0,
      label: 'Normal',
      count: 1254,
      icon: <CheckCircle size={24} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      flag: 1,
      label: 'Initiated',
      count: 342,
      icon: <Clock size={24} />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      flag: 2,
      label: 'Activated + Balance Migration',
      count: 876,
      icon: <Zap size={24} />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      flag: 3,
      label: 'History Migration',
      count: 523,
      icon: <AlertCircle size={24} />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Cards per Migration Flag</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {flags.map((flag) => (
            <div
              key={flag.flag}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className={`${flag.bgColor} ${flag.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                {flag.icon}
              </div>
              <p className="text-sm text-muted-foreground mb-1">Flag {flag.flag}</p>
              <h3 className="text-lg font-semibold text-foreground mb-3">{flag.label}</h3>
              <p className="text-3xl font-bold text-primary">{flag.count.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">cards</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
