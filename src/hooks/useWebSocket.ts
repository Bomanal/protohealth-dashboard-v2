import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage, ConnectionStatus } from '@/types/inbound-monitor';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export const useWebSocket = ({
  url,
  onMessage,
  onError,
  onOpen,
  onClose,
  reconnectAttempts = 10,
  reconnectDelay = 3000
}: UseWebSocketOptions) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to FlowManager monitor');
        setConnectionStatus({ connected: true, reconnecting: false });
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from FlowManager monitor');
        setConnectionStatus(prev => ({ ...prev, connected: false }));
        onClose?.();
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < reconnectAttempts) {
          setConnectionStatus(prev => ({ ...prev, reconnecting: true }));
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting in ${reconnectDelay/1000}s (attempt ${reconnectAttemptsRef.current})`);
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus(prev => ({ ...prev, error: 'Connection error' }));
        onError?.(error);
      };

    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setConnectionStatus(prev => ({ ...prev, error: 'Failed to connect' }));
    }
  }, [url, onMessage, onError, onOpen, onClose, reconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnectionStatus({ connected: false, reconnecting: false });
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    connect,
    disconnect
  };
};
