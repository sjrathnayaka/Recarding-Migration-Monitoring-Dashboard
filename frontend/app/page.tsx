'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/dashboard';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return <Dashboard />;
}
