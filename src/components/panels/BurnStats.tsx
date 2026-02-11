import { useCallback } from 'react';
import { useStats } from '../../hooks/useStats';
import { fromWei, compact } from '../../utils/format';
import { AnimatedNumber } from '../AnimatedNumber';
import { ScrambleText } from '../ScrambleText';

export function BurnStats() {
  const { stats } = useStats();
  const fmtCompact = useCallback((n: number) => compact(n), []);

  const totalBurned = stats ? fromWei(stats.totalBurned) : 0;
  const todayBurned = stats ? fromWei(stats.last24hBurned) : 0;
  const settled = stats?.settledMatches ?? 0;
  const avgPerMatch = settled > 0 ? fromWei(stats!.totalBurned) / settled : 0;

  return (
    <div className="panel shrink-0">
      <div className="panel-header"><ScrambleText text="Burn Stats" delay={550} duration={500} /></div>
      <div className="p-4 space-y-3">
        <StatRow label="Total Burned" value={totalBurned} formatter={fmtCompact} delay={580} />
        <StatRow label="Last 24h" value={todayBurned} formatter={fmtCompact} delay={610} />
        <StatRow label="Avg Per Match" value={avgPerMatch} formatter={fmtCompact} delay={640} />
      </div>
    </div>
  );
}

function StatRow({ label, value, formatter, delay = 0 }: { label: string; value: number; formatter: (n: number) => string; delay?: number }) {
  return (
    <div className="flex justify-between font-mono text-sm">
      <ScrambleText text={label} delay={delay} duration={400} className="text-text-muted" />
      <span className="text-accent font-semibold">
        <AnimatedNumber value={value} formatter={formatter} />
      </span>
    </div>
  );
}
