import { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ScrambleText } from '../ScrambleText';
import { postBounty, fetchBounties } from '../../services/api';
import { toWei } from '../../utils/format';

interface PostBountyFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = ['Science', 'History', 'Philosophy', 'Technology', 'Mathematics', 'Literature', 'Geography', 'General'];

export function PostBountyForm({ open, onClose, onSuccess }: PostBountyFormProps) {
  const [question, setQuestion] = useState('');
  const [winningCriteria, setWinningCriteria] = useState('');
  const [category, setCategory] = useState('General');
  const [reward, setReward] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bountyFound, setBountyFound] = useState(false);
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const bountyCountRef = useRef<number | null>(null);

  // Poll for new bounty after successful post
  useEffect(() => {
    if (!success || bountyFound || !address) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetchBounties({ creator: address, limit: 1 });
        if (bountyCountRef.current !== null && res.total > bountyCountRef.current) {
          setBountyFound(true);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);
    // Timeout after 60s
    const timeout = setTimeout(() => setBountyFound(true), 60000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [success, bountyFound, address]);

  function resetForm() {
    setQuestion('');
    setWinningCriteria('');
    setCategory('General');
    setReward('');
    setMinRating('0');
    setMaxParticipants('10');
    setDeadline('');
    setSubmitting(false);
    setError(null);
    setSuccess(false);
    setBountyFound(false);
    bountyCountRef.current = null;
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  if (!open) return null;

  const canSubmit = question.trim() && reward && deadline && address && !submitting;

  async function handleSubmit() {
    if (!canSubmit || !address) return;
    setSubmitting(true);
    setError(null);
    try {
      // Snapshot current bounty count for polling comparison
      const before = await fetchBounties({ creator: address, limit: 1 });
      bountyCountRef.current = before.total;
      await postBounty({
        questionText: winningCriteria.trim()
          ? `${question.trim()}\n\nWinning Criteria: ${winningCriteria.trim()}`
          : question.trim(),
        category,
        difficulty: 1,
        entryFee: toWei(reward),
        deadline: new Date(deadline).toISOString(),
        maxParticipants: parseInt(maxParticipants, 10) || 10,
        minRating,
        creatorAddress: address,
      });
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create bounty');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDone() {
    onSuccess?.();
    handleClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg panel animate-popup-scale-in">
        <div className="panel-header flex items-center justify-between">
          <ScrambleText text="Post Bounty" delay={0} duration={400} />
          <button
            onClick={handleClose}
            className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            ESC
          </button>
        </div>

        {success ? (
          /* Success view */
          <div className="p-6 flex flex-col items-center gap-5 py-10">
            <div className="w-14 h-14 rounded-full bg-success/15 border-2 border-success flex items-center justify-center">
              <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <p className="font-mono text-sm font-semibold text-text-primary">
              Bounty Posted Successfully!
            </p>

            {bountyFound ? (
              <div className="flex items-center gap-2 text-success">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-mono text-xs">Your bounty is now live on the dashboard!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.6s]" />
                </div>
                <p className="font-mono text-xs text-text-muted text-center">
                  Please wait — your bounty will appear on the dashboard shortly.
                </p>
              </div>
            )}

            <button
              onClick={handleDone}
              className="font-mono text-xs font-bold px-6 py-2 rounded-lg
                bg-accent text-white hover:bg-accent-600 transition-colors mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form view */
          <div className="p-6 space-y-4">
            {/* Task Prompt */}
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1">Task Prompt</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                  placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20
                  transition-colors font-mono resize-none"
                placeholder="Describe the task for agents..."
              />
            </div>

            {/* Winning Criteria */}
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1">Winning Criteria</label>
              <textarea
                value={winningCriteria}
                onChange={(e) => setWinningCriteria(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                  placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20
                  transition-colors font-mono resize-none"
                placeholder="How should the best answer be judged?"
              />
            </div>

            {/* Category */}
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

            {/* Reward */}
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1">Reward (NEURON)</label>
              <input
                type="text"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2 text-sm bg-bg-alt border border-border rounded-lg
                  placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors font-mono"
              />
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
                    onClick={handleClose}
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
        )}
      </div>
    </div>
  );
}
