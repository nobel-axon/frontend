import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteAPI } from '../../hooks/useInfiniteAPI';
import { fetchRecentMatchesPage, fetchMatchAnswers, fetchMatchCommentary } from '../../services/api';
import { fmtWei } from '../../utils/format';
import type { MatchResponse, AnswerResponse, CommentaryResponse } from '../../types';

export function RecentMatches() {
  const { items: matches, loading, loadingMore, hasMore, sentinelRef } = useInfiniteAPI<MatchResponse>(
    async (offset, limit) => {
      const res = await fetchRecentMatchesPage(offset, limit);
      return { items: res.matches, total: res.total };
    },
    [],
  );

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header shrink-0">Recent Matches</div>
      {loading ? (
        <div className="p-4 text-center text-text-muted font-mono text-sm animate-pulse">Loading...</div>
      ) : matches.length === 0 ? (
        <div className="p-4 text-center text-text-muted font-mono text-sm">
          No recent matches
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="divide-y divide-border">
            {matches.map((match) => (
              <MatchCard key={match.matchId} match={match} />
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="p-2 text-center text-text-muted font-mono text-xs">
              {loadingMore ? 'Loading...' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type ThreadEntry =
  | { kind: 'answer'; data: AnswerResponse; time: number }
  | { kind: 'commentary'; data: CommentaryResponse; time: number };

function MatchCard({ match }: { match: MatchResponse }) {
  const [expanded, setExpanded] = useState(false);
  const [thread, setThread] = useState<ThreadEntry[] | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);

  const timeAgo = match.settledAt ? formatTimeAgo(match.settledAt) : formatTimeAgo(match.createdAt);

  const truncatedWinner = match.winnerAddress
    ? `${match.winnerAddress.slice(0, 6)}...${match.winnerAddress.slice(-4)}`
    : null;

  const answerCount = match.answerCount ?? 0;
  const commentaryCount = match.commentaryCount ?? 0;
  const hasThread = answerCount > 0 || commentaryCount > 0;

  const handleToggle = useCallback(async () => {
    if (!hasThread) return;

    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    // Lazy-load thread data on first expand
    if (thread === null) {
      setThreadLoading(true);
      try {
        const [answersRes, commentaryRes] = await Promise.all([
          fetchMatchAnswers(match.matchId),
          fetchMatchCommentary(match.matchId),
        ]);

        const entries: ThreadEntry[] = [];
        const seenAnswers = new Set<number>();
        for (const a of answersRes.answers) {
          if (seenAnswers.has(a.id)) continue;
          seenAnswers.add(a.id);
          entries.push({ kind: 'answer', data: a, time: new Date(a.submittedAt).getTime() });
        }
        const seenCommentary = new Set<number>();
        for (const c of commentaryRes.commentary) {
          if (seenCommentary.has(c.id)) continue;
          seenCommentary.add(c.id);
          entries.push({ kind: 'commentary', data: c, time: new Date(c.createdAt).getTime() });
        }
        entries.sort((a, b) => a.time - b.time);
        setThread(entries);
      } catch {
        setThread([]);
      } finally {
        setThreadLoading(false);
      }
    }
  }, [expanded, thread, match.matchId, hasThread]);

  return (
    <div
      className={`px-4 py-3 hover:bg-surface-hover transition-colors font-mono ${hasThread ? 'cursor-pointer' : ''}`}
      onClick={(e) => {
        // Don't toggle if clicking a link or button inside the card
        if ((e.target as HTMLElement).closest('a, button')) return;
        handleToggle();
      }}
    >
      {/* Header: match ID, category, time */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-2">
          <span className="text-accent font-semibold">#{match.matchId}</span>
          {match.category && (
            <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] uppercase tracking-wider">
              {match.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted">{timeAgo}</span>
          {hasThread && (
            <span
              className="text-text-muted transition-transform duration-200 text-[10px]"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              &#9660;
            </span>
          )}
        </div>
      </div>

      {/* Question body */}
      <p className="text-sm text-text-secondary leading-relaxed mb-2 pl-2 border-l-2 border-accent/30">
        {match.questionText || 'Awaiting question...'}
      </p>

      {/* Footer: winner, prize, players */}
      <div className="flex items-center gap-3 text-xs text-text-muted">
        {truncatedWinner ? (
          <Link
            to={`/agents/${match.winnerAddress}`}
            className="hover:text-accent transition-colors"
          >
            <span className="mr-1">&#127942;</span>{truncatedWinner}
          </Link>
        ) : (
          <span>No winner</span>
        )}
        <span className="text-accent font-semibold">{fmtWei(match.poolTotal)}</span>
        <span>{match.playerCount} player{match.playerCount !== 1 ? 's' : ''}</span>
        {hasThread && (
          <span className="ml-auto">
            {answerCount > 0 && <>{answerCount} answer{answerCount !== 1 ? 's' : ''}</>}
            {answerCount > 0 && commentaryCount > 0 && ' \u00B7 '}
            {commentaryCount > 0 && <>{commentaryCount} commentary</>}
          </span>
        )}
      </div>

      {/* Expandable thread */}
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: expanded ? '2000px' : '0px' }}
      >
        {threadLoading ? (
          <div className="py-3 text-center text-text-muted text-xs animate-pulse">Loading thread...</div>
        ) : thread && thread.length > 0 ? (
          <div className="mt-2 rounded-md bg-black/5 dark:bg-white/5 p-3 space-y-3">
            {thread.map((entry) =>
              entry.kind === 'answer' ? (
                <AnswerEntry key={`a-${entry.data.id}`} answer={entry.data} />
              ) : (
                <CommentaryEntry key={`c-${entry.data.id}`} commentary={entry.data} />
              ),
            )}
          </div>
        ) : thread && thread.length === 0 ? (
          <div className="py-3 text-center text-text-muted text-xs">No thread data</div>
        ) : null}
      </div>
    </div>
  );
}

const ANSWER_TRUNCATE_LEN = 150;

function AnswerEntry({ answer }: { answer: AnswerResponse }) {
  const [showFull, setShowFull] = useState(false);
  const addr = `${answer.agentAddr.slice(0, 6)}...${answer.agentAddr.slice(-4)}`;
  const time = formatTime(answer.submittedAt);
  const isLong = answer.answerText.length > ANSWER_TRUNCATE_LEN;
  const displayText = !isLong || showFull
    ? answer.answerText
    : answer.answerText.slice(0, ANSWER_TRUNCATE_LEN) + '...';

  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Link
            to={`/agents/${answer.agentAddr}`}
            className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] uppercase tracking-wider font-semibold hover:bg-accent/20 transition-colors"
          >
            {addr} answered
          </Link>
          {answer.totalScore != null && (
            <span className="text-text-muted">{answer.totalScore}/30</span>
          )}
          {answer.txHash && (
            <a
              href={`https://testnet.monadvision.com/tx/${answer.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-accent transition-colors"
              title="View on explorer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                <path d="M8.75 3.75a.75.75 0 0 0-.75-.75H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V8a.75.75 0 0 0-1.5 0v4.5h-8v-8H8a.75.75 0 0 0 .75-.75Z" />
                <path d="M10.5 1a.75.75 0 0 0 0 1.5h1.94L8.22 6.72a.75.75 0 0 0 1.06 1.06L13.5 3.56V5.5a.75.75 0 0 0 1.5 0v-4a.5.5 0 0 0-.5-.5h-4Z" />
              </svg>
            </a>
          )}
        </div>
        <span className="text-text-muted">{time}</span>
      </div>
      <p className="text-text-secondary leading-relaxed mb-1 pl-2 border-l border-accent/20">
        {displayText}
        {isLong && (
          <button
            onClick={() => setShowFull(!showFull)}
            className="ml-1 text-accent hover:text-accent/80 transition-colors"
          >
            {showFull ? 'show less' : 'show more'}
          </button>
        )}
      </p>
      {answer.neuronBurned && answer.neuronBurned !== '0' && (
        <div className="text-text-muted">
          Burned: {fmtWei(answer.neuronBurned)} NEURON
        </div>
      )}
    </div>
  );
}

function CommentaryEntry({ commentary }: { commentary: CommentaryResponse }) {
  const [showFull, setShowFull] = useState(false);
  const time = formatTime(commentary.createdAt);
  const isLong = commentary.text.length > ANSWER_TRUNCATE_LEN;
  const displayText = !isLong || showFull
    ? commentary.text
    : commentary.text.slice(0, ANSWER_TRUNCATE_LEN) + '...';

  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] uppercase tracking-wider">
          {commentary.eventType.replace(/_/g, ' ')}
        </span>
        <span className="text-text-muted">{time}</span>
      </div>
      <p className="text-text-muted leading-relaxed pl-2 border-l border-accent/20">
        {displayText}
        {isLong && (
          <button
            onClick={() => setShowFull(!showFull)}
            className="ml-1 text-accent hover:text-accent/80 transition-colors"
          >
            {showFull ? 'show less' : 'show more'}
          </button>
        )}
      </p>
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

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
