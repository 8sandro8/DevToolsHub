/**
 * Comment Repository
 * Data access layer for tool comments/opinions
 */

class CommentRepository {
    constructor(db) {
        this.db = db;
    }

    normalizeTimestamp(value) {
        if (typeof value !== 'string' || !value) return value;
        if (/Z$|[+-]\d{2}:?\d{2}$/.test(value)) {
            return value;
        }

        if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(value)) {
            return `${value.replace(' ', 'T')}Z`;
        }

        return value;
    }

    hydrateComment(comment) {
        if (!comment) return null;

        return {
            ...comment,
            fecha_creacion: this.normalizeTimestamp(comment.fecha_creacion)
        };
    }

    findByToolId(toolId) {
        const sql = `
            SELECT id, tool_id, autor, contenido, fecha_creacion
            FROM tool_comment
            WHERE tool_id = ?
            ORDER BY fecha_creacion DESC, id DESC
        `;

        return this.db.prepare(sql).all(toolId).map((comment) => this.hydrateComment(comment));
    }

    findByIdAndToolId(commentId, toolId) {
        const sql = `
            SELECT id, tool_id, autor, contenido, fecha_creacion
            FROM tool_comment
            WHERE id = ? AND tool_id = ?
            LIMIT 1
        `;

        return this.hydrateComment(this.db.prepare(sql).get(commentId, toolId));
    }

    create(toolId, autor, contenido) {
        const stmt = this.db.prepare(`
            INSERT INTO tool_comment (tool_id, autor, contenido)
            VALUES (?, ?, ?)
        `);

        const result = stmt.run(toolId, autor, contenido);
        const comment = this.db.prepare(`
            SELECT id, tool_id, autor, contenido, fecha_creacion
            FROM tool_comment
            WHERE id = ?
        `).get(result.lastInsertRowid);

        return this.hydrateComment(comment);
    }

    updateByIdAndToolId(commentId, toolId, contenido) {
        const stmt = this.db.prepare(`
            UPDATE tool_comment
            SET contenido = ?
            WHERE id = ? AND tool_id = ?
        `);

        const result = stmt.run(contenido, commentId, toolId);
        if (result.changes === 0) return null;

        return this.findByIdAndToolId(commentId, toolId);
    }

    deleteByIdAndToolId(commentId, toolId) {
        const stmt = this.db.prepare(`
            DELETE FROM tool_comment
            WHERE id = ? AND tool_id = ?
        `);

        const result = stmt.run(commentId, toolId);
        return result.changes > 0;
    }
}

module.exports = CommentRepository;
