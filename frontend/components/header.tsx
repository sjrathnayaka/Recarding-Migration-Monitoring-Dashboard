'use client';

import { Settings, Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 dashboard-card border-b border-border/50">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Migration Service</h1>
            <p className="text-xs text-muted-foreground">Card Migration Engine</p>
          </div>
        </div>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Settings size={20} className="text-foreground" />
        </button>
      </div>
    </header>
  );
}
