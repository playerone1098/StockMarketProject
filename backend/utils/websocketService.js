let WebSocket;
try {
  WebSocket = require('ws');
} catch (e) {
  WebSocket = null;
}

/**
 * WebSocket Service for Real-Time Stock Price Broadcasting
 * 
 * This service manages a WebSocket server that pushes live stock price updates
 * to all connected frontend clients. Instead of the frontend polling REST APIs,
 * the backend pushes updates instantly when stock prices change.
 * 
 * Protocol:
 *   Client → Server:
 *     { type: 'subscribe', symbols: ['RELIANCE', 'TCS'] }
 *     { type: 'unsubscribe', symbols: ['TCS'] }
 *     { type: 'ping' }
 * 
 *   Server → Client:
 *     { type: 'price_update', data: { symbol, currentPrice, dayChange, dayChangePercent, ... } }
 *     { type: 'bulk_update', data: [{ symbol, currentPrice, ... }, ...] }
 *     { type: 'market_status', data: { isOpen, message } }
 *     { type: 'pong' }
 *     { type: 'connected', data: { clientId, message } }
 */

let wss = null;
let clientIdCounter = 0;
const clients = new Map(); // clientId -> { ws, subscribedSymbols: Set }

/**
 * Initialize the WebSocket server on the same HTTP server as Express.
 * @param {http.Server} server - The HTTP server instance from Express
 */
const initWebSocketServer = (server) => {
  if (!WebSocket) {
    console.warn('⚠️ WebSocket module ("ws") is not installed. WebSocket live server disabled; polling fallback active.');
    return null;
  }

  wss = new WebSocket.Server({ 
    server,
    path: '/ws/live',  // Dedicated path to avoid conflicts with REST routes
    perMessageDeflate: false // Disable compression for lower latency
  });

  console.log('🔌 WebSocket server initialized on /ws/live');

  wss.on('connection', (ws, req) => {
    const clientId = ++clientIdCounter;
    const clientInfo = {
      ws,
      subscribedSymbols: new Set(),
      connectedAt: new Date(),
      lastPing: Date.now()
    };
    clients.set(clientId, clientInfo);

    console.log(`🟢 WebSocket client #${clientId} connected (Total: ${clients.size})`);

    // Send welcome message
    sendToClient(ws, {
      type: 'connected',
      data: {
        clientId,
        message: 'Connected to JodhpurTraders Live Market Feed',
        serverTime: new Date().toISOString()
      }
    });

    // Handle incoming messages from client
    ws.on('message', (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        handleClientMessage(clientId, message);
      } catch (err) {
        sendToClient(ws, { type: 'error', data: { message: 'Invalid JSON message' } });
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`🔴 WebSocket client #${clientId} disconnected (Total: ${clients.size})`);
    });

    // Handle errors
    ws.on('error', (err) => {
      console.error(`❌ WebSocket client #${clientId} error:`, err.message);
      clients.delete(clientId);
    });
  });

  // Heartbeat: ping all clients every 30 seconds to detect stale connections
  setInterval(() => {
    clients.forEach((clientInfo, clientId) => {
      if (clientInfo.ws.readyState === WebSocket.OPEN) {
        clientInfo.ws.ping();
      } else {
        clients.delete(clientId);
      }
    });
  }, 30000);

  return wss;
};

/**
 * Handle messages from a connected client.
 */
const handleClientMessage = (clientId, message) => {
  const clientInfo = clients.get(clientId);
  if (!clientInfo) return;

  switch (message.type) {
    case 'subscribe':
      // Subscribe to specific stock symbols
      if (Array.isArray(message.symbols)) {
        message.symbols.forEach((sym) => {
          clientInfo.subscribedSymbols.add(sym.toUpperCase());
        });
        sendToClient(clientInfo.ws, {
          type: 'subscribed',
          data: { symbols: Array.from(clientInfo.subscribedSymbols) }
        });
      }
      break;

    case 'unsubscribe':
      // Unsubscribe from specific symbols
      if (Array.isArray(message.symbols)) {
        message.symbols.forEach((sym) => {
          clientInfo.subscribedSymbols.delete(sym.toUpperCase());
        });
        sendToClient(clientInfo.ws, {
          type: 'unsubscribed',
          data: { symbols: Array.from(clientInfo.subscribedSymbols) }
        });
      }
      break;

    case 'subscribe_all':
      // Subscribe to ALL stock updates (for ticker/dashboard views)
      clientInfo.subscribedSymbols.add('*');
      sendToClient(clientInfo.ws, {
        type: 'subscribed',
        data: { symbols: ['*'], message: 'Subscribed to all stock updates' }
      });
      break;

    case 'ping':
      clientInfo.lastPing = Date.now();
      sendToClient(clientInfo.ws, { type: 'pong', data: { serverTime: new Date().toISOString() } });
      break;

    default:
      sendToClient(clientInfo.ws, { type: 'error', data: { message: `Unknown message type: ${message.type}` } });
  }
};

