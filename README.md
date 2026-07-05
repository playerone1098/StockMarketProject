# StockVista — Stock Market & Finance Platform

A comprehensive MERN stack platform for stock market insights, trading ideas, IPO tracking, and finance education.

## Project Structure

```
StockVista/
├── backend/          # Node.js/Express REST API (Port 5000)
├── frontend/         # React public website (Port 3000)
├── admin/            # React admin panel (Port 3003)
├── RULES.md          # Project architecture rules
├── AI_CODING_RULES.md # AI agent coding guidelines
└── README.md         # This file
```

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Axios, React Helmet (SEO)
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Admin Panel**: React 18, Tailwind CSS, Recharts
- **Database**: MongoDB Atlas
- **Authentication**: JWT (admin-only)
- **Architecture**: Layered (Routes → Controllers → Services → Models)

## Features

### Public Website
- 📊 Market overview dashboard
- 💡 Trading ideas with buy/sell/hold signals
- 🏢 IPO tracker (upcoming, open, closed, listed)
- 📝 Finance blog (market analysis, education, news)
- 📈 Stock directory with sector filtering
- 🔍 Full-text search across all content
- 📱 Fully responsive design
- 🔒 SEO optimized with sitemaps and JSON-LD

### Admin Panel
- 📊 Analytics dashboard with KPIs
- 💡 Manage trading ideas (CRUD)
- 🏢 Manage IPOs (CRUD)
- 📝 Manage blog posts (CRUD)
- 📈 Manage stock data (CRUD)
- 🏷️ Manage market sectors
- 🔐 JWT-based admin authentication

### Backend API
- RESTful API with consistent response format
- Clean layered architecture (Routes → Controllers → Models)
- JWT authentication with admin authorization
- Full-text search with MongoDB text indexes
- Rate limiting, Helmet security, CORS
- Dynamic XML sitemap generation
- Analytics event tracking

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd StockVista

# Install backend dependencies
cd backend
cp .env.example .env    # Fill in your MongoDB URI and JWT secret
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install admin panel dependencies
cd ../admin
npm install
```

### Configuration

Create `.env` file in `backend/` using `.env.example` as template:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=<generate-a-strong-random-secret>
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Seed Data

```bash
cd backend

# Create admin user
npm run create-admin

# Seed sample data (sectors, stocks, trading ideas, IPOs, blogs)
npm run seed
```

### Start All Services

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start

# Terminal 3 — Admin Panel
cd admin && npm start
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3003
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

### Admin Login
- **Email**: admin@stockvista.com
- **Password**: admin1234 (change in production!)

## API Endpoints

| Resource | Base Path | Methods |
|----------|-----------|---------|
| Auth | `/api/auth` | POST login, GET me |
| Trading Ideas | `/api/trading-ideas` | Full CRUD |
| IPOs | `/api/ipos` | Full CRUD |
| Blog Posts | `/api/blogs` | Full CRUD |
| Stocks | `/api/stocks` | Full CRUD |
| Sectors | `/api/sectors` | GET, POST, DELETE |
| Market | `/api/market` | GET overview, stats |
| Analytics | `/api/analytics` | POST event, GET stats |
| Sitemap | `/sitemap.xml` | GET |

## Architecture

See [RULES.md](./RULES.md) for detailed architecture guidelines.

## Disclaimer

The information provided on StockVista is for educational and informational purposes only. It should not be considered as financial advice. Please consult a certified financial advisor before making investment decisions. Stock market investments are subject to market risks.

## License

Private — All rights reserved.
