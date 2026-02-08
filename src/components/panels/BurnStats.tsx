import { useStats } from '../../hooks/useStats';
import { fmtWei, fromWei, compact } from '../../utils/format';

export function BurnStats() {
  const { stats } = useStats();

  const totalBurned = stats ? fmtWei(stats.totalBurned) : '0';
  const todayBurned = stats ? fmtWei(stats.last24hBurned) : '0';
  const settled = stats?.settledMatches ?? 0;
  const avgPerMatch =
    settled > 0 ? compact(fromWei(stats!.totalBurned) / settled) : '0';

  return (
    <div className="panel">
      <div className="panel-header">Burn Stats</div>
      <div className="p-4 space-y-3">
        <StatRow label="Total Burned" value={totalBurned} />
        <StatRow label="Last 24h" value={todayBurned} />
        <StatRow label="Avg Per Match" value={avgPerMatch} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between font-mono text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-accent font-semibold">{value}</span>
    </div>
  );
}
