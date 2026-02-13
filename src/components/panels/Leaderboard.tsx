import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteAPI } from '../../hooks/useInfiniteAPI';
import { fetchLeaderboardPage } from '../../services/api';
import { fmtWei } from '../../utils/format';
import { ScrambleText } from '../ScrambleText';
import type { LeaderboardEntry } from '../../types';

const SORT_OPTIONS = [
  { value: 'earnings', label: 'Earnings' },
  { value: 'wins', label: 'Wins' },
  { value: 'reputation', label: 'Reputation' },
] as const;

export function Leaderboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortBy, setSortBy] = useState<string>('earnings');
  const { items: entries, loading, loadingMore, hasMore, sentinelRef } = useInfiniteAPI<LeaderboardEntry>(
    async (offset, limit) => {
      const res = await fetchLeaderboardPage(offset, limit, sortBy);
      return { items: res.leaderboard };
    },
    [refreshKey, sortBy],
  );

  return (
    <div className="panel flex-1 min-h-0 flex flex-col">
      <div className="panel-header shrink-0 flex items-center justify-between">
        <ScrambleText text="Leaderboard" delay={500} duration={500} />
        <div className="flex items-center gap-1.5">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="font-mono text-[10px] px-1.5 py-0.5 bg-bg-alt border border-border rounded
              focus:outline-none focus:border-accent transition-colors"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="font-mono text-xs font-medium px-2.5 py-1 rounded border border-border
              text-text-muted hover:bg-accent-50 hover:border-accent-200 hover:text-accent transition-all"
            title="Refresh"
          >
            {loading ? '...' : '\u21BB'}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="p-4 text-center text-text-muted font-mono text-sm animate-pulse">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="p-4 text-center text-text-muted font-mono text-sm">
          No data yet
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border">
          <div className="px-3 py-1.5 flex items-center gap-2 font-mono text-[10px] text-text-muted sticky top-0 bg-surface">
            <div className="w-5"><ScrambleText text="#" delay={530} duration={400} /></div>
            <div className="flex-1"><ScrambleText text="Address" delay={530} duration={400} /></div>
            <div className="w-10 text-right"><ScrambleText text="Rep" delay={530} duration={400} /></div>
            <div className="w-16 text-right"><ScrambleText text="MON Earned" delay={530} duration={400} /></div>
            <div className="w-10 text-right"><ScrambleText text="Win %" delay={530} duration={400} /></div>
          </div>
          {entries.map((entry, i) => (
            <LeaderboardRow key={entry.agentAddr} entry={entry} rank={i + 1} />
          ))}
          {hasMore && (
            <div ref={sentinelRef} className="p-2 text-center text-text-muted font-mono text-xs">
              {loadingMore ? 'Loading...' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const truncAddr = `${entry.agentAddr.slice(0, 6)}...${entry.agentAddr.slice(-4)}`;
  return (
    <div className="px-3 py-2 flex items-center gap-2 font-mono text-xs hover:bg-surface-hover transition-colors">
      <div className="w-5 text-text-muted">{rank}</div>
      <Link
        to={`/agents/${entry.agentAddr}`}
        className="flex-1 truncate hover:text-accent transition-colors"
      >
        {truncAddr}
      </Link>
      <div className="w-10 text-right text-accent-600">{entry.reputationScore ?? '--'}</div>
      <div className="w-16 text-right text-accent">{fmtWei(entry.totalEarnedMon)}</div>
      <div className="w-10 text-right text-text-secondary">{(entry.winRate * 100).toFixed(0)}%</div>
    </div>
  );
}
