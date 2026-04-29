/**
 * Database Configuration
 * SQLite with better-sqlite3, WAL mode for concurrency
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database file path - configurable via environment
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'devtools.db');
// In Docker (DB_PATH=/data/devtools.db), schema is at /app/database from volume mount
// When DB_PATH is default, schema is at ../../database from __dirname
const SCHEMA_PATH = process.env.DB_PATH
    ? path.join(path.dirname(process.env.DB_PATH), '..', 'app', 'database', 'schema.sql')
    : path.join(__dirname, '..', '..', 'database', 'schema.sql');
const SEED_PATH = process.env.DB_PATH
    ? path.join(path.dirname(process.env.DB_PATH), '..', 'app', 'database', 'seed.sql')
    : path.join(__dirname, '..', '..', 'database', 'seed.sql');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Initialize database connection with WAL mode
 */
function initDatabase() {
    const db = new Database(DB_PATH);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');
    db.pragma('busy_timeout = 5000');
    
    return db;
}

/**
 * Run schema.sql to create tables
 * Uses better-sqlite3 transaction for atomic table creation
 */
function createTables(db) {
    if (!fs.existsSync(SCHEMA_PATH)) {
        console.warn(`Schema file not found at ${SCHEMA_PATH}, skipping table creation`);
        return;
    }

    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

    try {
        db.exec(schema);
        console.log('Database tables created successfully');
    } catch (err) {
        console.error('Error creating tables:', err.message);
        throw err;
    }
}

/**
 * Run seed.sql to populate initial data
 */
function seedDatabase(db) {
    if (!fs.existsSync(SEED_PATH)) {
        console.warn(`Seed file not found at ${SEED_PATH}, skipping seed`);
        return;
    }

    // DEBUG: Log paths
    console.log(`[DEBUG] SEED_PATH resolved to: ${SEED_PATH}`);

    // Check if already seeded (table must exist first)
    let count;
    try {
        count = db.prepare('SELECT COUNT(*) as count FROM tool').get();
        console.log(`[DEBUG] Current tool count: ${count.count}`);
    } catch (err) {
        // Tables not created yet, skip seed
        console.warn('Tables not ready yet, skipping seed');
        return;
    }

    if (count.count > 0) {
        console.log('Database already seeded, skipping');
        return;
    }

    console.log('[DEBUG] Proceeding with seed...');
    const seed = fs.readFileSync(SEED_PATH, 'utf8');
    console.log(`[DEBUG] Seed file size: ${seed.length} bytes`);

    db.exec(seed);
    console.log('Database seeded with initial data');
}

// Initialize database instance
const db = initDatabase();
createTables(db);
seedDatabase(db);

// Export singleton instance
module.exports = db;
