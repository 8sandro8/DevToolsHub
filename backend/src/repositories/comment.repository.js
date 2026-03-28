/**
 * Comment Repository
 * Data access layer for tool comments/opinions
 */

class CommentRepository {
    constructor(db) {
        this.db = db;
    }

    findByToolId(toolId) {
        const sql = `
            SELECT id, tool_id, autor, contenido, fecha_creacion
            FROM tool_comment
            WHERE tool_id = ?
            ORDER BY fecha_creacion DESC, id DESC
        `;

        return this.db.prepare(sql).all(toolId);
    }

    create(toolId, autor, contenido) {
        const stmt = this.db.prepare(`
            INSERT INTO tool_comment (tool_id, autor, contenido)
            VALUES (?, ?, ?)
        `);

        const result = stmt.run(toolId, autor, contenido);
        return this.db.prepare(`
            SELECT id, tool_id, autor, contenido, fecha_creacion
            FROM tool_comment
            WHERE id = ?
        `).get(result.lastInsertRowid);
    }
}

module.exports = CommentRepository;
