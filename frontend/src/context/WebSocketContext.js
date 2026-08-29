import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

const WebSocketContext = createContext({
  isConnected: false,
  stockUpdates: {},
  subscribeSymbols: () => {},
  unsubscribeSymbols: () => {},
  subscribeAll: () => {}
});

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [stockUpdates, setStockUpdates] = useState({});
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const subscribedSymbolsRef = useRef(new Set());
  const isAllSubscribedRef = useRef(false);

  const getWsUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    // In dev mode, backend runs on port 5000 unless proxied
    const port = process.env.NODE_ENV === 'development' ? '5000' : window.location.port;
    return `${protocol}//${host}${port ? `:${port}` : ''}/ws/live`;
  };

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = getWsUrl();
      console.log('🔌 Connecting to JodhpurTraders Live WebSocket at:', url);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('✅ Connected to JodhpurTraders Live Market WebSocket');
        setIsConnected(true);

        // Resubscribe symbols after reconnection
        if (isAllSubscribedRef.current) {
          ws.send(JSON.stringify({ type: 'subscribe_all' }));
        } else if (subscribedSymbolsRef.current.size > 0) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            symbols: Array.from(subscribedSymbolsRef.current)
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'price_update' && message.data) {
            setStockUpdates((prev) => ({
              ...prev,
              [message.data.symbol.toUpperCase()]: {
                ...message.data,
                updatedAt: new Date()
              }
            }));
          } else if (message.type === 'bulk_update' && Array.isArray(message.data)) {
            setStockUpdates((prev) => {
              const next = { ...prev };
              message.data.forEach((s) => {
                next[s.symbol.toUpperCase()] = {
                  ...s,
                  updatedAt: new Date()
                };
              });
              return next;
            });
          }
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      ws.onclose = () => {
        console.warn('🔴 WebSocket connection closed. Scheduling reconnect in 3s...');
        setIsConnected(false);
        wsRef.current = null;
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('❌ WebSocket error:', err);
        ws.close();
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to initiate WebSocket connection:', err);
      reconnectTimerRef.current = setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const subscribeSymbols = useCallback((symbols = []) => {
    symbols.forEach((s) => subscribedSymbolsRef.current.add(s.toUpperCase()));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        symbols: symbols.map((s) => s.toUpperCase())
      }));
    }
  }, []);

  const unsubscribeSymbols = useCallback((symbols = []) => {
    symbols.forEach((s) => subscribedSymbolsRef.current.delete(s.toUpperCase()));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        symbols: symbols.map((s) => s.toUpperCase())
      }));
    }
  }, []);

  const subscribeAll = useCallback(() => {
    isAllSubscribedRef.current = true;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe_all' }));
    }
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        stockUpdates,
        subscribeSymbols,
        unsubscribeSymbols,
        subscribeAll
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
