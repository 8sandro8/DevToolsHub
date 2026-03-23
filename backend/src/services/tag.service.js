/**
 * Tag Service
 * Business logic layer for tags
 */

const TagRepository = require('../repositories/tag.repository');

class TagService {
    constructor(db) {
        this.repository = new TagRepository(db);
    }

    getAll() {
        return this.repository.findAll();
    }

    getById(id) {
        return this.repository.findById(id);
    }

    create(data) {
        // Verificar si ya existe un tag con el mismo nombre
        const existing = this.repository.findByName(data.nombre);
        if (existing) {
            throw new Error('Ya existe un tag con ese nombre');
        }

        return this.repository.create(data);
    }

    update(id, data) {
        // Verificar si el tag existe
        const tag = this.repository.findById(id);
        if (!tag) {
            return null;
        }

        // Verificar si el nuevo nombre ya existe en otro tag
        if (data.nombre && data.nombre !== tag.nombre) {
            const existing = this.repository.findByName(data.nombre);
            if (existing && existing.id !== id) {
                throw new Error('Ya existe un tag con ese nombre');
            }
        }

        return this.repository.update(id, data);
    }

    delete(id) {
        // Verificar si el tag existe
        const tag = this.repository.findById(id);
        if (!tag) {
            return false;
        }

        return this.repository.delete(id);
    }

    getTools(tagId) {
        const tag = this.repository.findById(tagId);
        if (!tag) {
            return null;
        }

        tag.tools = this.repository.getTools(tagId);
        return tag;
    }

    addTool(tagId, toolId) {
        const tag = this.repository.findById(tagId);
        if (!tag) {
            throw new Error('Tag no encontrado');
        }

        return this.repository.addTool(tagId, toolId);
    }

    removeTool(tagId, toolId) {
        const tag = this.repository.findById(tagId);
        if (!tag) {
            throw new Error('Tag no encontrado');
        }

        return this.repository.removeTool(tagId, toolId);
    }

    setTools(tagId, toolIds) {
        const tag = this.repository.findById(tagId);
        if (!tag) {
            throw new Error('Tag no encontrado');
        }

        return this.repository.setTools(tagId, toolIds);
    }
}

module.exports = TagService;