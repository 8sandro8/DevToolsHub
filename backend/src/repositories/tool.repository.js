/**
 * Tool Repository
 * Data access layer for tools with filtering and pagination
 */

const BaseRepository = require('./base.repository');

class ToolRepository extends BaseRepository {
    constructor(db) {
        super(db, 'tool');
    }

    findById(id) {
        const tool = super.findById(id);
        return tool ? this.hydrateTool(tool) : null;
    }

    findWithFilters({ buscar, categoria, tag, anio, favorito, page = 1, limit = 10 }) {
        let sql = 'SELECT DISTINCT t.* FROM tool t';
        const params = [];
        const conditions = [];
        const joins = [];

        // Join con categorías si se filtra
        if (categoria) {
            joins.push('INNER JOIN tool_category tc_filter ON t.id = tc_filter.tool_id INNER JOIN category c_filter ON tc_filter.category_id = c_filter.id');
            if (/^\d+$/.test(String(categoria))) {
                conditions.push('c_filter.id = ?');
                params.push(parseInt(categoria, 10));
            } else {
                conditions.push('c_filter.nombre = ?');
                params.push(categoria);
            }
        }

        // Join con tags si se filtra
        if (tag) {
            joins.push('INNER JOIN tool_tag tt_filter ON t.id = tt_filter.tool_id INNER JOIN tag tg_filter ON tt_filter.tag_id = tg_filter.id');
            if (/^\d+$/.test(String(tag))) {
                conditions.push('tg_filter.id = ?');
                params.push(parseInt(tag, 10));
            } else {
                conditions.push('tg_filter.nombre = ?');
                params.push(tag);
            }
        }

        // Búsqueda full-text
        if (buscar) {
            joins.push('INNER JOIN tool_fts fts ON t.id = fts.rowid');
            conditions.push('tool_fts MATCH ?');
            params.push(buscar + '*');
        }

        // Filtro por año de creación
        if (anio) {
            conditions.push("strftime('%Y', t.fecha_creacion) = ?");
            params.push(String(anio));
        }

        // Filtro favoritos
        if (favorito !== undefined) {
            conditions.push('t.es_favorito = ?');
            params.push(favorito ? 1 : 0);
        }

        // Siempre excluir archivados
        conditions.push('t.es_archivado = 0');

        if (joins.length > 0) {
            sql += ' ' + joins.join(' ');
        }

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
            data: this.hydrateTools(tools),
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

    hydrateTool(tool) {
        if (!tool) return null;

        return {
            ...tool,
            categories: this.getCategories(tool.id),
            tags: this.getTags(tool.id)
        };
    }

    hydrateTools(tools) {
        return tools.map(tool => this.hydrateTool(tool));
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
