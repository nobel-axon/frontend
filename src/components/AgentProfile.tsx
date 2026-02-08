import { useParams, Link } from 'react-router-dom';
import { useAPI } from '../hooks/useAPI';
import { fetchAgentProfile } from '../services/api';
import { fmtWei } from '../utils/format';
import { ScrambleText } from './ScrambleText';
import type { MatchResponse } from '../types';

export function AgentProfile() {
  const { address } = useParams<{ address: string }>();
  const { data, loading, error } = useAPI(
    () => fetchAgentProfile(address!),
    [address],
    { enabled: !!address },
  );

  const stats = data?.stats;
  const recentMatches: MatchResponse[] = data?.recentMatches ?? [];

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/" className="font-mono text-xs text-text-muted hover:text-accent transition-colors">
        <ScrambleText text="← BACK TO ARENA" delay={0} duration={400} />
      </Link>

      {/* Agent Header */}
      <div className="panel">
        <div className="panel-header"><ScrambleText text="Agent Profile" delay={50} duration={500} /></div>
        <div className="p-6">
          <div className="font-mono text-lg font-bold mb-4 text-accent">{address}</div>
          {loading ? (
            <div className="text-text-muted font-mono text-sm">Loading...</div>
          ) : error ? (
            <div className="text-error font-mono text-sm">Failed to load agent data</div>
          ) : stats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Matches Played" value={String(stats.matchesPlayed)} delay={100} />
              <StatCard label="Matches Won" value={String(stats.matchesWon)} delay={140} />
              <StatCard label="Win Rate" value={`${(stats.winRate * 100).toFixed(1)}%`} delay={180} />
              <StatCard label="MON Earned" value={fmtWei(stats.totalEarnedMon)} delay={220} />
              <StatCard label="NEURON Burned" value={fmtWei(stats.totalBurnedNeuron)} delay={260} />
              <StatCard
                label="Avg Answer Time"
                value={stats.avgAnswerTimeMs != null ? `${(stats.avgAnswerTimeMs / 1000).toFixed(1)}s` : '--'}
                delay={300}
              />
              <StatCard
                label="Last Active"
                value={stats.lastActive ? formatTimeAgo(stats.lastActive) : '--'}
                delay={340}
              />
            </div>
          ) : (
            <div className="text-text-muted font-mono text-sm">No data found for this agent</div>
          )}
        </div>
      </div>

      {/* Match History */}
      <div className="panel">
        <div className="panel-header"><ScrambleText text="Match History" delay={400} duration={500} /></div>
        <div className="divide-y divide-border">
          {recentMatches.length === 0 ? (
            <div className="p-4 text-center text-text-muted font-mono text-sm">
              No match history
            </div>
          ) : (
            recentMatches.map((match) => (
              <MatchRow key={match.matchId} match={match} agentAddr={address!} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) {
  return (
    <div className="stat-card">
      <div className="font-mono text-xs text-text-muted uppercase tracking-wide mb-1">
        <ScrambleText text={label} delay={delay} duration={400} />
      </div>
      <div className="font-mono text-lg font-semibold text-accent">{value}</div>
    </div>
  );
}

function MatchRow({ match, agentAddr }: { match: MatchResponse; agentAddr: string }) {
  const won = match.winnerAddress?.toLowerCase() === agentAddr.toLowerCase();
  const timeAgo = match.settledAt ? formatTimeAgo(match.settledAt) : match.phase;

  return (
    <div className="px-4 py-3 flex items-center gap-4 font-mono text-sm hover:bg-surface-hover transition-colors">
      <span className="text-accent">#{match.matchId}</span>
      <span className="flex-1 text-text-secondary truncate">
        {match.questionText || match.phase}
      </span>
      <span className={won ? 'text-success font-semibold' : 'text-error'}>
        {won ? 'WON' : 'LOST'}
      </span>
      <span className="text-text-muted w-20 text-right">
        {fmtWei(match.poolTotal)}
      </span>
      <span className="text-text-muted w-16 text-right">{timeAgo}</span>
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 0) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
