/**
 * Comment Controller
 * HTTP request handlers for comments/opinions
 */

const CommentService = require('../services/comment.service');

class CommentController {
    constructor(db) {
        this.service = new CommentService(db);
    }

    getAll = (req, res, next) => {
        try {
            const comments = this.service.getByToolId(req.params.toolId);
            if (!comments) {
                return res.status(404).json({ error: 'Herramienta no encontrada' });
            }

            res.json({ comments });
        } catch (error) {
            next(error);
        }
    }

    create = (req, res, next) => {
        try {
            const comment = this.service.create(req.params.toolId, req.body, req.user);
            if (!comment) {
                return res.status(404).json({ error: 'Herramienta no encontrada' });
            }

            res.status(201).json({ comment });
        } catch (error) {
            if (error.statusCode) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            next(error);
        }
    }

    update = (req, res, next) => {
        try {
            const comment = this.service.update(req.params.toolId, req.params.commentId, req.body, req.user);
            if (!comment) {
                return res.status(404).json({ error: 'Comentario no encontrado' });
            }

            res.json({ comment });
        } catch (error) {
            if (error.statusCode) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            next(error);
        }
    }

    delete = (req, res, next) => {
        try {
            const deleted = this.service.delete(req.params.toolId, req.params.commentId, req.user);
            if (!deleted) {
                return res.status(404).json({ error: 'Comentario no encontrado' });
            }

            res.json({ message: 'Comentario eliminado' });
        } catch (error) {
            if (error.statusCode) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            next(error);
        }
    }
}

module.exports = CommentController;
