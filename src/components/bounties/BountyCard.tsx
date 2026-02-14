import { Link } from 'react-router-dom';
import { BountyStatusBadge } from './BountyStatusBadge';
import { fmtWei } from '../../utils/format';
import { config } from '../../config';
import type { BountyResponse } from '../../types';

function accentBorder(phase: string) {
  switch (phase) {
    case 'open':
    case 'active':
      return 'border-l-3 border-l-accent';
    case 'settled':
      return 'border-l-3 border-l-success';
    case 'pending':
      return 'border-l-3 border-l-yellow-400';
    case 'refunded':
      return 'border-l-3 border-l-orange-400';
    case 'rejected':
      return 'border-l-3 border-l-red-400';
    default:
      return '';
  }
}

export function BountyCard({ bounty }: { bounty: BountyResponse }) {
  const timeLeft = bounty.expiresAt ? getTimeRemaining(bounty.expiresAt) : null;
  const isActive = bounty.phase === 'active' || bounty.phase === 'open';

  return (
    <Link
      to={`/bounties/${bounty.bountyId}`}
      className={`flex flex-col panel ${accentBorder(bounty.phase)} hover:border-accent-300 hover:shadow-md transition-all`}
    >
      <div className="p-4 space-y-3 flex-1">
        {/* Header: badge + category + min rating | time/winner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BountyStatusBadge phase={bounty.phase} expiresAt={bounty.expiresAt} />
            <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono text-[10px] uppercase tracking-wider">{bounty.category}</span>
          </div>
          <span className="font-mono text-[10px] text-text-muted">Required Reputation {bounty.minRating}</span>
        </div>

        {/* Question preview */}
        <p className="font-mono text-sm text-text line-clamp-2 leading-relaxed">
          {bounty.questionText}
        </p>

        {/* Stat chips */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-text-muted">
          <span className="px-2 py-0.5 bg-bg-alt rounded-md">{bounty.agentCount} agents</span>
          <span className="px-2 py-0.5 bg-bg-alt rounded-md">{bounty.answerCount} answers</span>
        </div>
      </div>

      {/* Reward strip + status info */}
      <div className="px-4 py-2 bg-accent-50 border-t border-border font-mono text-sm flex items-center justify-between">
        <span className="font-bold text-accent">{fmtWei(bounty.rewardAmount)} NEURON</span>
        <span className="text-[10px] text-text-muted">
          {isActive ? (
            timeLeft
          ) : bounty.winnerAddr ? (
            <span className="flex items-center gap-1">
              Won by {bounty.winnerAddr.slice(0, 6)}...{bounty.winnerAddr.slice(-4)}
              <ExplorerLink txHash={bounty.settleTxHash} />
            </span>
          ) : bounty.settleTxHash ? (
            <span className="flex items-center gap-1">
              Split by score
              <ExplorerLink txHash={bounty.settleTxHash} />
            </span>
          ) : null}
        </span>
      </div>
    </Link>
  );
}

function ExplorerLink({ txHash }: { txHash?: string }) {
  if (!txHash) return null;
  return (
    <a
      href={`${config.blockExplorerUrl}/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-text-muted hover:text-accent transition-colors"
      onClick={(e) => e.stopPropagation()}
      title="View on explorer"
    >
      <svg className="w-3 h-3 inline" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 3H3v10h10v-3M9 3h4v4M9 7l4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

function getTimeRemaining(expiresAt: string): string | null {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
