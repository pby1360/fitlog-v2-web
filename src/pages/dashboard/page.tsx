import { useState } from 'react';
import {
  AnalysisCard,
  DashboardHero,
  QuickActions,
  RecentWorkouts,
  StatCards,
  StatsModal,
  WeeklyCard,
  toWeekRows,
  useDashboard,
  useNow,
} from '@/features/dashboard';
import { isActiveStatus } from '@/features/session';

export default function DashboardPage() {
  const now = useNow();
  const { stats, latestSession, loading, error } = useDashboard();
  const [showStatsModal, setShowStatsModal] = useState(false);
  const weekRows = toWeekRows(stats);
  const activeSession = latestSession && isActiveStatus(latestSession.status) ? latestSession : null;

  return (
    <>
      <DashboardHero now={now} stats={stats} loading={loading} error={error} activeSession={activeSession} />
      <StatCards stats={stats} loading={loading} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <WeeklyCard weekRows={weekRows} />
          <AnalysisCard stats={stats} loading={loading} onShowDetail={() => setShowStatsModal(true)} />
        </div>
        <QuickActions />
        <RecentWorkouts workouts={stats?.recentWorkouts ?? []} loading={loading} />
      </div>

      {showStatsModal && stats && (
        <StatsModal stats={stats} weekRows={weekRows} onClose={() => setShowStatsModal(false)} />
      )}
    </>
  );
}
