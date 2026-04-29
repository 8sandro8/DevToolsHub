/**
 * Comment Routes
 * REST API endpoints for tool comments
 */

const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Factory function que crea las rutas con el controller inicializado
const createCommentRoutes = (db) => {
    const commentController = new CommentController(db);

    // GET /api/tools/:toolId/comments - Obtener comentarios de una herramienta
    router.get('/:toolId/comments', commentController.getAll.bind(commentController));

    // POST /api/tools/:toolId/comments - Crear nuevo comentario
    router.post('/:toolId/comments',
        [
            body('contenido').trim().notEmpty().withMessage('El contenido es obligatorio'),
        ],
        validate,
        commentController.create.bind(commentController)
    );

    // PUT /api/tools/:toolId/comments/:commentId - Actualizar comentario
    router.put('/:toolId/comments/:commentId',
        [
            body('contenido').trim().notEmpty().withMessage('El contenido es obligatorio'),
        ],
        validate,
        commentController.update.bind(commentController)
    );

    // DELETE /api/tools/:toolId/comments/:commentId - Eliminar comentario
    router.delete('/:toolId/comments/:commentId', commentController.delete.bind(commentController));

    return router;
};

module.exports = createCommentRoutes;