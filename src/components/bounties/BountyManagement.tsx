import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useInfiniteAPI } from '../../hooks/useInfiniteAPI';
import { fetchBounties } from '../../services/api';
import { ScrambleText } from '../ScrambleText';
import { BountyCard } from './BountyCard';
import { PostBountyForm } from './PostBountyForm';
import type { BountyResponse } from '../../types';

const PHASE_FILTERS = ['all', 'active', 'settled'] as const;

export function BountyManagement() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [showPostForm, setShowPostForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { items: allBounties, loading, loadingMore, hasMore, sentinelRef } = useInfiniteAPI<BountyResponse>(
    async (offset, limit) => {
      const res = await fetchBounties({ creator: address, includeRejected: true, limit, offset });
      return { items: res.bounties, total: res.total };
    },
    [address, refreshKey],
    { enabled: isConnected && !!address },
  );

  const bounties = phaseFilter === 'all' ? allBounties : allBounties.filter((b) => {
    const isExpired = b.phase === 'active' && b.expiresAt && new Date(b.expiresAt).getTime() < Date.now();
    if (phaseFilter === 'active') return b.phase === 'active' && !isExpired;
    if (phaseFilter === 'settled') return b.phase === 'settled' || b.phase === 'refunded' || isExpired;
    return true;
  });

  const activeCount = allBounties.filter((b) => b.phase === 'active' && !(b.expiresAt && new Date(b.expiresAt).getTime() < Date.now())).length;
  const settledCount = allBounties.filter((b) => b.phase === 'settled' || b.phase === 'refunded').length;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <Link to="/bounties" className="font-mono text-xs text-text-muted hover:text-accent transition-colors">
        <ScrambleText text="&larr; BACK TO MARKETPLACE" delay={0} duration={400} />
      </Link>
      <div className="shrink-0 flex items-center justify-between">
        <ScrambleText text="Bounties Management" delay={0} duration={500} className="font-semibold text-lg" />
        {isConnected && address && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => disconnect()}
              className="font-mono text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted hover:border-red-400 hover:text-red-400 transition-colors"
            >
              {address.slice(0, 6)}...{address.slice(-4)} ✕
            </button>
            <button
              onClick={() => setShowPostForm(true)}
              className="font-mono text-xs font-bold px-4 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-600 transition-colors"
            >
              Post Bounty
            </button>
          </div>
        )}
      </div>

      {!isConnected ? (
        /* Not connected state */
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="font-mono text-sm text-text-muted">Connect your wallet to manage bounties</p>
          <button
            onClick={openConnectModal}
            className="font-mono text-xs font-bold px-6 py-2.5 rounded-lg bg-accent text-white hover:bg-accent-600 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="shrink-0 grid grid-cols-3 gap-3">
            <div className="stat-card">
              <div className="font-mono text-xs text-text-muted uppercase tracking-wide mb-1">Total Bounties</div>
              <div className="font-mono text-lg font-semibold text-accent">{allBounties.length}</div>
            </div>
            <div className="stat-card">
              <div className="font-mono text-xs text-text-muted uppercase tracking-wide mb-1">Active</div>
              <div className="font-mono text-lg font-semibold text-success">{activeCount}</div>
            </div>
            <div className="stat-card">
              <div className="font-mono text-xs text-text-muted uppercase tracking-wide mb-1">Settled / Expired</div>
              <div className="font-mono text-lg font-semibold text-text-secondary">{settledCount}</div>
            </div>
          </div>

          {/* Phase filter tabs */}
          <div className="shrink-0 flex gap-1">
            {PHASE_FILTERS.map((p) => (
              <button
                key={p}
                onClick={() => setPhaseFilter(p)}
                className={`font-mono text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-md transition-all ${
                  phaseFilter === p
                    ? 'bg-accent text-white'
                    : 'text-text-muted hover:bg-accent-50 hover:text-accent border border-border'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Scrollable grid */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {loading ? (
              <div className="text-center text-text-muted font-mono text-sm py-12 animate-pulse">Loading your bounties...</div>
            ) : bounties.length === 0 ? (
              <div className="text-center text-text-muted font-mono text-sm py-12">
                {allBounties.length === 0 ? (
                  <div className="space-y-3">
                    <p>You haven't posted any bounties yet</p>
                    <button
                      onClick={() => setShowPostForm(true)}
                      className="font-mono text-xs font-bold px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-600 transition-colors"
                    >
                      Post Bounty
                    </button>
                  </div>
                ) : (
                  `No ${phaseFilter} bounties`
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {bounties.map((b) => (
                  <BountyCard key={b.bountyId} bounty={b} linkPrefix="/bounties/manage" />
                ))}
              </div>
            )}

            {hasMore && (
              <div ref={sentinelRef} className="py-4 text-center text-text-muted font-mono text-xs">
                {loadingMore ? 'Loading more...' : ''}
              </div>
            )}
          </div>
        </>
      )}
      <PostBountyForm open={showPostForm} onClose={() => setShowPostForm(false)} onSuccess={() => setRefreshKey(k => k + 1)} />
    </div>
  );
}
