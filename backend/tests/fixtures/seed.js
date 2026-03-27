/**
 * Test Fixtures - Reusable test data
 */

const defaultCategories = [
    { nombre: 'Desarrollo Web', color: '#3b82f6' },
    { nombre: 'Base de Datos', color: '#10b981' },
    { nombre: 'Testing', color: '#8b5cf6' },
    { nombre: 'DevOps', color: '#f59e0b' }
];

const defaultTags = [
    { nombre: 'Frontend', color: '#0d6efd' },
    { nombre: 'Backend', color: '#198754' },
    { nombre: 'Testing', color: '#6f42c1' },
    { nombre: 'DevOps', color: '#fd7e14' }
];

const defaultTools = [
    {
        nombre: 'VS Code',
        descripcion: 'Editor de código fuente desarrollado por Microsoft',
        url: 'https://code.visualstudio.com',
        logo_url: 'https://code.visualstudio.com/favicon.ico',
        rating: 5,
        es_favorito: 1,
        es_archivado: 0,
        fecha_creacion: '2024-03-10 10:00:00'
    },
    {
        nombre: 'Postman',
        descripcion: 'Plataforma de colaboración para desarrollo de APIs',
        url: 'https://www.postman.com',
        rating: 4,
        es_favorito: 0,
        es_archivado: 0,
        fecha_creacion: '2025-05-15 10:00:00'
    },
    {
        nombre: 'GitHub',
        descripcion: 'Plataforma de desarrollo colaborativo de software',
        url: 'https://github.com',
        rating: 5,
        es_favorito: 1,
        es_archivado: 0,
        fecha_creacion: '2026-02-20 10:00:00'
    }
];

/**
 * Seed categories into database
 */
function seedCategories(db) {
    const insert = db.prepare('INSERT INTO category (nombre, color) VALUES (?, ?)');
    defaultCategories.forEach(cat => {
        insert.run(cat.nombre, cat.color);
    });
}

/**
 * Seed tags into database
 */
function seedTags(db) {
    const insert = db.prepare('INSERT INTO tag (nombre, color) VALUES (?, ?)');
    defaultTags.forEach(tag => {
        insert.run(tag.nombre, tag.color);
    });
}

/**
 * Seed tools into database (without category associations)
 */
function seedTools(db) {
    const insert = db.prepare(`
        INSERT INTO tool (nombre, descripcion, url, logo_url, rating, es_favorito, es_archivado, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    defaultTools.forEach(tool => {
        insert.run(
            tool.nombre,
            tool.descripcion,
            tool.url,
            tool.logo_url || null,
            tool.rating,
            tool.es_favorito,
            tool.es_archivado,
            tool.fecha_creacion || null
        );
    });
}

/**
 * Associate tools with categories
 */
function seedToolCategories(db) {
    // VS Code -> Desarrollo Web, Testing (ids 1 and 3)
    db.prepare('INSERT INTO tool_category (tool_id, category_id) VALUES (?, ?)').run(1, 1);
    db.prepare('INSERT INTO tool_category (tool_id, category_id) VALUES (?, ?)').run(1, 3);
    
    // Postman -> Desarrollo Web, Testing
    db.prepare('INSERT INTO tool_category (tool_id, category_id) VALUES (?, ?)').run(2, 1);
    db.prepare('INSERT INTO tool_category (tool_id, category_id) VALUES (?, ?)').run(2, 3);
    
    // GitHub -> Desarrollo Web, DevOps
    db.prepare('INSERT INTO tool_category (tool_id, category_id) VALUES (?, ?)').run(3, 1);
    db.prepare('INSERT INTO tool_category (tool_id, category_id) VALUES (?, ?)').run(3, 4);
}

/**
 * Associate tools with tags
 */
function seedToolTags(db) {
    // VS Code -> Frontend, Backend
    db.prepare('INSERT INTO tool_tag (tool_id, tag_id) VALUES (?, ?)').run(1, 1);
    db.prepare('INSERT INTO tool_tag (tool_id, tag_id) VALUES (?, ?)').run(1, 2);

    // Postman -> Backend, Testing
    db.prepare('INSERT INTO tool_tag (tool_id, tag_id) VALUES (?, ?)').run(2, 2);
    db.prepare('INSERT INTO tool_tag (tool_id, tag_id) VALUES (?, ?)').run(2, 3);

    // GitHub -> DevOps
    db.prepare('INSERT INTO tool_tag (tool_id, tag_id) VALUES (?, ?)').run(3, 4);
}

/**
 * Full seed - categories, tools, and relationships
 */
function fullSeed(db) {
    seedCategories(db);
    seedTags(db);
    seedTools(db);
    seedToolCategories(db);
    seedToolTags(db);
}

module.exports = {
    defaultCategories,
    defaultTags,
    defaultTools,
    seedCategories,
    seedTags,
    seedTools,
    seedToolCategories,
    seedToolTags,
    fullSeed
};
