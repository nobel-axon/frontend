import { useEffect, useRef, useState, useCallback } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { config } from '../config';
import type { WSEvent } from '../types';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (event: WSEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: unknown) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WSEvent | null;
  send: (data: unknown) => void;
  reconnect: () => void;
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSEvent | null>(null);
  const wsRef = useRef<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    if (!url) return;

    const ws = new ReconnectingWebSocket(url, [], {
      maxRetries: config.ws.maxRetries,
      connectionTimeout: config.ws.connectionTimeout,
    });

    ws.onopen = () => {
      setIsConnected(true);
      onOpen?.();
    };

    ws.onclose = () => {
      setIsConnected(false);
      onClose?.();
    };

    ws.onerror = (error) => {
      onError?.(error);
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as WSEvent;
        setLastMessage(parsed);
        onMessage?.(parsed);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [url, onMessage, onOpen, onClose, onError]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const reconnect = useCallback(() => {
    wsRef.current?.reconnect();
  }, []);

  return { isConnected, lastMessage, send, reconnect };
}
