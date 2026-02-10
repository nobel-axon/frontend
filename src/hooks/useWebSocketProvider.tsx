import { createContext, useContext, useState, useRef, useEffect } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { config } from '../config';
import type { WSEvent } from '../types';

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
  | 'personalities_assigned'
  | 'burn';

export interface FeedEvent {
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
  settleTxHash?: string;
  reason?: string;
  playerCount?: number;
  entryFee?: string;
}

interface WebSocketContextValue {
  isConnected: boolean;
  events: FeedEvent[];
}

const WebSocketContext = createContext<WebSocketContextValue>({
  isConnected: false,
  events: [],
});

const MAX_EVENTS = config.liveFeedMaxEvents;

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const wsRef = useRef<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    const url = config.wsUrl;
    if (!url) return;

    const ws = new ReconnectingWebSocket(url, [], {
      maxRetries: config.ws.maxRetries,
      connectionTimeout: config.ws.connectionTimeout,
    });

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => {};

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as WSEvent;
        const feedEvent = mapWSEventToFeedEvent(parsed);
        if (feedEvent) {
          setEvents((prev) => [feedEvent, ...prev].slice(0, MAX_EVENTS));
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext value={{ isConnected, events }}>
      {children}
    </WebSocketContext>
  );
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
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
        settleTxHash: data.settleTxHash as string | undefined,
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

    case 'personalities_assigned': {
      const personalities = data.personalities as Array<{ name: string }> | undefined;
      const names = Array.isArray(personalities)
        ? personalities.map((p) => p.name).join(', ')
        : '';
      return {
        id,
        type: 'personalities_assigned',
        timestamp: now,
        matchId: data.matchId as number,
        commentary: names,
      };
    }

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
