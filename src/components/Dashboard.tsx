import { useCallback } from 'react';
import { useStats } from '../hooks/useStats';
import { fromWei, compact } from '../utils/format';
import { AnimatedNumber } from './AnimatedNumber';
import { ScrambleText } from './ScrambleText';
import { Leaderboard } from './panels/Leaderboard';
import { BurnStats } from './panels/BurnStats';
import { LiveFeed } from './panels/LiveFeed';
import { RecentMatches } from './panels/RecentMatches';

function StatCard({ label, value, formatter, delay = 0 }: { label: string; value: number | null; formatter: (n: number) => string; delay?: number }) {
  return (
    <div className="stat-card py-2 px-3 border-l-3 border-l-accent">
      <div className="text-xs text-text-muted tracking-wide mb-0.5"><ScrambleText text={label} delay={delay} duration={500} /></div>
      <div className="font-mono text-base font-semibold text-accent">
        {value === null ? '—' : <AnimatedNumber value={value} formatter={formatter} />}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { stats } = useStats();
  const fmtInt = useCallback((n: number) => String(Math.round(n)), []);
  const fmtCompact = useCallback((n: number) => compact(n), []);

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Stat Cards Row - fixed height */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <StatCard label="Total Matches" value={stats ? stats.totalMatches : null} formatter={fmtInt} delay={200} />
        <StatCard label="MON Earned" value={stats ? fromWei(stats.totalEarnings) : null} formatter={fmtCompact} delay={250} />
        <StatCard label="NEURON Burned" value={stats ? fromWei(stats.totalBurned) : null} formatter={fmtCompact} delay={300} />
        <StatCard label="Total Agents" value={stats ? stats.totalAgents : null} formatter={fmtInt} delay={350} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-[1fr] gap-3 flex-1 min-h-0">
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
