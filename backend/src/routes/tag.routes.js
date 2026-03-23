/**
 * Tag Routes
 * REST API endpoints for tags
 */

const express = require('express');
const router = express.Router();
const TagController = require('../controllers/tag.controller');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Factory function que crea las rutas con el controller inicializado
const createTagRoutes = (db) => {
    const tagController = new TagController(db);

    // GET /api/tags - Listar todos los tags
    router.get('/', tagController.getAll.bind(tagController));

    // GET /api/tags/:id - Obtener tag por ID
    router.get('/:id', tagController.getById.bind(tagController));

    // POST /api/tags - Crear nuevo tag
    router.post('/',
        [
            body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
            body('color').optional().trim()
        ],
        validate,
        tagController.create.bind(tagController)
    );

    // PUT /api/tags/:id - Actualizar tag
    router.put('/:id',
        [
            body('nombre').optional().trim().notEmpty(),
            body('color').optional().trim()
        ],
        tagController.update.bind(tagController)
    );

    // DELETE /api/tags/:id - Eliminar tag
    router.delete('/:id', tagController.delete.bind(tagController));

    // GET /api/tags/:id/tools - Obtener herramientas con este tag
    router.get('/:id/tools', tagController.getTools.bind(tagController));

    // POST /api/tags/:id/tools - Asignar herramientas al tag
    router.post('/:id/tools',
        [
            body('toolId').isInt().withMessage('toolId debe ser un número entero')
        ],
        validate,
        tagController.addTool.bind(tagController)
    );

    // DELETE /api/tags/:id/tools/:toolId - Desasignar herramienta del tag
    router.delete('/:id/tools/:toolId', tagController.removeTool.bind(tagController));

    // PUT /api/tags/:id/tools - Actualizar todas las herramientas del tag
    router.put('/:id/tools',
        [
            body('toolIds').isArray().withMessage('toolIds debe ser un array')
        ],
        validate,
        tagController.setTools.bind(tagController)
    );

    return router;
};

module.exports = createTagRoutes;