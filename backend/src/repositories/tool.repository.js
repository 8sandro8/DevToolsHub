/**
 * Tool Repository
 * Data access layer for tools with filtering and pagination
 */

const BaseRepository = require('./base.repository');

class ToolRepository extends BaseRepository {
    constructor(db) {
        super(db, 'tool');
    }

    recordHistory(toolId, accion, resumen, detalles = null) {
        this.db.prepare(`
            INSERT INTO tool_history (tool_id, accion, resumen, detalles_json)
            VALUES (?, ?, ?, ?)
        `).run(toolId, accion, resumen, detalles ? JSON.stringify(detalles) : null);
    }

    buildHistorySummary(action, data, before, after) {
        if (action === 'create') return 'Herramienta creada';
        if (action === 'delete') return 'Herramienta archivada';

        const keys = Object.keys(data || {});
        if (keys.length === 1 && keys[0] === 'es_favorito') {
            return after.es_favorito ? 'Marcada como favorita' : 'Quitada de favoritos';
        }

        if (keys.length === 1 && keys[0] === 'image_url') {
            return after.image_url ? 'Imagen actualizada' : 'Imagen eliminada';
        }

        return `Herramienta actualizada (${keys.join(', ') || 'sin cambios'})`;
    }

    buildHistoryDetails(before, after, data) {
        const keys = Object.keys(data || {});
        const details = {
            before: {},
            after: {}
        };

        keys.forEach((key) => {
            details.before[key] = before[key];
            details.after[key] = after[key];
        });

        return details;
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

    getHistory(toolId) {
        const sql = `
            SELECT id, tool_id, accion, resumen, detalles_json, fecha_creacion
            FROM tool_history
            WHERE tool_id = ?
            ORDER BY fecha_creacion DESC, id DESC
        `;

        return this.db.prepare(sql).all(toolId).map((entry) => ({
            ...entry,
            detalles_json: entry.detalles_json ? JSON.parse(entry.detalles_json) : null
        }));
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
        const before = this.findById(id);
        if (!before) {
            return null;
        }

        const stmt = this.db.prepare(`
            UPDATE tool 
            SET image_url = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        const result = stmt.run(imageUrl, id);

        if (result.changes === 0) {
            return null;
        }

        const updated = this.findById(id);
        if (updated) {
            this.recordHistory(id, 'update', this.buildHistorySummary('update', { image_url: imageUrl }, before, updated), this.buildHistoryDetails(before, updated, { image_url: imageUrl }));
        }

        return updated;
    }

    create(data) {
        const tool = super.create(data);
        if (tool) {
            this.recordHistory(tool.id, 'create', this.buildHistorySummary('create', data, null, tool), { created: tool });
        }

        return tool;
    }

    update(id, data) {
        const before = this.findById(id);
        if (!before) {
            return null;
        }

        const updated = super.update(id, data);
        if (!updated) {
            return null;
        }

        this.recordHistory(id, 'update', this.buildHistorySummary('update', data, before, updated), this.buildHistoryDetails(before, updated, data));
        return updated;
    }

    delete(id) {
        const before = this.findById(id);
        const result = super.delete(id);

        if (before) {
            this.recordHistory(id, 'delete', this.buildHistorySummary('delete', {}, before, result || before), { deleted: before });
        }

        return result;
    }
}

module.exports = ToolRepository;
