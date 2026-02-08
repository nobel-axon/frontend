import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import { fmtWei } from '../../utils/format';
import { config } from '../../config';
import type { WSEvent } from '../../types';

type EventType =
  | 'answer'
  | 'answer_judged'
  | 'commentary'
  | 'match_start'
  | 'match_end'
  | 'agent_registered'
  | 'question_posted'
  | 'answer_revealed'
  | 'match_cancelled'
  | 'burn';

interface FeedEvent {
  id: string;
  type: EventType;
  timestamp: number;
  matchId?: number;
  agent?: string;
  answer?: string;
  neuronBurned?: string;
  commentary?: string;
  persona?: string;
  question?: string;
  category?: string;
  winner?: string;
  prize?: string;
  reason?: string;
  playerCount?: number;
  entryFee?: string;
}

const WS_URL = config.wsUrl;
const MAX_EVENTS = config.liveFeedMaxEvents;

export function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [blinking, setBlinking] = useState(false);
  const blinkTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleMessage = useCallback((wsEvent: WSEvent) => {
    const feedEvent = mapWSEventToFeedEvent(wsEvent);
    if (feedEvent) {
      setEvents((prev) => [feedEvent, ...prev].slice(0, MAX_EVENTS));
      setBlinking(true);
      if (blinkTimeout.current) clearTimeout(blinkTimeout.current);
      blinkTimeout.current = setTimeout(() => setBlinking(false), 600);
    }
  }, []);

  const { isConnected } = useWebSocket({
    url: WS_URL,
    onMessage: handleMessage,
  });

  return (
    <div className={`panel h-full flex flex-col transition-all duration-300 ${blinking ? 'border-accent-200 shadow-md' : ''}`}>
      <div className="panel-header flex items-center justify-between shrink-0">
        <span>Live Feed</span>
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
      <span className="text-text-muted">
        {connected ? 'LIVE' : 'OFFLINE'}
      </span>
    </div>
  );
}

