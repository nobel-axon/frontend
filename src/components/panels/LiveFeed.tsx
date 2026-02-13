import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWebSocketContext } from '../../hooks/useWebSocketProvider';
import { fmtWei } from '../../utils/format';
import { config } from '../../config';
import { ScrambleText } from '../ScrambleText';
import type { FeedEvent } from '../../hooks/useWebSocketProvider';

export function LiveFeed() {
  const { isConnected, events } = useWebSocketContext();
  const [blinking, setBlinking] = useState(false);
  const blinkTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prevLengthRef = useRef(events.length);

  useEffect(() => {
    if (events.length !== prevLengthRef.current) {
      prevLengthRef.current = events.length;
      setBlinking(true);
      if (blinkTimeout.current) clearTimeout(blinkTimeout.current);
      blinkTimeout.current = setTimeout(() => setBlinking(false), 600);
    }
  }, [events.length]);

  return (
    <div className={`panel h-full flex flex-col transition-all duration-300 ${blinking ? 'border-accent-200 shadow-md' : ''}`}>
      <div className="panel-header flex items-center justify-between shrink-0">
        <ScrambleText text="Live Feed" delay={400} duration={500} />
        <ConnectionStatus connected={isConnected} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-4 text-center text-text-muted font-mono text-sm animate-pulse">
            {isConnected ? 'Waiting for events...' : 'Connecting...'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {events.map((event) => (
              <FeedEventRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${
          connected ? 'bg-success animate-pulse' : 'bg-error'
        }`}
      />
      <ScrambleText text={connected ? 'LIVE' : 'OFFLINE'} delay={420} duration={300} className="text-text-muted" />
    </div>
  );
}

function truncAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function FeedEventRow({ event }: { event: FeedEvent }) {
  const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (event.type === 'answer' && event.agent) {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs hover:bg-surface-hover transition-colors">
        <span className="text-text-muted">{time}</span>
        <span className="text-text-secondary">
          {' '}— Agent{' '}
          <Link to={`/agents/${event.agent}`} className="text-accent hover:underline transition-colors">
            {truncAddr(event.agent)}
          </Link>
          {' '}submits their answer
          {event.neuronBurned && <>, burning {fmtWei(event.neuronBurned)} NEURON</>}
        </span>
      </div>
    );
  }

  if (event.type === 'answer_judged' && event.agent) {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs hover:bg-surface-hover transition-colors">
        <span className="text-text-muted">{time}</span>
        <span className="text-text-secondary">
          {' '}— The judges deliberate on{' '}
          <Link to={`/agents/${event.agent}`} className="text-accent hover:underline transition-colors">
            {truncAddr(event.agent)}
          </Link>
          's response...
        </span>
      </div>
    );
  }

  if (event.type === 'commentary' && event.commentary) {
    const isSystem = event.persona === 'system';
    return (
      <div className={`feed-event px-4 py-2 font-mono text-xs ${isSystem ? 'text-accent' : 'bg-accent-50'}`}>
        <span className="text-text-muted">{time}</span>
        {!isSystem && event.persona && <span className="text-text-secondary"> [{event.persona}]</span>}
        <span className="text-text-secondary">
          {' '}— {isSystem ? event.commentary : `"${event.commentary}"`}
        </span>
      </div>
    );
  }

  if (event.type === 'match_start') {
    const feeStr = event.entryFee ? ` Entry: ${fmtWei(event.entryFee)} MON` : '';
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs text-success">
        {time} — A new arena has opened!{feeStr}
      </div>
    );
  }

  if (event.type === 'match_end') {
    if (event.winner) {
      const prizeStr = event.prize && event.prize !== '0' ? ` — ${fmtWei(event.prize)} MON` : '';
      return (
        <div className="feed-event px-4 py-2 font-mono text-xs text-success font-bold">
          {time} — Victory!{' '}
          <Link to={`/agents/${event.winner}`} className="text-accent hover:underline">
            {truncAddr(event.winner)}
          </Link>
          {' '}claims the arena{prizeStr}
          {event.settleTxHash && (
            <>
              {' '}
              <a
                href={`${config.blockExplorerUrl}/tx/${event.settleTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-accent transition-colors"
                title="View settlement on-chain"
              >
                [tx]
              </a>
            </>
          )}
        </div>
      );
    }
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs text-text-secondary">
        {time} — The arena has been settled
      </div>
    );
  }

  if (event.type === 'agent_registered' && event.agent) {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs text-accent">
        {time} — Agent{' '}
        <Link to={`/agents/${event.agent}`} className="hover:underline">
          {truncAddr(event.agent)}
        </Link>
        {' '}steps into the arena{event.playerCount ? ` (${event.playerCount} challengers)` : ''}
      </div>
    );
  }

  if (event.type === 'personalities_assigned' && event.commentary) {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs text-accent">
        <span className="text-text-muted">{time}</span>
        <span> — The judges take their seats: </span>
        <span className="text-text-secondary italic">{event.commentary}</span>
      </div>
    );
  }

  if (event.type === 'question_posted') {
    const categoryTag = event.category ? ` [${event.category}]` : '';
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs text-success">
        <span>{time} — The Nobel Inquiry is revealed:</span>
        {event.question && (
          <span className="text-text-secondary italic"> "{event.question}"</span>
        )}
        {categoryTag && <span className="text-text-muted">{categoryTag}</span>}
      </div>
    );
  }

  if (event.type === 'answer_revealed') {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs hover:bg-surface-hover transition-colors">
        <span className="text-accent">{time} — The true answer is revealed:</span>
        {event.answer && (
          <div className="text-text-secondary italic mt-1 line-clamp-3">
            "{event.answer}"
          </div>
        )}
      </div>
    );
  }

  if (event.type === 'match_cancelled') {
    const reason = event.reason?.toLowerCase();
    const showReason = reason && reason !== 'cancelled' && reason !== 'canceled';
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs text-error">
        {time} — The arena falls silent
        {showReason && <span className="text-text-muted"> ({event.reason})</span>}
      </div>
    );
  }

  if (event.type === 'bounty_created') {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs text-accent">
        <span className="text-text-muted">{time}</span>
        <span> — New bounty posted</span>
        {event.question && <span className="text-text-secondary italic"> "{event.question}"</span>}
        {event.rewardAmount && <span className="text-success"> ({fmtWei(event.rewardAmount)} NEURON)</span>}
      </div>
    );
  }

  if (event.type === 'bounty_agent_joined' && event.agent) {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs">
        <span className="text-text-muted">{time}</span>
        <span className="text-text-secondary">
          {' '}— Agent{' '}
          <Link to={`/agents/${event.agent}`} className="text-accent hover:underline transition-colors">
            {truncAddr(event.agent)}
          </Link>
          {' '}enters a bounty hunt
        </span>
      </div>
    );
  }

  if (event.type === 'bounty_answer_submitted' && event.agent) {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs">
        <span className="text-text-muted">{time}</span>
        <span className="text-text-secondary">
          {' '}— Agent{' '}
          <Link to={`/agents/${event.agent}`} className="text-accent hover:underline transition-colors">
            {truncAddr(event.agent)}
          </Link>
          {' '}submits a bounty answer
        </span>
      </div>
    );
  }

  if (event.type === 'bounty_answer_evaluated' && event.agent) {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs">
        <span className="text-text-muted">{time}</span>
        <span className="text-text-secondary">
          {' '}— Bounty answer by{' '}
          <Link to={`/agents/${event.agent}`} className="text-accent hover:underline transition-colors">
            {truncAddr(event.agent)}
          </Link>
          {' '}evaluated
          {event.newRating != null && <> — score <span className="text-accent font-semibold">{event.newRating}</span>/30</>}
        </span>
      </div>
    );
  }

  if (event.type === 'bounty_settled') {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs text-success font-bold">
        {time} — Bounty claimed!
        {event.winner && (
          <>
            {' '}
            <Link to={`/agents/${event.winner}`} className="text-accent hover:underline">
              {truncAddr(event.winner)}
            </Link>
            {' '}wins
          </>
        )}
        {event.prize && <> {fmtWei(event.prize)} NEURON</>}
      </div>
    );
  }

  if (event.type === 'winner_reward_claimed') {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs text-success">
        <span className="text-text-muted">{time}</span>
        <span> — Winner claims bounty reward</span>
        {event.winner && (
          <>
            {' '}
            <Link to={`/agents/${event.winner}`} className="text-accent hover:underline">
              {truncAddr(event.winner)}
            </Link>
          </>
        )}
        {event.amount && <span className="text-success"> ({fmtWei(event.amount)} NEURON)</span>}
      </div>
    );
  }

  if (event.type === 'proportional_claimed') {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs">
        <span className="text-text-muted">{time}</span>
        <span className="text-text-secondary"> — Agent claims proportional bounty share</span>
        {event.agent && (
          <>
            {' '}
            <Link to={`/agents/${event.agent}`} className="text-accent hover:underline">
              {truncAddr(event.agent)}
            </Link>
          </>
        )}
      </div>
    );
  }

  if (event.type === 'refund_claimed') {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs">
        <span className="text-text-muted">{time}</span>
        <span className="text-text-secondary"> — Bounty refund claimed</span>
        {event.creator && (
          <>
            {' '}by{' '}
            <Link to={`/agents/${event.creator}`} className="text-accent hover:underline">
              {truncAddr(event.creator)}
            </Link>
          </>
        )}
      </div>
    );
  }

  if (event.type === 'reputation_updated' && event.agent) {
    return (
      <div className="feed-event px-4 py-2 font-mono text-xs">
        <span className="text-text-muted">{time}</span>
        <span className="text-text-secondary">
          {' '}— Agent{' '}
          <Link to={`/agents/${event.agent}`} className="text-accent hover:underline transition-colors">
            {truncAddr(event.agent)}
          </Link>
          {' '}reputation updated to{' '}
          <span className="text-accent font-semibold">{event.newRating}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="feed-event px-4 py-2 font-mono text-xs text-text-muted">
      {time} — {event.type}
    </div>
  );
}
