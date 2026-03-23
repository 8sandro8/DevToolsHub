/**
 * Tool Service
 * Business logic layer for tools
 */

const ToolRepository = require('../repositories/tool.repository');

class ToolService {
    constructor(db) {
        this.repository = new ToolRepository(db);
    }

    getAll(filters) {
        return this.repository.findWithFilters(filters);
    }

    getById(id) {
        const tool = this.repository.findById(id);
        if (!tool) return null;
        
        tool.categories = this.repository.getCategories(id);
        return tool;
    }

    create(data) {
        const { categories, ...toolData } = data;
        
        // Validar rating
        if (toolData.rating === undefined) toolData.rating = 0;
        toolData.rating = Math.min(5, Math.max(0, parseInt(toolData.rating) || 0));
        
        // Crear tool
        const tool = this.repository.create(toolData);
        
        // Asignar categorías
        if (categories && categories.length > 0) {
            this.repository.setCategories(tool.id, categories);
            tool.categories = this.repository.getCategories(tool.id);
        }
        
        return tool;
    }

    update(id, data) {
        const { categories, ...toolData } = data;
        
        // Validar rating si se incluye
        if (toolData.rating !== undefined) {
            toolData.rating = Math.min(5, Math.max(0, parseInt(toolData.rating) || 0));
        }
        
        const tool = this.repository.update(id, toolData);
        if (!tool) return null;
        
        // Actualizar categorías si se proporcionan
        if (categories !== undefined) {
            this.repository.setCategories(id, categories);
            tool.categories = this.repository.getCategories(id);
        }
        
        return tool;
    }

    delete(id) {
        return this.repository.delete(id);
    }

    toggleFavorito(id) {
        const tool = this.repository.findById(id);
        if (!tool) return null;
        
        return this.repository.update(id, { es_favorito: tool.es_favorito ? 0 : 1 });
    }
}

module.exports = ToolService;