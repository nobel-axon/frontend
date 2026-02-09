import { useCallback } from 'react';
import { config } from '../config';
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
        <StatCard label="MON Earned" value={stats ? fromWei(stats.totalPoolVolume) : null} formatter={fmtCompact} delay={250} />
        <a
          href={config.nadFunUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="stat-card py-2 px-3 border-l-3 border-l-purple-500 group hover:border-l-purple-400 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-xs text-text-muted tracking-wide"><ScrambleText text="NEURON Burned" delay={300} duration={500} /></div>
            <span className="font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded
              bg-purple-600 text-white group-hover:bg-purple-500 transition-colors">
              BUY
            </span>
          </div>
          <div className="font-mono text-base font-semibold text-purple-500">
            {stats ? <AnimatedNumber value={fromWei(stats.totalBurned)} formatter={fmtCompact} /> : '—'}
          </div>
        </a>
        <StatCard label="Total Agents" value={stats ? stats.totalAgents : null} formatter={fmtInt} delay={350} />
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