/**
 * Send a JSON message to a single WebSocket client.
 */
const sendToClient = (ws, data) => {
  if (WebSocket && ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(data));
    } catch (err) {
      console.error('❌ Error sending WS message:', err.message);
    }
  }
};

/**
 * Broadcast a single stock price update to all relevant subscribers.
 * Called from stockSyncService after each stock is updated.
 * 
 * @param {Object} stockData - The updated stock data object
 */
const broadcastStockUpdate = (stockData) => {
  if (!WebSocket || !wss || clients.size === 0) return;

  const symbol = stockData.symbol?.toUpperCase();
  if (!symbol) return;

  const payload = {
    type: 'price_update',
    data: {
      symbol: stockData.symbol,
      currentPrice: stockData.currentPrice,
      dayChange: stockData.dayChange,
      dayChangePercent: stockData.dayChangePercent,
      dayHigh: stockData.dayHigh,
      dayLow: stockData.dayLow,
      volume: stockData.volume,
      weekHigh52: stockData.weekHigh52,
      weekLow52: stockData.weekLow52,
      peRatio: stockData.peRatio,
      marketCap: stockData.marketCap,
      timestamp: new Date().toISOString()
    }
  };

  const jsonPayload = JSON.stringify(payload);

  clients.forEach((clientInfo) => {
    if (!clientInfo.ws || clientInfo.ws.readyState !== WebSocket.OPEN) return;

    // Send if client subscribed to this specific symbol OR subscribed to all ('*')
    if (clientInfo.subscribedSymbols.has(symbol) || clientInfo.subscribedSymbols.has('*')) {
      try {
        clientInfo.ws.send(jsonPayload);
      } catch (err) {
        // Silently ignore send errors
      }
    }
  });
};

/**
 * Broadcast a bulk update of multiple stocks at once.
 * More efficient than sending individual updates when syncing many stocks.
 * 
 * @param {Array} stocksArray - Array of stock data objects
 */
const broadcastBulkUpdate = (stocksArray) => {
  if (!wss || clients.size === 0 || !Array.isArray(stocksArray) || stocksArray.length === 0) return;

  // For clients subscribed to '*', send everything
  const allPayload = JSON.stringify({
    type: 'bulk_update',
    data: stocksArray.map((s) => ({
      symbol: s.symbol,
      currentPrice: s.currentPrice,
      dayChange: s.dayChange,
      dayChangePercent: s.dayChangePercent,
      dayHigh: s.dayHigh,
      dayLow: s.dayLow,
      volume: s.volume,
      timestamp: new Date().toISOString()
    }))
  });

  clients.forEach((clientInfo) => {
    if (clientInfo.ws.readyState !== WebSocket.OPEN) return;

    if (clientInfo.subscribedSymbols.has('*')) {
      // Send all updates
      try {
        clientInfo.ws.send(allPayload);
      } catch (err) { /* ignore */ }
    } else if (clientInfo.subscribedSymbols.size > 0) {
      // Send only the stocks this client cares about
      const filtered = stocksArray.filter((s) =>
        clientInfo.subscribedSymbols.has(s.symbol?.toUpperCase())
      );
      if (filtered.length > 0) {
        try {
          clientInfo.ws.send(JSON.stringify({
            type: 'bulk_update',
            data: filtered.map((s) => ({
              symbol: s.symbol,
              currentPrice: s.currentPrice,
              dayChange: s.dayChange,
              dayChangePercent: s.dayChangePercent,
              dayHigh: s.dayHigh,
              dayLow: s.dayLow,
              volume: s.volume,
              timestamp: new Date().toISOString()
            }))
          }));
        } catch (err) { /* ignore */ }
      }
    }
  });
};

/**
 * Broadcast market status updates (market open/closed/pre-market).
 */
const broadcastMarketStatus = (statusData) => {
  if (!wss || clients.size === 0) return;

  const payload = JSON.stringify({
    type: 'market_status',
    data: statusData
  });

  clients.forEach((clientInfo) => {
    if (clientInfo.ws.readyState === WebSocket.OPEN) {
      try {
        clientInfo.ws.send(payload);
      } catch (err) { /* ignore */ }
    }
  });
};

/**
 * Get current WebSocket server statistics.
 */
const getWSStats = () => ({
  totalConnections: clients.size,
  activeSubscriptions: Array.from(clients.values()).reduce(
    (acc, c) => acc + c.subscribedSymbols.size, 0
  )
});

module.exports = {
  initWebSocketServer,
  broadcastStockUpdate,
  broadcastBulkUpdate,
  broadcastMarketStatus,
  getWSStats
};
