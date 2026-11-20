const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { newDb } = require('pg-mem');

let pool = null;
let activeEngine = 'none'; // 'postgres' or 'pg-mem'
let memDbInstance = null;

/**
 * Initializes the database connection and runs schema migrations.
 */
const initPostgres = async () => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Attempt 1: Connect to Real PostgreSQL instance
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://${process.env.PGUSER || 'postgres'}:${encodeURIComponent(process.env.PGPASSWORD || 'postgres')}@${process.env.PGHOST || '127.0.0.1'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'jodhpurtraders'}`;

  const realPool = new Pool({
    connectionString,
    connectionTimeoutMillis: 2000,
  });

  try {
    const client = await realPool.connect();
    console.log('✅ Connected to Real PostgreSQL server at', process.env.DATABASE_URL ? 'configured DATABASE_URL' : '127.0.0.1:5432');
    
    // Execute schema migrations
    await client.query(schemaSql);
    client.release();
    console.log('📊 PostgreSQL database schema & tables verified successfully.');
    
    pool = realPool;
    activeEngine = 'postgres';
    return { engine: 'postgres', pool };
  } catch (err) {
    console.warn(`⚠️ Could not connect to local PostgreSQL server (${err.message}).`);
    console.log('💡 Falling back to embedded in-memory PostgreSQL engine (pg-mem) for 100% offline development.');
    try {
      await realPool.end();
    } catch (_) {}

    // Attempt 2: Embedded In-Memory PostgreSQL (pg-mem)
    const memDb = newDb();
    
    // Register pg functions if needed
    memDb.public.registerFunction({
      name: 'version',
      returns: 'text',
      implementation: () => 'PostgreSQL 15.0 (pg-mem offline)',
    });

    // Execute schema against pg-mem
    memDb.public.none(schemaSql);
    console.log('📊 Embedded PostgreSQL schema & tables initialized in memory.');

    const adapter = memDb.adapters.createPg();
    pool = new adapter.Pool();
    memDbInstance = memDb;
    activeEngine = 'pg-mem';

    return { engine: 'pg-mem', pool };
  }
};

/**
 * Executes a SQL query with parameters against active PostgreSQL engine.
 */
const query = async (text, params = []) => {
  if (!pool) {
    await initPostgres();
  }
  return pool.query(text, params);
};

/**
 * Returns database status.
 */
const getStatus = () => {
  return {
    connected: pool !== null,
    engine: activeEngine,
  };
};

module.exports = {
  initPostgres,
  query,
  getPool: () => pool,
  getStatus,
};
