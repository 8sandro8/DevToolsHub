/**
 * Tool Controller
 * HTTP request handlers for tools
 */

const ToolService = require('../services/tool.service');

class ToolController {
    constructor(db) {
        this.service = new ToolService(db);
    }

    getAll = async (req, res, next) => {
        try {
            const anioQuery = req.query.anio || req.query.year;
            const filters = {
                buscar: req.query.buscar,
                categoria: req.query.categoria,
                tag: req.query.tag,
                anio: anioQuery !== undefined && anioQuery !== '' ? parseInt(anioQuery, 10) : undefined,
                favorito: req.query.favorito !== undefined ? req.query.favorito === 'true' : undefined,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10
            };

            const result = await this.service.getAll(filters);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    getById = (req, res, next) => {
        try {
            const tool = this.service.getById(req.params.id);
            if (!tool) {
                return res.status(404).json({ error: 'Herramienta no encontrada' });
            }
            res.json({ tool });
        } catch (error) {
            next(error);
        }
    }

    getHistory = (req, res, next) => {
        try {
            const history = this.service.getHistory(req.params.id);
            if (!history) {
                return res.status(404).json({ error: 'Herramienta no encontrada' });
            }

            res.json({ history });
        } catch (error) {
            next(error);
        }
    }

    create = (req, res, next) => {
        try {
            const tool = this.service.create(req.body);
            res.status(201).json({ tool });
        } catch (error) {
            next(error);
        }
    }

    update = (req, res, next) => {
        try {
            const tool = this.service.update(req.params.id, req.body);
            if (!tool) {
                return res.status(404).json({ error: 'Herramienta no encontrada' });
            }
            res.json({ tool });
        } catch (error) {
            next(error);
        }
    }

    delete = (req, res, next) => {
        try {
            this.service.delete(req.params.id);
            res.json({ message: 'Herramienta eliminada' });
        } catch (error) {
            next(error);
        }
    }

    toggleFavorito = (req, res, next) => {
        try {
            const tool = this.service.toggleFavorito(req.params.id);
            if (!tool) {
                return res.status(404).json({ error: 'Herramienta no encontrada' });
            }
            res.json({ tool });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ToolController;
