/**
 * Test Setup - Database Factory
 * Creates in-memory SQLite database with schema for testing
 */

require('dotenv').config();

if (typeof jest !== 'undefined' && typeof jest.setTimeout === 'function') {
    jest.setTimeout(30000);
}

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure JWT_SECRET is available in tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_tests';

// Store the schema for reuse
const schemaPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');
let schemaContent = '';

// Load schema once
try {
    schemaContent = fs.readFileSync(schemaPath, 'utf8');
} catch (e) {
    console.warn('Schema file not found, tests may fail');
}

/**
 * Create a fresh in-memory database with schema
 * Note: FTS5 may have issues with :memory: databases
 */
function createTestDb() {
    const db = new Database(':memory:');
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Load schema if available
    if (schemaContent) {
        try {
            db.exec(schemaContent);
        } catch (error) {
            // FTS5 might fail in memory, try without FTS triggers
            console.warn('FTS5 may not work in memory mode, tests will handle this');
            // Try creating tables without FTS
            const tablesOnly = schemaContent
                .split(';')
                .filter(s => s.includes('CREATE TABLE') && !s.includes('VIRTUAL TABLE'))
                .join(';\n');
            try {
                db.exec(tablesOnly);
            } catch (e) {
                // If still fails, try manual table creation
                createTablesManually(db);
            }
        }
    } else {
        createTablesManually(db);
    }
    
    return db;
}

/**
 * Manual table creation as fallback
 */
function createTablesManually(db) {
    // Tool table
    db.exec(`
        CREATE TABLE IF NOT EXISTS tool (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            url TEXT,
            logo_url TEXT,
            image_url TEXT DEFAULT NULL,
            rating INTEGER DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
            es_favorito INTEGER DEFAULT 0,
            es_archivado INTEGER DEFAULT 0,
            fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS tool_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool_id INTEGER NOT NULL,
            accion TEXT NOT NULL,
            resumen TEXT NOT NULL,
            detalles_json TEXT,
            fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tool_id) REFERENCES tool(id) ON DELETE CASCADE
        )
    `);
    
    // Category table
    db.exec(`
        CREATE TABLE IF NOT EXISTS category (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            descripcion TEXT,
            color TEXT DEFAULT '#6b7280'
        )
    `);

    // Tag table
    db.exec(`
        CREATE TABLE IF NOT EXISTS tag (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            color TEXT DEFAULT '#6c757d'
        )
    `);
    
    // Tool-Category relationship
    db.exec(`
        CREATE TABLE IF NOT EXISTS tool_category (
            tool_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            PRIMARY KEY (tool_id, category_id),
            FOREIGN KEY (tool_id) REFERENCES tool(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
        )
    `);

    // Tool-Tag relationship
    db.exec(`
        CREATE TABLE IF NOT EXISTS tool_tag (
            tool_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (tool_id, tag_id),
            FOREIGN KEY (tool_id) REFERENCES tool(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS tool_comment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool_id INTEGER NOT NULL,
            autor TEXT NOT NULL,
            contenido TEXT NOT NULL,
            fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tool_id) REFERENCES tool(id) ON DELETE CASCADE
        )
    `);

    // User table
    db.exec(`
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Indices
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tool_nombre ON tool(nombre)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tool_favorito ON tool(es_favorito)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tool_history_tool_id_fecha ON tool_history(tool_id, fecha_creacion DESC)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_category_nombre ON category(nombre)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tool_comment_tool_id_fecha ON tool_comment(tool_id, fecha_creacion DESC)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_user_username ON user(username)`);
}

/**
 * Create Express app for testing with injected DB (includes auth)
 * @param {Database} db - Database instance to use
 */
function createTestApp(db) {
    const express = require('express');
    const cors = require('cors');
    const { authenticateToken } = require('../src/middleware/auth.middleware');

    const app = express();
    app.use(cors());
    app.use((req, res, next) => {
        const contentType = req.headers['content-type'];
        if (contentType && /^application\/json/i.test(contentType)) {
            req.headers['content-type'] = 'application/json';
        }
        next();
    });
    app.use(express.json());
    
    // Import routes
    const createToolRoutes = require('../src/routes/tool.routes');
    const createCategoryRoutes = require('../src/routes/category.routes');
    const createTagRoutes = require('../src/routes/tag.routes');
    const createAuthRoutes = require('../src/routes/auth.routes');

    // Auth routes (public)
    app.use('/api/auth', createAuthRoutes(db));

    // Protect mutations
    const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    const protectMutations = (req, res, next) => {
        if (mutationMethods.includes(req.method)) {
            return authenticateToken(req, res, next);
        }
        next();
    };

    app.use('/api/tools', protectMutations, createToolRoutes(db));
    app.use('/api/categories', protectMutations, createCategoryRoutes(db));
    app.use('/api/tags', protectMutations, createTagRoutes(db));
    
    // Error handler
    app.use((err, req, res, next) => {
        console.error('[TEST ERROR]', err.message);
        res.status(err.statusCode || 500).json({
            error: err.message || 'Internal Server Error'
        });
    });
    
    return app;
}

/**
 * Get a valid JWT token for a test user
 * Creates the user if it doesn't exist, then logs in
 * @param {Object} app - Express app (supertest instance or app)
 * @returns {Promise<string>} JWT token
 */
async function getAuthToken(app) {
    const request = require('supertest');
    const testUser = { username: 'testadmin', password: 'testpass123' };

    // Try register (ignore 409 if already exists)
    await request(app).post('/api/auth/register').send(testUser);

    // Login and return token
    const res = await request(app).post('/api/auth/login').send(testUser);
    return res.body.token;
}

/**
 * Reset database - clear all data but keep schema
 */
function resetDb(db) {
    try { db.prepare('DELETE FROM tool_history').run(); } catch {}
    try { db.prepare('DELETE FROM tool_comment').run(); } catch {}
    db.prepare('DELETE FROM tool_category').run();
    db.prepare('DELETE FROM tool').run();
    db.prepare('DELETE FROM category').run();
    try { db.prepare('DELETE FROM tag').run(); } catch {}
    try { db.prepare('DELETE FROM tool_tag').run(); } catch {}
    try { db.prepare('DELETE FROM user').run(); } catch {}
    
    // Reset auto-increment
    try {
        db.exec("DELETE FROM sqlite_sequence WHERE name IN ('tool', 'category', 'tag', 'user')");
    } catch {}
}

module.exports = {
    createTestDb,
    createTestApp,
    resetDb,
    getAuthToken
};
