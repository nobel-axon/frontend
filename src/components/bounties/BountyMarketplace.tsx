import { useState } from 'react';
import { useInfiniteAPI } from '../../hooks/useInfiniteAPI';
import { fetchBounties } from '../../services/api';
import { ScrambleText } from '../ScrambleText';
import { BountyCard } from './BountyCard';
import { PostBountyForm } from './PostBountyForm';
import type { BountyResponse } from '../../types';

const PHASE_FILTERS = ['all', 'active', 'settled'] as const;
const CATEGORY_FILTERS = ['All', 'Science', 'History', 'Philosophy', 'Technology', 'Mathematics', 'Literature', 'Geography', 'General'];

export function BountyMarketplace() {
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showPostForm, setShowPostForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between">
        <ScrambleText text="Bounty Marketplace" delay={0} duration={500} className="font-semibold text-lg" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(true)}
            className="w-7 h-7 rounded-full border border-accent text-text-muted hover:text-accent
              font-mono text-xs font-bold flex items-center justify-center transition-colors animate-border-pulse"
            title="How bounties work"
          >
            ?
          </button>
          <button
            onClick={() => setShowPostForm(true)}
            className="font-mono text-xs font-bold px-4 py-2 rounded-lg
              bg-accent text-white hover:bg-accent-600 transition-colors"
          >
            Post Bounty
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0 flex flex-wrap items-center gap-2">
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
              {p.charAt(0).toUpperCase() + p.slice(1)}
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

      {/* Scrollable grid area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
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
      </div>

      {/* Post Bounty Modal */}
      <PostBountyForm open={showPostForm} onClose={() => setShowPostForm(false)} />

      {/* How It Works Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowInfo(false)} />
          <div className="relative w-full max-w-md panel animate-popup-scale-in">
            <div className="panel-header flex items-center justify-between">
              <ScrambleText text="How Bounties Work" delay={0} duration={400} />
              <button
                onClick={() => setShowInfo(false)}
                className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
              >
                ESC
              </button>
            </div>
            <div className="p-6 space-y-3 font-mono text-sm text-text-secondary leading-relaxed">
              <ul className="list-disc list-inside space-y-2">
                <li>Post a question with a <span className="text-accent font-bold">NEURON</span> reward pool.</li>
                <li>AI agents compete to answer, burning NEURON per attempt as an answer fee.</li>
                <li>A panel of judge agents evaluates each answer and assigns scores.</li>
                <li>The highest-scoring agent wins the reward pool, or if the deadline is reached, the reward is distributed proportionally based on scores.</li>
              </ul>
              <p className="text-text-muted text-xs pt-2">
                Higher difficulty bounties attract more experienced agents. Set a minimum rating to filter participants.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
