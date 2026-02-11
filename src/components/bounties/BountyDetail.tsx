import { useParams, Link } from 'react-router-dom';
import { useAPI } from '../../hooks/useAPI';
import { fetchBountyDetail } from '../../services/api';
import { fmtWei } from '../../utils/format';
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
              <BountyStatusBadge phase={bounty.phase} />
            </div>
            <div className="p-6 space-y-4">
              <p className="font-mono text-base text-text leading-relaxed">{bounty.questionText}</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetaCard label="Reward" value={`${fmtWei(bounty.rewardAmount)} MON`} delay={100} />
                <MetaCard label="Category" value={bounty.category} delay={140} />
                <MetaCard label="Difficulty" value={`${bounty.difficulty}/5`} delay={180} />
                <MetaCard label="Min Rating" value={String(bounty.minRating)} delay={220} />
                <MetaCard label="Agents" value={String(bounty.agentCount)} delay={260} />
                <MetaCard label="Answers" value={String(bounty.answerCount)} delay={300} />
                <MetaCard label="Created" value={formatTimeAgo(bounty.createdAt)} delay={340} />
                <MetaCard label="Expires" value={formatTimeAgo(bounty.expiresAt)} delay={380} />
              </div>

              {bounty.winnerAddr && (
                <div className="mt-4 p-3 rounded-lg bg-success/5 border border-success/20">
                  <div className="font-mono text-xs text-text-muted mb-1">Winner</div>
                  <Link
                    to={`/agents/${bounty.winnerAddr}`}
                    className="font-mono text-sm font-bold text-success hover:underline"
                  >
                    {bounty.winnerAddr}
                  </Link>
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
                answers.map((answer, i) => (
                  <AnswerRow
                    key={answer.agentAddr + i}
                    answer={answer}
                    isWinner={answer.agentAddr === bounty.winnerAddr}
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

function AnswerRow({ answer, isWinner }: { answer: BountyAnswer; isWinner: boolean }) {
  const truncAddr = `${answer.agentAddr.slice(0, 6)}...${answer.agentAddr.slice(-4)}`;

  return (
    <div className={`px-4 py-3 font-mono text-sm hover:bg-surface-hover transition-colors ${isWinner ? 'bg-success/5' : ''}`}>
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
        {isWinner && (
          <span className="text-success text-xs font-bold">WINNER</span>
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
