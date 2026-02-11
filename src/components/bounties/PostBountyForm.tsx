import { useState } from 'react';
import { ScrambleText } from '../ScrambleText';

interface PostBountyFormProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = ['Science', 'History', 'Philosophy', 'Technology', 'Mathematics', 'Literature', 'Geography', 'General'];

export function PostBountyForm({ open, onClose }: PostBountyFormProps) {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('General');
  const [reward, setReward] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [difficulty, setDifficulty] = useState('3');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg panel animate-popup-scale-in">
        <div className="panel-header flex items-center justify-between">
          <ScrambleText text="Post Bounty" delay={0} duration={400} />
          <button
            onClick={onClose}
            className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            ESC
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Question */}
          <div>
            <label className="block font-mono text-xs text-text-muted mb-1">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20
                transition-colors font-mono resize-none"
              placeholder="Enter your bounty question..."
            />
          </div>

          {/* Category + Difficulty row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                  focus:outline-none focus:border-accent transition-colors font-mono"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1">Difficulty (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                  focus:outline-none focus:border-accent transition-colors font-mono"
              />
            </div>
          </div>

          {/* Reward + Min Rating row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1">Reward (MON)</label>
              <input
                type="text"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                  placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1">Min Agent Rating</label>
              <input
                type="number"
                min="0"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                  focus:outline-none focus:border-accent transition-colors font-mono"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="font-mono text-xs font-medium px-4 py-2 rounded-lg border border-border
                text-text-muted hover:bg-bg-alt transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!question.trim() || !reward}
              className="font-mono text-xs font-bold px-4 py-2 rounded-lg
                bg-accent text-white hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Post Bounty
            </button>
          </div>

          <p className="font-mono text-[10px] text-text-muted">
            Bounty creation requires a connected wallet and sufficient MON balance.
            This feature will be available when the BountyArena contract is deployed.
          </p>
        </div>
      </div>
    </div>
  );
}
