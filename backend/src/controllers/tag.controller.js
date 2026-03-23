/**
 * Tag Controller
 * HTTP request handlers for tags
 */

const TagService = require('../services/tag.service');

class TagController {
    constructor(db) {
        this.service = new TagService(db);
    }

    getAll = (req, res, next) => {
        try {
            const tags = this.service.getAll();
            res.json({ tags });
        } catch (error) {
            next(error);
        }
    }

    getById = (req, res, next) => {
        try {
            const tag = this.service.getById(req.params.id);
            if (!tag) {
                return res.status(404).json({ error: 'Tag no encontrado' });
            }
            res.json({ tag });
        } catch (error) {
            next(error);
        }
    }

    create = (req, res, next) => {
        try {
            const tag = this.service.create(req.body);
            res.status(201).json({ tag });
        } catch (error) {
            next(error);
        }
    }

    update = (req, res, next) => {
        try {
            const tag = this.service.update(req.params.id, req.body);
            if (!tag) {
                return res.status(404).json({ error: 'Tag no encontrado' });
            }
            res.json({ tag });
        } catch (error) {
            next(error);
        }
    }

    delete = (req, res, next) => {
        try {
            const deleted = this.service.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Tag no encontrado' });
            }
            res.json({ message: 'Tag eliminado' });
        } catch (error) {
            next(error);
        }
    }

    getTools = (req, res, next) => {
        try {
            const tag = this.service.getTools(req.params.id);
            if (!tag) {
                return res.status(404).json({ error: 'Tag no encontrado' });
            }
            res.json({ tag });
        } catch (error) {
            next(error);
        }
    }

    addTool = (req, res, next) => {
        try {
            const { toolId } = req.body;
            if (!toolId) {
                return res.status(400).json({ error: 'toolId es requerido' });
            }
            this.service.addTool(req.params.id, toolId);
            res.json({ message: 'Herramienta asignada al tag' });
        } catch (error) {
            next(error);
        }
    }

    removeTool = (req, res, next) => {
        try {
            this.service.removeTool(req.params.id, req.params.toolId);
            res.json({ message: 'Herramienta desasignada del tag' });
        } catch (error) {
            next(error);
        }
    }

    setTools = (req, res, next) => {
        try {
            const { toolIds } = req.body;
            if (!Array.isArray(toolIds)) {
                return res.status(400).json({ error: 'toolIds debe ser un array' });
            }
            this.service.setTools(req.params.id, toolIds);
            res.json({ message: 'Herramientas actualizadas para el tag' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TagController;