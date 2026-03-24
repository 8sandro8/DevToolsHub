/**
 * Tool Repository
 * Data access layer for tools with filtering and pagination
 */

const BaseRepository = require('./base.repository');

class ToolRepository extends BaseRepository {
    constructor(db) {
        super(db, 'tool');
    }

    findWithFilters({ buscar, categoria, favorito, page = 1, limit = 10 }) {
        let sql = 'SELECT DISTINCT t.* FROM tool t';
        const params = [];
        const conditions = [];

        // Join con categorías si se filtra
        if (categoria) {
            sql += ' INNER JOIN tool_category tc ON t.id = tc.tool_id INNER JOIN category c ON tc.category_id = c.id';
            conditions.push('c.nombre = ?');
            params.push(categoria);
        }

        // Búsqueda full-text
        if (buscar) {
            sql += ' INNER JOIN tool_fts fts ON t.id = fts.rowid';
            conditions.push('tool_fts MATCH ?');
            params.push(buscar + '*');
        }

        // Filtro favoritos
        if (favorito !== undefined) {
            conditions.push('t.es_favorito = ?');
            params.push(favorito ? 1 : 0);
        }

        // Siempre excluir archivados
        conditions.push('t.es_archivado = 0');

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        // Contar total
        const countSql = sql.replace('SELECT DISTINCT t.*', 'SELECT COUNT(DISTINCT t.id) as total');
        const totalResult = this.db.prepare(countSql).get(...params);
        const total = totalResult?.total || 0;

        // Paginación
        sql += ' ORDER BY t.fecha_creacion DESC LIMIT ? OFFSET ?';
        params.push(limit, (page - 1) * limit);

        const tools = this.db.prepare(sql).all(...params);

        return {
            data: tools,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    getCategories(toolId) {
        const sql = `
            SELECT c.* FROM category c 
            INNER JOIN tool_category tc ON c.id = tc.category_id 
            WHERE tc.tool_id = ?
        `;
        return this.db.prepare(sql).all(toolId);
    }

    setCategories(toolId, categoryIds) {
        // Eliminar categorías actuales
        this.db.prepare('DELETE FROM tool_category WHERE tool_id = ?').run(toolId);
        
        // Insertar nuevas
        if (categoryIds && categoryIds.length > 0) {
            const insert = this.db.prepare('INSERT INTO tool_category (tool_id, category_id) VALUES (?, ?)');
            categoryIds.forEach(catId => insert.run(toolId, catId));
        }
    }

    getTags(toolId) {
        const sql = `
            SELECT t.* FROM tag t 
            INNER JOIN tool_tag tt ON t.id = tt.tag_id 
            WHERE tt.tool_id = ?
        `;
        return this.db.prepare(sql).all(toolId);
    }

    setTags(toolId, tagIds) {
        // Eliminar tags actuales
        this.db.prepare('DELETE FROM tool_tag WHERE tool_id = ?').run(toolId);
        
        // Insertar nuevos
        if (tagIds && tagIds.length > 0) {
            const insert = this.db.prepare('INSERT INTO tool_tag (tool_id, tag_id) VALUES (?, ?)');
            tagIds.forEach(tagId => insert.run(toolId, tagId));
        }
    }

    updateImageUrl(id, imageUrl) {
        const stmt = this.db.prepare(`
            UPDATE tool 
            SET image_url = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        const result = stmt.run(imageUrl, id);
        
        if (result.changes === 0) {
            return null;
        }
        
        return this.findById(id);
    }
}

module.exports = ToolRepository;