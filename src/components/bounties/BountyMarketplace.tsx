import { useState } from 'react';
import { useInfiniteAPI } from '../../hooks/useInfiniteAPI';
import { fetchBounties } from '../../services/api';
import { ScrambleText } from '../ScrambleText';
import { BountyCard } from './BountyCard';
import { PostBountyForm } from './PostBountyForm';
import type { BountyResponse } from '../../types';

const PHASE_FILTERS = ['all', 'active', 'answer_period', 'settled', 'expired'] as const;
const CATEGORY_FILTERS = ['All', 'Science', 'History', 'Philosophy', 'Technology', 'Mathematics', 'Literature', 'Geography', 'General'];

export function BountyMarketplace() {
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showPostForm, setShowPostForm] = useState(false);

  const phase = phaseFilter === 'all' ? undefined : phaseFilter;
  const category = categoryFilter === 'All' ? undefined : categoryFilter;

  const { items: bounties, loading, loadingMore, hasMore, sentinelRef } = useInfiniteAPI<BountyResponse>(
    async (offset, limit) => {
      const res = await fetchBounties({ phase, category, limit, offset });
      return { items: res.bounties, total: res.total };
    },
    [phaseFilter, categoryFilter],
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <ScrambleText text="Bounty Marketplace" delay={0} duration={500} className="font-semibold text-lg" />
        <button
          onClick={() => setShowPostForm(true)}
          className="font-mono text-xs font-bold px-4 py-2 rounded-lg
            bg-accent text-white hover:bg-accent-600 transition-colors"
        >
          Post Bounty
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Phase tabs */}
        <div className="flex gap-1">
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
              {p === 'answer_period' ? 'Answering' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Category select */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="ml-auto font-mono text-xs px-2 py-1 bg-bg-alt border border-border rounded-md
            focus:outline-none focus:border-accent transition-colors"
        >
          {CATEGORY_FILTERS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Bounty Grid */}
      {loading ? (
        <div className="text-center text-text-muted font-mono text-sm py-12 animate-pulse">Loading bounties...</div>
      ) : bounties.length === 0 ? (
        <div className="text-center text-text-muted font-mono text-sm py-12">
          No bounties found. Be the first to post one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {bounties.map((b) => (
            <BountyCard key={b.bountyId} bounty={b} />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="py-4 text-center text-text-muted font-mono text-xs">
          {loadingMore ? 'Loading more...' : ''}
        </div>
      )}

      {/* Post Bounty Modal */}
      <PostBountyForm open={showPostForm} onClose={() => setShowPostForm(false)} />
    </div>
  );
}
