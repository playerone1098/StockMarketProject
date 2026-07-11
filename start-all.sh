#!/bin/bash

# StockVista — Start All Services in separate Terminal windows

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting StockVista services..."

# Kill any existing processes on the service ports
for PORT in 5000 3000 3003; do
  PID=$(lsof -ti :$PORT 2>/dev/null)
  if [ -n "$PID" ]; then
    echo "⚠️  Killing existing process on port $PORT (PID: $PID)"
    kill -9 $PID 2>/dev/null
    sleep 0.5
  fi
done

# Terminal 1 — Backend API
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR/backend' && npm run dev\""

# Terminal 2 — Frontend
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR/frontend' && npm start\""

# Terminal 3 — Admin Panel
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR/admin' && npm start\""

echo "✅ Opened 3 Terminal windows:"
echo "   Backend API  → http://localhost:5000"
echo "   Frontend     → http://localhost:3000"
echo "   Admin Panel  → http://localhost:3003"
