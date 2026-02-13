import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ScrambleText } from '../ScrambleText';
import { postBounty } from '../../services/api';

interface PostBountyFormProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = ['Science', 'History', 'Philosophy', 'Technology', 'Mathematics', 'Literature', 'Geography', 'General'];
const DIFFICULTIES = [1, 2, 3, 4, 5];

export function PostBountyForm({ open, onClose }: PostBountyFormProps) {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState(3);
  const [reward, setReward] = useState('');
  const [baseAnswerFee, setBaseAnswerFee] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  if (!open) return null;

  const canSubmit = question.trim() && reward && deadline && address && !submitting;

  async function handleSubmit() {
    if (!canSubmit || !address) return;
    setSubmitting(true);
    setError(null);
    try {
      await postBounty({
        questionText: question.trim(),
        category,
        difficulty,
        entryFee: reward,
        deadline: new Date(deadline).toISOString(),
        maxParticipants: parseInt(maxParticipants, 10) || 10,
        minRating,
        creatorAddress: address,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create bounty');
    } finally {
      setSubmitting(false);
    }
  }

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
              <label className="block font-mono text-xs text-text-muted mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                  focus:outline-none focus:border-accent transition-colors font-mono"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d} — {['Trivial', 'Easy', 'Medium', 'Hard', 'Expert'][d - 1]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reward + Answer Fee row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1">Entry Fee (NEURON)</label>
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
              <label className="block font-mono text-xs text-text-muted mb-1">Answer Fee (NEURON)</label>
              <input
                type="text"
                value={baseAnswerFee}
                onChange={(e) => setBaseAnswerFee(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                  placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors font-mono"
              />
            </div>
          </div>

          {/* Min Rating + Max Participants row */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1">Max Participants</label>
              <input
                type="number"
                min="1"
                max="100"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                  focus:outline-none focus:border-accent transition-colors font-mono"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block font-mono text-xs text-text-muted mb-1">Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                focus:outline-none focus:border-accent transition-colors font-mono"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="font-mono text-xs text-red-400">{error}</p>
          )}

          {/* Actions */}
          {isConnected ? (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => disconnect()}
                className="font-mono text-[10px] text-text-muted hover:text-red-400 transition-colors"
                title={address}
              >
                {address?.slice(0, 6)}...{address?.slice(-4)} · Disconnect
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="font-mono text-xs font-medium px-4 py-2 rounded-lg border border-border
                    text-text-muted hover:bg-bg-alt transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="font-mono text-xs font-bold px-4 py-2 rounded-lg
                    bg-accent text-white hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Posting...' : 'Post Bounty'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => openConnectModal?.()}
              className="w-full font-mono text-sm font-bold py-3 rounded-lg
                bg-orange-500 text-white hover:bg-orange-400 transition-colors pt-2"
            >
              Connect Wallet
            </button>
          )}

          <p className="font-mono text-[10px] text-text-muted">
            Bounty creation requires a connected wallet and sufficient NEURON balance.
          </p>
        </div>
      </div>
    </div>
  );
}
