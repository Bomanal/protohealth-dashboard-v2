import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage, ConnectionStatus } from '@/types/inbound-monitor';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  /** Maximum reconnect attempts after an unexpected close (resets on successful open). */
  reconnectAttempts?: number;
  /** Initial reconnect delay in ms; doubles on each attempt up to maxReconnectDelay. */
  reconnectDelay?: number;
  maxReconnectDelay?: number;
}

export const useWebSocket = ({
  url,
  onMessage,
  onError,
  onOpen,
  onClose,
  reconnectAttempts = 10,
  reconnectDelay = 1000,
  maxReconnectDelay = 30000,
}: UseWebSocketOptions) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Keep callbacks/options in refs so `connect` stays stable across renders
  // (inline callbacks would otherwise recreate it and trigger a reconnect loop).
  const callbacksRef = useRef({ onMessage, onError, onOpen, onClose });
  callbacksRef.current = { onMessage, onError, onOpen, onClose };
  const optionsRef = useRef({ reconnectAttempts, reconnectDelay, maxReconnectDelay });
  optionsRef.current = { reconnectAttempts, reconnectDelay, maxReconnectDelay };

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const existing = wsRef.current;
    if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
      return;
    }
    clearReconnectTimer();

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      setConnectionStatus({ connected: false, reconnecting: false, error: 'Failed to connect' });
      return;
    }
    wsRef.current = ws;

    // Only the socket currently held in wsRef may update state or schedule reconnects.
    // A socket that was deliberately closed or replaced is ignored.
    const isCurrent = () => wsRef.current === ws;

    ws.onopen = () => {
      if (!isCurrent()) return;
      reconnectAttemptsRef.current = 0;
      setConnectionStatus({ connected: true, reconnecting: false });
      callbacksRef.current.onOpen?.();
    };

    ws.onmessage = (event) => {
      if (!isCurrent()) return;
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        callbacksRef.current.onMessage?.(data);
      } catch {
        // Do not log the payload; it may contain PHI
        console.warn('Ignoring malformed monitor message');
      }
    };

    ws.onerror = (error) => {
      if (!isCurrent()) return;
      setConnectionStatus(prev => ({ ...prev, error: 'Connection error' }));
      callbacksRef.current.onError?.(error);
    };

    ws.onclose = () => {
      if (!isCurrent()) return;
      wsRef.current = null;
      callbacksRef.current.onClose?.();

      const { reconnectAttempts: maxAttempts, reconnectDelay: baseDelay, maxReconnectDelay: maxDelay } = optionsRef.current;
      if (reconnectAttemptsRef.current < maxAttempts) {
        const attempt = reconnectAttemptsRef.current;
        reconnectAttemptsRef.current = attempt + 1;
        const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
        setConnectionStatus(prev => ({ ...prev, connected: false, reconnecting: true }));
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, delay);
      } else {
        setConnectionStatus({ connected: false, reconnecting: false, error: 'Unable to reach monitor' });
      }
    };
  }, [url, clearReconnectTimer]);

  const disconnect = useCallback(() => {
    clearReconnectTimer();
    const ws = wsRef.current;
    // Clear the ref first so the socket's onclose sees it is no longer current
    wsRef.current = null;
    ws?.close();
    setConnectionStatus({ connected: false, reconnecting: false });
  }, [clearReconnectTimer]);

  /** Manual reconnect (e.g. from a "Retry" button): resets the backoff counter. */
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    reconnectAttemptsRef.current = 0;
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    connect,
    disconnect,
    reconnect
  };
};
