/**
 * Test Setup - Database Factory
 * Creates in-memory SQLite database with schema for testing
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Store the schema for reuse
const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
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
            rating INTEGER DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
            es_favorito INTEGER DEFAULT 0,
            es_archivado INTEGER DEFAULT 0,
            fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Category table
    db.exec(`
        CREATE TABLE IF NOT EXISTS category (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            color TEXT DEFAULT '#6b7280'
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
    
    // Indices
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tool_nombre ON tool(nombre)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tool_favorito ON tool(es_favorito)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_category_nombre ON category(nombre)`);
}

/**
 * Create Express app for testing with injected DB
 * @param {Database} db - Database instance to use
 */
function createTestApp(db) {
    const express = require('express');
    const cors = require('cors');
    
    const app = express();
    app.use(cors());
    app.use(express.json());
    
    // Import routes (they accept db as parameter)
    const createToolRoutes = require('../src/routes/tool.routes');
    const createCategoryRoutes = require('../src/routes/category.routes');
    
    app.use('/api/tools', createToolRoutes(db));
    app.use('/api/categories', createCategoryRoutes(db));
    
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
 * Reset database - clear all data but keep schema
 */
function resetDb(db) {
    db.prepare('DELETE FROM tool_category').run();
    db.prepare('DELETE FROM tool').run();
    db.prepare('DELETE FROM category').run();
    
    // Reset auto-increment
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('tool', 'category', 'tool_category')");
}

module.exports = {
    createTestDb,
    createTestApp,
    resetDb
};