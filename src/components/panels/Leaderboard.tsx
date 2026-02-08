import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteAPI } from '../../hooks/useInfiniteAPI';
import { fetchLeaderboardPage } from '../../services/api';
import { fmtWei } from '../../utils/format';
import type { LeaderboardEntry } from '../../types';

export function Leaderboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { items: entries, loading, loadingMore, hasMore, sentinelRef } = useInfiniteAPI<LeaderboardEntry>(
    async (offset, limit) => {
      const res = await fetchLeaderboardPage(offset, limit);
      return { items: res.leaderboard };
    },
    [refreshKey],
  );

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header shrink-0 flex items-center justify-between">
        <span>Leaderboard</span>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="text-text-muted hover:text-text-primary transition-colors text-xs font-mono"
          title="Refresh"
        >
          {loading ? '...' : '\u21BB'}
        </button>
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
            <div className="w-5">#</div>
            <div className="flex-1">Address</div>
            <div className="w-16 text-right">MON Earned</div>
            <div className="w-8 text-right">Wins</div>
            <div className="w-12 text-right">Matches</div>
            <div className="w-10 text-right">Win %</div>
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
  const winPct = (entry.winRate * 100).toFixed(0);

  return (
    <div className="px-3 py-2 flex items-center gap-2 font-mono text-xs hover:bg-surface-hover transition-colors">
      <div className="w-5 text-text-muted">{rank}</div>
      <Link
        to={`/agents/${entry.agentAddr}`}
        className="flex-1 truncate hover:text-accent transition-colors"
      >
        {truncAddr}
      </Link>
      <div className="w-16 text-right text-accent">{fmtWei(entry.totalEarnedMon)}</div>
      <div className="w-8 text-right text-success">{entry.matchesWon}</div>
      <div className="w-12 text-right text-text-muted">{entry.matchesPlayed}</div>
      <div className="w-10 text-right text-text-secondary">{winPct}%</div>
    </div>
  );
}
