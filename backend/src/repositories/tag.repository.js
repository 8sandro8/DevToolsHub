/**
 * Tag Repository
 * Data access layer for tags
 */

const BaseRepository = require('./base.repository');

class TagRepository extends BaseRepository {
    constructor(db) {
        super(db, 'tag');
    }

    findAll() {
        const sql = 'SELECT * FROM tag ORDER BY nombre ASC';
        return this.db.prepare(sql).all();
    }

    findByName(nombre) {
        const sql = 'SELECT * FROM tag WHERE nombre = ?';
        return this.db.prepare(sql).get(nombre);
    }

    getTools(tagId) {
        const sql = `
            SELECT t.* FROM tool t
            INNER JOIN tool_tag tt ON t.id = tt.tool_id
            WHERE tt.tag_id = ? AND t.es_archivado = 0
            ORDER BY t.nombre ASC
        `;
        return this.db.prepare(sql).all(tagId);
    }

    addTool(tagId, toolId) {
        const sql = 'INSERT OR IGNORE INTO tool_tag (tag_id, tool_id) VALUES (?, ?)';
        return this.db.prepare(sql).run(tagId, toolId);
    }

    removeTool(tagId, toolId) {
        const sql = 'DELETE FROM tool_tag WHERE tag_id = ? AND tool_id = ?';
        return this.db.prepare(sql).run(tagId, toolId);
    }

    setTools(tagId, toolIds) {
        // Eliminar relaciones actuales
        this.db.prepare('DELETE FROM tool_tag WHERE tag_id = ?').run(tagId);

        // Insertar nuevas relaciones
        if (toolIds && toolIds.length > 0) {
            const insert = this.db.prepare('INSERT INTO tool_tag (tag_id, tool_id) VALUES (?, ?)');
            toolIds.forEach(toolId => insert.run(tagId, toolId));
        }
    }
}

module.exports = TagRepository;