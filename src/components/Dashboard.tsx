import { useStats } from '../hooks/useStats';
import { fmtWei } from '../utils/format';
import { Leaderboard } from './panels/Leaderboard';
import { BurnStats } from './panels/BurnStats';
import { LiveFeed } from './panels/LiveFeed';
import { RecentMatches } from './panels/RecentMatches';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card py-2 px-3 border-l-3 border-l-accent">
      <div className="text-xs text-text-muted tracking-wide mb-0.5">{label}</div>
      <div className="font-mono text-base font-semibold text-accent">{value}</div>
    </div>
  );
}

export function Dashboard() {
  const { stats } = useStats();

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Stat Cards Row - fixed height */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <StatCard label="Total Matches" value={stats ? String(stats.totalMatches) : '—'} />
        <StatCard label="MON Earned" value={stats ? fmtWei(stats.totalPoolVolume) : '—'} />
        <StatCard label="NEURON Burned" value={stats ? fmtWei(stats.totalBurned) : '—'} />
        <StatCard label="Total Agents" value={stats ? String(stats.totalAgents) : '—'} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 min-h-0">
        <div className="min-h-0">
          <LiveFeed />
        </div>
        <div className="lg:col-span-2 min-h-0">
          <RecentMatches />
        </div>
        <div className="flex flex-col gap-3 min-h-0">
          <Leaderboard />
          <BurnStats />
        </div>
      </div>
    </div>
  );
}
