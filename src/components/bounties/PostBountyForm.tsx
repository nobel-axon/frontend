import { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, erc20Abi } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ScrambleText } from '../ScrambleText';
import { fetchBounties } from '../../services/api';
import { config } from '../../config';

const BOUNTY_ARENA_ABI = [
  {
    name: 'createBounty',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'question', type: 'string' },
      { name: 'minRating', type: 'int128' },
      { name: 'category', type: 'string' },
      { name: 'difficulty', type: 'uint8' },
      { name: 'duration', type: 'uint64' },
      { name: 'maxAgents', type: 'uint8' },
      { name: 'reward', type: 'uint256' },
      { name: 'baseAnswerFee', type: 'uint256' },
    ],
    outputs: [{ name: 'bountyId', type: 'uint256' }],
  },
] as const;

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bountyFound, setBountyFound] = useState(false);
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const bountyCountRef = useRef<number | null>(null);

  // --- NEURON allowance check ---
  const neuronAddress = config.neuronAddress as `0x${string}`;
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: neuronAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, config.bountyArenaAddress] : undefined,
    query: { enabled: !!address },
  });

  // --- Approve tx ---
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApprovePending,
    error: approveWriteError,
    reset: resetApprove,
  } = useWriteContract();
  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveSuccess,
  } = useWaitForTransactionReceipt({ hash: approveTxHash });

  // --- CreateBounty tx ---
  const {
    writeContract: writeCreate,
    data: createTxHash,
    isPending: isCreatePending,
    error: createWriteError,
    reset: resetCreate,
  } = useWriteContract();
  const {
    isLoading: isCreateConfirming,
    isSuccess: isCreateSuccess,
  } = useWaitForTransactionReceipt({ hash: createTxHash });

  // Refetch allowance after approval confirms
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  // Trigger success view when createBounty tx confirms
  const successTriggered = useRef(false);
  useEffect(() => {
    if (isCreateSuccess && !successTriggered.current) {
      successTriggered.current = true;
      setSuccess(true);
    }
  }, [isCreateSuccess]);

  // Poll for new bounty after successful post
  useEffect(() => {
    if (!success || bountyFound || !address) return;
    // Snapshot bounty count when success first triggers
    if (bountyCountRef.current === null) {
      fetchBounties({ creator: address, limit: 1 }).then((res) => {
        bountyCountRef.current = res.total;
      }).catch(() => {});
    }
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
    setError(null);
    setSuccess(false);
    setBountyFound(false);
    bountyCountRef.current = null;
    successTriggered.current = false;
    resetApprove();
    resetCreate();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  if (!open) return null;

  // Determine if allowance is sufficient
  let rewardWei: bigint;
  try {
    rewardWei = reward ? parseEther(reward) : 0n;
  } catch {
    rewardWei = 0n;
  }
  const needsApproval = allowance !== undefined && rewardWei > 0n && allowance < rewardWei;
  const canSubmit = question.trim() && reward && deadline && address && rewardWei > 0n;

  // Display error from either contract call
  const displayError = error
    || (approveWriteError ? (approveWriteError as Error).message : null)
    || (createWriteError ? (createWriteError as Error).message : null);

  function handleSubmit() {
    if (!canSubmit || !address) return;
    setError(null);

    if (needsApproval) {
      // Step 1: approve NEURON spending (reward + 1 NEURON baseAnswerFee buffer)
      const approveAmount = rewardWei + parseEther('1');
      writeApprove({
        address: neuronAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [config.bountyArenaAddress, approveAmount],
      });
      return;
    }

    // Step 2: create bounty on-chain
    const questionText = winningCriteria.trim()
      ? `${question.trim()}\n\nWinning Criteria: ${winningCriteria.trim()}`
      : question.trim();

    const durationSeconds = BigInt(Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000)));

    writeCreate({
      address: config.bountyArenaAddress,
      abi: BOUNTY_ARENA_ABI,
      functionName: 'createBounty',
      args: [
        questionText,
        BigInt(minRating),
        category,
        1,       // difficulty
        durationSeconds,
        parseInt(maxParticipants, 10) || 10,
        rewardWei,
        parseEther('1'), // baseAnswerFee: 1 NEURON
      ],
    });
  }

  // Button label state machine
  function getButtonLabel(): string {
    if (needsApproval) {
      if (isApprovePending) return 'Confirm in Wallet...';
      if (isApproveConfirming) return 'Approving...';
      return 'Approve NEURON';
    }
    if (isCreatePending) return 'Confirm in Wallet...';
    if (isCreateConfirming) return 'Confirming...';
    return 'Post Bounty';
  }

  const isButtonBusy = isApprovePending || isApproveConfirming || isCreatePending || isCreateConfirming;

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
          <div className="p-6 flex flex-col items-center gap-5 py-10 overflow-hidden">
            {/* Ring burst + icon container */}
            <div className="relative flex items-center justify-center w-20 h-20">
              {/* Concentric rings */}
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="absolute inset-0 rounded-full border-2 border-accent/60"
                  style={{
                    animation: `success-ring 800ms ease-out ${delay}ms both`,
                  }}
                />
              ))}
              {/* Checkmark icon */}
              <div
                className="relative w-14 h-14 rounded-full bg-accent/15 border-2 border-accent flex items-center justify-center"
                style={{
                  animation: 'success-icon-enter 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both, success-glow 2s ease-in-out 200ms infinite',
                }}
              >
                <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Title — scramble reveal */}
            <div style={{ animation: 'success-slide-up 400ms ease-out 400ms both' }}>
              <ScrambleText text="BOUNTY POSTED" delay={400} duration={600} className="font-mono text-sm font-bold tracking-widest" />
            </div>

            {/* Reward amount */}
            {reward && (
              <div
                className="font-mono text-2xl font-bold text-transparent bg-clip-text"
                style={{
                  animation: 'success-slide-up 400ms ease-out 600ms both',
                  backgroundImage: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-300), var(--color-accent))',
                  backgroundSize: '200% 100%',
                }}
              >
                {reward} NEURON
              </div>
            )}

            {/* Status — waiting or found */}
            <div style={{ animation: 'success-slide-up 400ms ease-out 800ms both' }}>
              {bountyFound ? (
                <div className="flex items-center gap-2 text-accent">
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
            </div>

            <button
              onClick={handleDone}
              className="font-mono text-xs font-bold px-6 py-2 rounded-lg
                bg-accent text-white hover:bg-accent-600 transition-colors mt-2 border-2 border-accent animate-border-pulse"
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
            {displayError && (
              <p className="font-mono text-xs text-red-400">{displayError}</p>
            )}

            {/* Approval success feedback */}
            {isApproveSuccess && !needsApproval && (
              <p className="font-mono text-xs text-success">NEURON approved — click Post Bounty to continue.</p>
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
                    disabled={!canSubmit || isButtonBusy}
                    className="font-mono text-xs font-bold px-4 py-2 rounded-lg
                      bg-accent text-white hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {getButtonLabel()}
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
