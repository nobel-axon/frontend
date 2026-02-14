import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAPI } from '../../hooks/useAPI';
import { fetchBountyDetail } from '../../services/api';
import { fmtWei } from '../../utils/format';
import { config } from '../../config';
import { ScrambleText } from '../ScrambleText';
import { BountyStatusBadge } from './BountyStatusBadge';
import type { BountyAnswer, JudgeResult } from '../../types';

const BOUNTY_ARENA_ABI = [
  {
    name: 'pickWinner',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'bountyId', type: 'uint256' },
      { name: 'winner', type: 'address' },
    ],
    outputs: [],
  },
] as const;

export function BountyManageDetail() {
  const { id } = useParams<{ id: string }>();
  const bountyId = Number(id);
  const { address } = useAccount();
  const { data, loading, error, refetch } = useAPI(
    () => fetchBountyDetail(bountyId),
    [bountyId],
    { enabled: !isNaN(bountyId) },
  );

  const bounty = data?.bounty;
  const answers = data?.answers ?? [];

  const isCreator = bounty && address && bounty.creatorAddr.toLowerCase() === address.toLowerCase();
  const isExpired = bounty?.expiresAt ? new Date(bounty.expiresAt).getTime() < Date.now() : false;
  const canPickWinner = isCreator && bounty?.phase === 'active' && !isExpired && !bounty.winnerAddr;

  return (
    <div className="space-y-6">
      <Link to="/bounties/manage" className="font-mono text-xs text-text-muted hover:text-accent transition-colors">
        <ScrambleText text="&larr; BACK TO MANAGEMENT" delay={0} duration={400} />
      </Link>

      {loading ? (
        <div className="panel p-6 text-center text-text-muted font-mono text-sm animate-pulse">Loading bounty...</div>
      ) : error ? (
        <div className="panel p-6 text-center text-error font-mono text-sm">Failed to load bounty</div>
      ) : bounty ? (
        <>
          {/* Bounty Header */}
          <div className="panel">
            <div className="panel-header flex items-center justify-between">
              <ScrambleText text={`Bounty #${bounty.bountyId}`} delay={50} duration={500} />
              <BountyStatusBadge phase={bounty.phase} expiresAt={bounty.expiresAt} />
            </div>
            <div className="p-6 space-y-4">
              <p className="font-mono text-base text-text leading-relaxed">{bounty.questionText}</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetaCard label="Reward" value={`${fmtWei(bounty.rewardAmount)} NEURON`} />
                <MetaCard label="Category" value={bounty.category} />
                <MetaCard label="Agents" value={String(bounty.agentCount)} />
                <MetaCard label="Answers" value={String(bounty.answerCount)} />
                <MetaCard label="Min Rating" value={bounty.minRating} />
                {bounty.baseAnswerFee && (
                  <MetaCard label="Answer Fee" value={`${fmtWei(bounty.baseAnswerFee)} NEURON`} />
                )}
                <MetaCard label="Created" value={formatTimeAgo(bounty.createdAt)} />
                {bounty.expiresAt && (
                  <MetaCard label="Expires" value={formatTimeRemaining(bounty.expiresAt)} />
                )}
              </div>

              {canPickWinner && (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 font-mono text-xs text-accent">
                  You can pick a winner from the answers below. This will send the reward to the chosen agent.
                </div>
              )}

            </div>
          </div>

          {/* Answers */}
          <div className="panel">
            <div className="panel-header">
              <ScrambleText text={`Answers (${answers.length})`} delay={400} duration={500} />
            </div>
            <div className="divide-y divide-border">
              {answers.length === 0 ? (
                <div className="p-4 text-center text-text-muted font-mono text-sm">
                  No answers submitted yet
                </div>
              ) : (
                answers.map((answer) => (
                  <ManageAnswerRow
                    key={answer.id}
                    answer={answer}
                    bountyId={bounty.bountyId}
                    canPickWinner={!!canPickWinner}
                    isWinner={answer.agentAddr === bounty.winnerAddr}
                    settleTxHash={bounty.settleTxHash}
                    onSuccess={refetch}
                  />
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="panel p-6 text-center text-text-muted font-mono text-sm">Bounty not found</div>
      )}
    </div>
  );
}

const ANSWER_PREVIEW_LENGTH = 300;

function ManageAnswerRow({ answer, bountyId, canPickWinner, isWinner, settleTxHash, onSuccess }: {
  answer: BountyAnswer;
  bountyId: number;
  canPickWinner: boolean;
  isWinner: boolean;
  settleTxHash?: string;
  onSuccess: () => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showJudges, setShowJudges] = useState(false);
  const truncAddr = `${answer.agentAddr.slice(0, 6)}...${answer.agentAddr.slice(-4)}`;
  const isLong = answer.answerText.length > ANSWER_PREVIEW_LENGTH;

  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const refetched = useRef(false);

  useEffect(() => {
    if (isSuccess && !refetched.current) {
      refetched.current = true;
      const timer = setTimeout(onSuccess, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  const handlePickWinner = () => {
    writeContract({
      address: config.bountyArenaAddress,
      abi: BOUNTY_ARENA_ABI,
      functionName: 'pickWinner',
      args: [BigInt(bountyId), answer.agentAddr as `0x${string}`],
    });
    setShowConfirm(false);
  };

  const winnerAction = canPickWinner && !isWinner ? (
    isSuccess ? (
      <span className="text-success text-xs font-bold whitespace-nowrap">Winner picked!</span>
    ) : isConfirming ? (
      <span className="text-accent text-xs animate-pulse whitespace-nowrap">Confirming...</span>
    ) : isPending ? (
      <span className="text-accent text-xs animate-pulse whitespace-nowrap">Confirm in wallet...</span>
    ) : showConfirm ? (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handlePickWinner}
          className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded bg-accent text-white hover:bg-accent-600 transition-colors whitespace-nowrap"
        >
          Confirm
        </button>
        <button
          onClick={() => { setShowConfirm(false); reset(); }}
          className="font-mono text-[10px] px-2.5 py-0.5 rounded border border-border text-text-muted hover:text-text transition-colors whitespace-nowrap"
        >
          Cancel
        </button>
      </div>
    ) : (
      <button
        onClick={() => setShowConfirm(true)}
        className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded border border-accent text-accent hover:bg-accent hover:text-white transition-colors whitespace-nowrap"
      >
        Choose as Winner
      </button>
    )
  ) : null;

  const displayText = expanded || !isLong
    ? answer.answerText
    : answer.answerText.slice(0, ANSWER_PREVIEW_LENGTH) + '...';

  return (
    <div className={`px-4 py-3 font-mono text-sm hover:bg-surface-hover transition-colors ${isWinner ? 'bg-accent/5' : ''}`}>
      <div className="flex items-center gap-3 mb-1">
        <Link
          to={`/agents/${answer.agentAddr}`}
          className="text-accent hover:underline text-xs"
        >
          {truncAddr}
        </Link>
        {answer.totalScore != null && (
          <>
            <span className="text-text-muted text-xs">Score: {answer.totalScore} {answer.agreement ? `(${answer.agreement.replace(/_/g, ' ')})` : ''}</span>
            <button
              onClick={() => setShowJudges(true)}
              className="text-[10px] text-accent hover:underline cursor-pointer"
            >
              View judges
            </button>
          </>
        )}
        {isWinner && (
          <>
            <span className="text-accent text-xs font-bold">WINNER</span>
            {settleTxHash && (
              <a
                href={`${config.blockExplorerUrl}/tx/${settleTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-accent transition-colors"
              >
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 3H3v10h10v-3M9 3h4v4M9 7l4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </>
        )}
        <span className="ml-auto text-text-muted text-xs">{formatTimeAgo(answer.submittedAt)}</span>
        {winnerAction}
      </div>
      {writeError && (
        <p className="text-error text-[10px] mb-1">{writeError.message.slice(0, 80)}...</p>
      )}
      <p className="text-text-secondary text-xs leading-relaxed whitespace-pre-wrap">{displayText}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-accent text-[10px] hover:underline mt-1"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
      {answer.reasoning && (
        <p className="text-text-muted text-[10px] leading-relaxed mt-1 italic">Reasoning: {answer.reasoning}</p>
      )}

      {/* Judge Evaluations Modal */}
      {showJudges && (
        <JudgeEvaluationsModal
          evaluations={answer.evaluations}
          totalScore={answer.totalScore}
          agreement={answer.agreement}
          onClose={() => setShowJudges(false)}
        />
      )}
    </div>
  );
}

function JudgeEvaluationsModal({ evaluations, totalScore, agreement, onClose }: {
  evaluations?: JudgeResult[];
  totalScore?: number;
  agreement?: string;
  onClose: () => void;
}) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg panel animate-popup-scale-in max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-header flex items-center justify-between shrink-0">
          <ScrambleText text="Judge Evaluations" delay={0} duration={400} />
          <button
            onClick={onClose}
            className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            ESC
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Summary */}
          <div className="flex items-center gap-4 pb-3 border-b border-border">
            <div>
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-wide">Avg Score</div>
              <div className="font-mono text-lg font-semibold text-accent">{totalScore ?? '—'}<span className="text-text-muted text-xs font-normal"> / 30</span></div>
            </div>
            {agreement && (
              <div>
                <div className="font-mono text-[10px] text-text-muted uppercase tracking-wide">Consensus</div>
                <div className="font-mono text-sm font-semibold text-text-secondary">{agreement.replace(/_/g, ' ')}</div>
              </div>
            )}
            {evaluations && evaluations.length > 0 && (
              <div className="ml-auto text-right">
                <div className="font-mono text-[10px] text-text-muted uppercase tracking-wide">Panel</div>
                <div className="font-mono text-sm font-semibold text-text-secondary">{evaluations.length} judges</div>
              </div>
            )}
          </div>

          {/* Per-judge rows */}
          {evaluations && evaluations.length > 0 ? (
            evaluations.map((jr, ji) => (
              <div key={ji} className="rounded-lg border border-border overflow-hidden">
                {/* Judge header row */}
                <div className="flex items-center gap-3 px-3 py-2 bg-bg-alt">
                  <span className="font-mono text-xs font-semibold text-text">Judge {ji + 1}</span>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${Math.round((jr.totalScore / 30) * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-accent">{jr.totalScore}</span>
                </div>

                {/* Compact personality rows */}
                {jr.evaluations?.map((ev, ei) => {
                  const key = `${ji}-${ei}`;
                  const isExpanded = expandedCard === key;
                  return (
                    <div key={ei} className="border-t border-border">
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : key)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-hover transition-colors text-left"
                      >
                        <span className="font-mono text-[11px] text-text flex-1">{ev.personalityName || `Personality ${ei + 1}`}</span>
                        {ev.agreeLevel && (
                          <span className={`font-mono text-[9px] px-1 py-0.5 rounded ${
                            ev.agreeLevel === 'strongly_agree' || ev.agreeLevel === 'agree'
                              ? 'bg-success/10 text-success'
                              : ev.agreeLevel === 'disagree' || ev.agreeLevel === 'strongly_disagree'
                              ? 'bg-red-400/10 text-red-400'
                              : 'bg-yellow-400/10 text-yellow-600'
                          }`}>
                            {ev.agreeLevel.replace(/_/g, ' ')}
                          </span>
                        )}
                        <span className="font-mono text-xs font-bold text-accent w-5 text-right">{ev.score}</span>
                        <svg className={`w-3 h-3 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-2 space-y-1.5">
                          {ev.verdict && (
                            <p className="font-mono text-[10px] text-text-secondary leading-relaxed">{ev.verdict}</p>
                          )}
                          {ev.convinced && (
                            <p className="font-mono text-[10px] text-text-muted leading-relaxed"><span className="text-success">+</span> {ev.convinced}</p>
                          )}
                          {ev.concerns && (
                            <p className="font-mono text-[10px] text-text-muted leading-relaxed"><span className="text-red-400">-</span> {ev.concerns}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <p className="font-mono text-xs text-text-muted text-center py-4">No detailed evaluations available</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="font-mono text-xs text-text-muted uppercase tracking-wide mb-1">
        <ScrambleText text={label} delay={0} duration={400} />
      </div>
      <div className="font-mono text-sm font-semibold text-accent">{value}</div>
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

function formatTimeRemaining(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
