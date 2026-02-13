import { useParams, Link } from 'react-router-dom';
import { useAPI } from '../../hooks/useAPI';
import { fetchBountyDetail } from '../../services/api';
import { fmtWei } from '../../utils/format';
import { config } from '../../config';
import { ScrambleText } from '../ScrambleText';
import { BountyStatusBadge } from './BountyStatusBadge';
import type { BountyAnswer } from '../../types';

export function BountyDetail() {
  const { id } = useParams<{ id: string }>();
  const bountyId = Number(id);
  const { data, loading, error } = useAPI(
    () => fetchBountyDetail(bountyId),
    [bountyId],
    { enabled: !isNaN(bountyId) },
  );

  const bounty = data?.bounty;
  const answers = data?.answers ?? [];

  return (
    <div className="space-y-6">
      <Link to="/bounties" className="font-mono text-xs text-text-muted hover:text-accent transition-colors">
        <ScrambleText text="&larr; BACK TO BOUNTIES" delay={0} duration={400} />
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
                <MetaCard label="Reward" value={`${fmtWei(bounty.rewardAmount)} NEURON`} delay={100} />
                <MetaCard label="Category" value={bounty.category} delay={140} />
                <MetaCard label="Min Rating" value={bounty.minRating} delay={180} />
                {bounty.baseAnswerFee && (
                  <MetaCard label="Answer Fee" value={`${fmtWei(bounty.baseAnswerFee)} NEURON`} delay={240} />
                )}
                <MetaCard label="Agents" value={String(bounty.agentCount)} delay={260} />
                <MetaCard label="Answers" value={String(bounty.answerCount)} delay={300} />
                <MetaCard label="Created" value={formatTimeAgo(bounty.createdAt)} delay={340} />
                {bounty.expiresAt && (
                  <MetaCard label="Expires" value={formatTimeAgo(bounty.expiresAt)} delay={380} />
                )}
              </div>

            </div>
          </div>

          {/* Answers */}
          <div className="panel">
            <div className="panel-header flex items-center justify-between">
              <ScrambleText text={`Answers (${answers.length})`} delay={400} duration={500} />
              {bounty.phase === 'settled' && (
                <span className="font-mono text-[10px] text-text-muted flex items-center gap-1.5">
                  {!bounty.winnerAddr ? (
                    'Reward split by score'
                  ) : bounty.winnerAddr ? (
                    <>
                      Won by{' '}
                      <Link to={`/agents/${bounty.winnerAddr}`} className="text-accent hover:underline">
                        {bounty.winnerAddr.slice(0, 6)}...{bounty.winnerAddr.slice(-4)}
                      </Link>
                    </>
                  ) : null}
                  {bounty.settleTxHash && (
                    <a
                      href={`${config.blockExplorerUrl}/tx/${bounty.settleTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent transition-colors"
                      title="View settlement tx"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 3H3v10h10v-3M9 3h4v4M9 7l4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  )}
                </span>
              )}
            </div>
            <div className="divide-y divide-border">
              {answers.length === 0 ? (
                <div className="p-4 text-center text-text-muted font-mono text-sm">
                  No answers submitted yet
                </div>
              ) : (
                answers.map((answer) => (
                  <AnswerRow
                    key={answer.id}
                    answer={answer}
                    isWinner={answer.agentAddr === bounty.winnerAddr}
                    isProportional={!bounty.winnerAddr}
                    totalScore={!bounty.winnerAddr
                      ? answers.reduce((sum, a) => sum + (a.totalScore ?? 0), 0)
                      : undefined
                    }
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

function MetaCard({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) {
  return (
    <div className="stat-card">
      <div className="font-mono text-xs text-text-muted uppercase tracking-wide mb-1">
        <ScrambleText text={label} delay={delay} duration={400} />
      </div>
      <div className="font-mono text-sm font-semibold text-accent">{value}</div>
    </div>
  );
}

function AnswerRow({ answer, isWinner, isProportional, totalScore }: {
  answer: BountyAnswer;
  isWinner: boolean;
  isProportional?: boolean;
  totalScore?: number;
}) {
  const truncAddr = `${answer.agentAddr.slice(0, 6)}...${answer.agentAddr.slice(-4)}`;
  const sharePercent = isProportional && totalScore && answer.totalScore != null
    ? Math.round((answer.totalScore / totalScore) * 100)
    : undefined;

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
          <span className="text-text-muted text-xs">Score: {answer.totalScore}</span>
        )}
        {sharePercent != null && (
          <span className="text-accent text-xs">{sharePercent}% share</span>
        )}
        {isWinner && !isProportional && (
          <span className="text-accent text-xs font-bold">WINNER</span>
        )}
        <span className="ml-auto text-text-muted text-xs">{formatTimeAgo(answer.submittedAt)}</span>
      </div>
      <p className="text-text-secondary text-xs line-clamp-3 leading-relaxed">{answer.answerText}</p>
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
