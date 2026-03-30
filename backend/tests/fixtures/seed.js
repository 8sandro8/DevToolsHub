/**
 * Test Fixtures - Reusable test data
 */

const defaultCategories = [
    { nombre: 'Desarrollo Web', color: '#3b82f6' },
    { nombre: 'Base de Datos', color: '#10b981' },
    { nombre: 'Testing', color: '#8b5cf6' },
    { nombre: 'DevOps', color: '#f59e0b' }
];

const defaultTools = [
    {
        nombre: 'VS Code',
        descripcion: 'Editor de código fuente desarrollado por Microsoft',
        url: 'https://code.visualstudio.com',
        logo_url: 'https://code.visualstudio.com/favicon.ico',
        rating: 5,
        es_favorito: 1,
        es_archivado: 0
    },
    {
        nombre: 'Postman',
        descripcion: 'Plataforma de colaboración para desarrollo de APIs',
        url: 'https://www.postman.com',
        rating: 4,
        es_favorito: 0,
        es_archivado: 0
    },
    {
        nombre: 'GitHub',
        descripcion: 'Plataforma de desarrollo colaborativo de software',
        url: 'https://github.com',
        rating: 5,
        es_favorito: 1,
        es_archivado: 0
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
 * Seed tools into database (without category associations)
 */
function seedTools(db) {
    const insert = db.prepare(`
        INSERT INTO tool (nombre, descripcion, url, logo_url, rating, es_favorito, es_archivado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    defaultTools.forEach(tool => {
        insert.run(
            tool.nombre,
            tool.descripcion,
            tool.url,
            tool.logo_url || null,
            tool.rating,
            tool.es_favorito,
            tool.es_archivado
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
 * Full seed - categories, tools, and relationships
 */
function fullSeed(db) {
    seedCategories(db);
    seedTools(db);
    seedToolCategories(db);
}

module.exports = {
    defaultCategories,
    defaultTools,
    seedCategories,
    seedTools,
    seedToolCategories,
    fullSeed
};