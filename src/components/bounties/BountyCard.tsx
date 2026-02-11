import { Link } from 'react-router-dom';
import { BountyStatusBadge } from './BountyStatusBadge';
import { fmtWei } from '../../utils/format';
import type { BountyResponse } from '../../types';

export function BountyCard({ bounty }: { bounty: BountyResponse }) {
  const timeLeft = getTimeRemaining(bounty.expiresAt);

  return (
    <Link
      to={`/bounties/${bounty.bountyId}`}
      className="block panel hover:border-accent-200 transition-all"
    >
      <div className="p-4 space-y-3">
        {/* Header: badge + reward */}
        <div className="flex items-center justify-between">
          <BountyStatusBadge phase={bounty.phase} />
          <span className="font-mono text-sm font-bold text-accent">
            {fmtWei(bounty.rewardAmount)} MON
          </span>
        </div>

        {/* Question preview */}
        <p className="font-mono text-sm text-text-secondary line-clamp-2 leading-relaxed">
          {bounty.questionText}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 font-mono text-[10px] text-text-muted">
          <span className="px-1.5 py-0.5 rounded bg-bg-alt">{bounty.category}</span>
          <span>Diff {bounty.difficulty}/5</span>
          <span>Min Rating {bounty.minRating}</span>
          <span className="ml-auto">{bounty.agentCount} agents</span>
        </div>

        {/* Timer / settled info */}
        {bounty.phase === 'active' || bounty.phase === 'answer_period' ? (
          <div className="font-mono text-[10px] text-text-muted">
            {timeLeft}
          </div>
        ) : bounty.winnerAddr ? (
          <div className="font-mono text-[10px] text-success">
            Won by {bounty.winnerAddr.slice(0, 6)}...{bounty.winnerAddr.slice(-4)}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function getTimeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
