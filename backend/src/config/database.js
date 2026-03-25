/**
 * Database Configuration
 * SQLite with better-sqlite3, WAL mode for concurrency
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { DB_PATH } = require('./paths');
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'database', 'schema.sql');
const SEED_PATH = path.join(__dirname, '..', '..', 'database', 'seed.sql');

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
 */
function createTables(db) {
    if (!fs.existsSync(SCHEMA_PATH)) {
        console.warn(`Schema file not found at ${SCHEMA_PATH}, skipping table creation`);
        return;
    }
    
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
    console.log('Database tables created/verified');
}

/**
 * Run seed.sql to populate initial data
 */
function seedDatabase(db) {
    if (!fs.existsSync(SEED_PATH)) {
        console.warn(`Seed file not found at ${SEED_PATH}, skipping seed`);
        return;
    }
    
    // Check if already seeded
    const count = db.prepare('SELECT COUNT(*) as count FROM tool').get();
    if (count.count > 0) {
        console.log('Database already seeded, skipping');
        return;
    }
    
    const seed = fs.readFileSync(SEED_PATH, 'utf8');
    db.exec(seed);
    console.log('Database seeded with initial data');
}

// Initialize database instance
const db = initDatabase();
createTables(db);
seedDatabase(db);

// Export singleton instance
module.exports = db;
