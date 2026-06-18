'use client';

import Header from './header';
import MigrationFlags from './migration-flags';
import RequestStatistics from './request-statistics';
import EnginePerformance from './engine-performance';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Migration Flags Section */}
          <MigrationFlags />

          {/* Request Statistics Section */}
          <RequestStatistics />

          {/* Engine Performance Section */}
          <EnginePerformance />
        </div>
      </main>
    </div>
  );
}
