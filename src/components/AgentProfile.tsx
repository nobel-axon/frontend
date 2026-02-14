import { useParams, Link } from 'react-router-dom';
import { useAPI } from '../hooks/useAPI';
import { fetchAgentProfile, fetchAgentEconomics } from '../services/api';
import { fmtWei } from '../utils/format';
import { ScrambleText } from './ScrambleText';
import type { MatchResponse, AgentEconomics } from '../types';

export function AgentProfile() {
  const { address } = useParams<{ address: string }>();
  const { data, loading, error } = useAPI(
    () => fetchAgentProfile(address!),
    [address],
    { enabled: !!address },
  );
  const { data: economics } = useAPI(
    () => fetchAgentEconomics(address!),
    [address],
    { enabled: !!address },
  );

  const stats = data?.stats;
  const recentMatches: MatchResponse[] = data?.recentMatches ?? [];

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/" className="font-mono text-xs text-text-muted hover:text-accent transition-colors">
        <ScrambleText text="&larr; BACK TO ARENA" delay={0} duration={400} />
      </Link>

      {/* Agent Header */}
      <div className="panel">
        <div className="panel-header"><ScrambleText text="Agent Profile" delay={50} duration={500} /></div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="font-mono text-lg font-bold text-accent">{address}</div>
            {stats?.reputationScore != null && (
              <ReputationBadge score={stats.reputationScore} rating={stats.erc8004Rating} />
            )}
          </div>
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
              {stats.erc8004Rating != null && (
                <StatCard label="ERC-8004 Rating" value={String(stats.erc8004Rating)} delay={380} />
              )}
            </div>
          ) : (
            <div className="text-text-muted font-mono text-sm">No data found for this agent</div>
          )}
        </div>
      </div>

      {/* Economics Dashboard */}
      {economics && <EconomicsDashboard economics={economics} />}

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

function ReputationBadge({ score, rating }: { score: number; rating?: number }) {
  const tier = score >= 80 ? 'Elite' : score >= 60 ? 'Expert' : score >= 40 ? 'Skilled' : score >= 20 ? 'Novice' : 'Unranked';
  const tierColor = score >= 80 ? 'text-accent' : score >= 60 ? 'text-success' : score >= 40 ? 'text-warning' : 'text-text-muted';

  return (
    <div className="flex items-center gap-2">
      <div className={`px-3 py-1 rounded-lg bg-accent/10 border border-accent/20`}>
        <span className="font-mono text-xs text-text-muted">REP </span>
        <span className={`font-mono text-sm font-bold ${tierColor}`}>{score}</span>
      </div>
      <span className={`font-mono text-xs font-semibold ${tierColor}`}>{tier}</span>
      {rating != null && (
        <span className="font-mono text-[10px] text-text-muted">(ERC-8004: {rating})</span>
      )}
    </div>
  );
}

function EconomicsDashboard({ economics }: { economics: AgentEconomics }) {
  const pnlPositive = !economics.netPnlMon.startsWith('-') && economics.netPnlMon !== '0';

  return (
    <div className="panel">
      <div className="panel-header"><ScrambleText text="Economics" delay={420} duration={500} /></div>
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="MON Spent" value={fmtWei(economics.totalSpentMon)} delay={440} />
          <StatCard label="MON Earned" value={fmtWei(economics.totalEarnedMon)} delay={460} />
          <div className="stat-card">
            <div className="font-mono text-xs text-text-muted uppercase tracking-wide mb-1">
              <ScrambleText text="Net P&L (MON)" delay={480} duration={400} />
            </div>
            <div className={`font-mono text-lg font-semibold ${pnlPositive ? 'text-success' : 'text-error'}`}>
              {pnlPositive ? '+' : ''}{fmtWei(economics.netPnlMon)}
            </div>
          </div>
          <StatCard label="Match ROI" value={`${(economics.matchRoi * 100).toFixed(1)}%`} delay={500} />
          <StatCard label="NEURON Burned" value={fmtWei(economics.totalBurnedNeuron)} delay={520} />
          <StatCard label="Bounty ROI" value={`${(economics.bountyRoi * 100).toFixed(1)}%`} delay={540} />
          <StatCard label="Bounties Participated" value={String(economics.bountiesParticipated)} delay={560} />
          <StatCard label="Bounties Won" value={String(economics.bountiesWon)} delay={580} />
        </div>
      </div>
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
