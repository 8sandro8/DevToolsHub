-- DevToolsHub Database Schema
-- SQLite with FTS5 for full-text search

-- ============================================
-- HERRAMIENTAS
-- ============================================
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
);

-- ============================================
-- CATEGORÍAS
-- ============================================
CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6b7280'
);

-- ============================================
-- TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6c757d'
);

-- ============================================
-- RELACIÓN MUCHOS A MUCHOS TOOL-TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS tool_tag (
    tool_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (tool_id, tag_id),
    FOREIGN KEY (tool_id) REFERENCES tool(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);

-- ============================================
-- RELACIÓN MUCHOS A MUCHOS
-- ============================================
CREATE TABLE IF NOT EXISTS tool_category (
    tool_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (tool_id, category_id),
    FOREIGN KEY (tool_id) REFERENCES tool(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

-- ============================================
-- FTS5 PARA BÚSQUEDA FULL-TEXT
-- ============================================
CREATE VIRTUAL TABLE IF NOT EXISTS tool_fts USING fts5(
    nombre,
    descripcion,
    content='tool',
    content_rowid='id'
);

-- ============================================
-- TRIGGERS PARA MANTENER FTS SINCRONIZADO
-- ============================================
CREATE TRIGGER IF NOT EXISTS tool_ai AFTER INSERT ON tool BEGIN
    INSERT INTO tool_fts(rowid, nombre, descripcion) VALUES (new.id, new.nombre, new.descripcion);
END;

CREATE TRIGGER IF NOT EXISTS tool_ad AFTER DELETE ON tool BEGIN
    INSERT INTO tool_fts(tool_fts, rowid, nombre, descripcion) VALUES('delete', old.id, old.nombre, old.descripcion);
END;

CREATE TRIGGER IF NOT EXISTS tool_au AFTER UPDATE ON tool BEGIN
    INSERT INTO tool_fts(tool_fts, rowid, nombre, descripcion) VALUES('delete', old.id, old.nombre, old.descripcion);
    INSERT INTO tool_fts(rowid, nombre, descripcion) VALUES (new.id, new.nombre, new.descripcion);
END;

-- ============================================
-- USUARIOS (AUTH)
-- ============================================
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tool_nombre ON tool(nombre);
CREATE INDEX IF NOT EXISTS idx_tool_favorito ON tool(es_favorito);
CREATE INDEX IF NOT EXISTS idx_category_nombre ON category(nombre);
CREATE INDEX IF NOT EXISTS idx_user_username ON user(username);