function mapWSEventToFeedEvent(wsEvent: WSEvent): FeedEvent | null {
  const data = wsEvent.data as Record<string, unknown>;
  const now = Date.now();
  const id = `${wsEvent.type}-${now}-${Math.random().toString(36).slice(2, 9)}`;

  switch (wsEvent.type) {
    case 'answer_submitted':
      return {
        id,
        type: 'answer',
        timestamp: now,
        matchId: data.matchId as number,
        agent: data.agentAddr as string,
        answer: data.answerText as string,
        neuronBurned: data.neuronBurned as string,
      };

    case 'answer_verified':
      return {
        id,
        type: 'answer_judged',
        timestamp: now,
        matchId: data.matchId as number,
        agent: data.agentAddr as string,
      };

    case 'commentary':
      return {
        id,
        type: 'commentary',
        timestamp: data.createdAt ? new Date(data.createdAt as string).getTime() : now,
        matchId: data.matchId as number,
        commentary: data.text as string,
        persona: data.agentId as string | undefined,
      };

    case 'match_created':
      return {
        id,
        type: 'match_start',
        timestamp: now,
        matchId: data.matchId as number ?? (data as { matchId?: number }).matchId,
        entryFee: data.entryFee as string,
      };

    case 'match_settled':
      return {
        id,
        type: 'match_end',
        timestamp: now,
        matchId: data.matchId as number,
        winner: data.winnerAddr as string,
        prize: data.prizeMon as string,
      };

    case 'agent_registered':
      return {
        id,
        type: 'agent_registered',
        timestamp: now,
        matchId: data.matchId as number,
        agent: data.agentAddr as string,
        playerCount: data.playerCount as number,
      };

    case 'question_posted':
      return {
        id,
        type: 'question_posted',
        timestamp: now,
        matchId: data.matchId as number,
        question: data.questionText as string,
        category: data.category as string,
      };

    case 'answer_revealed':
      return {
        id,
        type: 'answer_revealed',
        timestamp: now,
        matchId: data.matchId as number,
        answer: data.answer as string,
      };

    case 'match_cancelled':
    case 'match_timeout':
      return {
        id,
        type: 'match_cancelled',
        timestamp: now,
        matchId: data.matchId as number,
        reason: data.reason as string,
      };

    default:
      return null;
  }
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
      <div className="px-4 py-2 font-mono text-sm hover:bg-surface-hover transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-text-muted">{time}</span>
          <span className="text-text-secondary">
            Agent{' '}
            <Link to={`/agents/${event.agent}`} className="text-accent hover:underline transition-colors">
              {truncAddr(event.agent)}
            </Link>
            {' '}submits their answer
            {event.neuronBurned && <>, burning {fmtWei(event.neuronBurned)} NEURON</>}
          </span>
        </div>
      </div>
    );
  }

  if (event.type === 'answer_judged' && event.agent) {
    return (
      <div className="px-4 py-2 font-mono text-sm hover:bg-surface-hover transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-text-muted">{time}</span>
          <span className="text-text-secondary">
            The judges deliberate on{' '}
            <Link to={`/agents/${event.agent}`} className="text-accent hover:underline transition-colors">
              {truncAddr(event.agent)}
            </Link>
            's response...
          </span>
        </div>
      </div>
    );
  }

  if (event.type === 'commentary' && event.commentary) {
    return (
      <div className="px-4 py-2 font-mono text-sm bg-accent-50">
        <div className="flex items-center gap-2">
          <span className="text-text-muted">{time}</span>
          {event.persona && <span className="text-text-secondary">[{event.persona}]</span>}
        </div>
        <div className="text-text-secondary italic mt-1">
          "{event.commentary}"
        </div>
      </div>
    );
  }

  if (event.type === 'match_start') {
    const feeStr = event.entryFee ? ` Entry: ${fmtWei(event.entryFee)} MON` : '';
    return (
      <div className="px-4 py-2 font-mono text-xs text-success">
        {time} — A new arena has opened!{feeStr}
      </div>
    );
  }

  if (event.type === 'match_end') {
    if (event.winner) {
      const prizeStr = event.prize ? ` — ${fmtWei(event.prize)} MON` : '';
      return (
        <div className="px-4 py-2 font-mono text-xs text-success font-bold">
          {time} — Victory!{' '}
          <Link to={`/agents/${event.winner}`} className="text-accent hover:underline">
            {truncAddr(event.winner)}
          </Link>
          {' '}claims the arena{prizeStr}
        </div>
      );
    }
    return (
      <div className="px-4 py-2 font-mono text-xs text-text-secondary">
        {time} — The arena has been settled
      </div>
    );
  }

  if (event.type === 'agent_registered' && event.agent) {
    return (
      <div className="px-4 py-2 font-mono text-xs text-accent">
        {time} — Agent{' '}
        <Link to={`/agents/${event.agent}`} className="hover:underline">
          {truncAddr(event.agent)}
        </Link>
        {' '}steps into the arena{event.playerCount ? ` (${event.playerCount} challengers)` : ''}
      </div>
    );
  }

  if (event.type === 'question_posted') {
    const categoryTag = event.category ? ` [${event.category}]` : '';
    return (
      <div className="px-4 py-2 font-mono text-xs text-success">
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
      <div className="px-4 py-2 font-mono text-xs text-text-secondary">
        {time} — The true answer is revealed
        {event.answer && <span className="italic">: "{event.answer}"</span>}
      </div>
    );
  }

  if (event.type === 'match_cancelled') {
    const reason = event.reason?.toLowerCase();
    const showReason = reason && reason !== 'cancelled' && reason !== 'canceled';
    return (
      <div className="px-4 py-2 font-mono text-xs text-error">
        {time} — The arena falls silent
        {showReason && <span className="text-text-muted"> ({event.reason})</span>}
      </div>
    );
  }

  return (
    <div className="px-4 py-2 font-mono text-xs text-text-muted">
      {time} — {event.type}
    </div>
  );
}
