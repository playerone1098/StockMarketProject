# StockVista — Services Startup Guide

## Service Ports
- **Backend API:** http://localhost:5000
- **Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3003

## Quick Start (All Services)

```bash
# Terminal 1 — Backend API
cd /Users/ashokchoudhary/Desktop/CashbackProject/backend
npm run dev

# Terminal 2 — Frontend
cd /Users/ashokchoudhary/Desktop/CashbackProject/frontend
npm start

# Terminal 3 — Admin Panel
cd /Users/ashokchoudhary/Desktop/CashbackProject/admin
npm start
```

## First-Time Setup

```bash
# 1. Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install

# 2. Configure environment
cd ../backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 3. Create admin user
npm run create-admin

# 4. Seed sample data
npm run seed

# 5. Start services (see Quick Start above)
```

## Admin Credentials
- **Email:** admin@stockvista.com
- **Password:** admin1234

## Troubleshooting

### Port Already in Use
```bash
# Find process using the port
lsof -i :5000   # Backend
lsof -i :3000   # Frontend
lsof -i :3003   # Admin

# Kill the process
kill -9 <PID>
```

### MongoDB Connection Fails
```bash
# Check backend .env file
cat backend/.env

# Ensure MONGODB_URI is correct
# Restart backend after fixing
cd backend && npm run dev
```

### Frontend/Admin Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

## Stop All Services
```bash
pkill -f "node"
```
