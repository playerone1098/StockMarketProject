-- PostgreSQL Schema for JodhpurTraders Stock Market Platform
-- Compatible with PostgreSQL 12+ and local offline environments

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(50) DEFAULT 'local',
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    profile JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{"theme": "dark", "notifications": true}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sectors (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stocks (
    id VARCHAR(100) PRIMARY KEY,
    symbol VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    exchange VARCHAR(20) DEFAULT 'NSE',
    current_price NUMERIC(14,2) DEFAULT 0,
    day_change NUMERIC(10,2) DEFAULT 0,
    day_change_percent NUMERIC(8,2) DEFAULT 0,
    week_high_52 NUMERIC(14,2) DEFAULT 0,
    week_low_52 NUMERIC(14,2) DEFAULT 0,
    market_cap NUMERIC(18,2) DEFAULT 0,
    market_cap_label VARCHAR(50) DEFAULT 'Large Cap',
    pe_ratio NUMERIC(10,2) DEFAULT 0,
    pb_ratio NUMERIC(10,2) DEFAULT 0,
    dividend_yield NUMERIC(8,2) DEFAULT 0,
    day_high NUMERIC(14,2) DEFAULT 0,
    day_low NUMERIC(14,2) DEFAULT 0,
    volume BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ipos (
    id VARCHAR(100) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    symbol VARCHAR(50),
    description TEXT,
    sector VARCHAR(100),
    price_range JSONB DEFAULT '{"min": 0, "max": 0}',
    lot_size INTEGER DEFAULT 1,
    issue_size VARCHAR(100),
    issue_type VARCHAR(100) DEFAULT 'Fresh Issue',
    open_date TIMESTAMP WITH TIME ZONE,
    close_date TIMESTAMP WITH TIME ZONE,
    listing_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'upcoming',
    registrar VARCHAR(255),
    gmp NUMERIC(10,2) DEFAULT 0,
    subscription_status JSONB DEFAULT '{"retail": 0, "nii": 0, "qib": 0, "total": 0}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',
    author VARCHAR(100) DEFAULT 'StockVista Editorial',
    read_time INTEGER DEFAULT 5,
    is_featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trading_ideas (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT,
    stock_symbol VARCHAR(50),
    stock_name VARCHAR(255),
    sector VARCHAR(100),
    idea_type VARCHAR(20) DEFAULT 'buy',
    entry_price NUMERIC(14,2) DEFAULT 0,
    target_price NUMERIC(14,2) DEFAULT 0,
    stop_loss NUMERIC(14,2) DEFAULT 0,
    time_horizon VARCHAR(50) DEFAULT 'short-term',
    risk_level VARCHAR(50) DEFAULT 'medium',
    tags JSONB DEFAULT '[]',
    author VARCHAR(100) DEFAULT 'Research Analyst',
    is_featured BOOLEAN DEFAULT FALSE,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolios (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'Main Portfolio',
    description TEXT,
    is_default BOOLEAN DEFAULT TRUE,
    holdings JSONB DEFAULT '[]',
    cash_balance NUMERIC(14,2) DEFAULT 100000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlists (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'My Watchlist',
    description TEXT,
    is_default BOOLEAN DEFAULT TRUE,
    items JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_posts (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    stock_symbol VARCHAR(50),
    sentiment VARCHAR(20) DEFAULT 'neutral',
    likes JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_comments (
    id VARCHAR(100) PRIMARY KEY,
    post_id VARCHAR(100) NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chart_analyses (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(50) NOT NULL,
    drawings JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS screener_presets (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100),
    name VARCHAR(100) NOT NULL,
    filters JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics (
    id VARCHAR(100) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otps (
    id VARCHAR(100) PRIMARY KEY,
    phone VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid query performance
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector);
CREATE INDEX IF NOT EXISTS idx_ipos_status ON ipos(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);
