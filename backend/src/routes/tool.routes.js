/**
 * Tool Routes
 * REST API endpoints for tools
 */

const express = require('express');
const router = express.Router();
const ToolController = require('../controllers/tool.controller');
const GitHubController = require('../controllers/github.controller');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Factory function que crea las rutas con el controller inicializado
const createToolRoutes = (db) => {
    const toolController = new ToolController(db);

    // GET /api/tools - Listar todas las herramientas
    router.get('/', toolController.getAll.bind(toolController));

    // GET /api/tools/:id - Obtener herramienta por ID
    router.get('/:id', toolController.getById.bind(toolController));

    // POST /api/tools - Crear nueva herramienta
    router.post('/',
        [
            body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
            body('descripcion').optional().trim(),
            body('url').optional().isURL().withMessage('URL inválida'),
            body('rating').optional().isInt({ min: 0, max: 5 }).withMessage('Rating debe ser 0-5'),
            body('es_favorito').optional().isBoolean(),
            body('categories').optional().isArray(),
            body('tags').optional().isArray()
        ],
        validate,
        toolController.create.bind(toolController)
    );

    // PUT /api/tools/:id - Actualizar herramienta
    // NOTA: No se aplica middleware validate para permitir edición con URLs sin protocolo
    router.put('/:id',
        [
            body('nombre').optional().trim().notEmpty(),
            body('descripcion').optional().trim(),
            body('url').optional().isURL({ require_tld: false, require_protocol: false }),
            body('logo_url').optional().isURL({ require_tld: false, require_protocol: false }),
            body('rating').optional().isInt({ min: 0, max: 5 }),
            body('es_favorito').optional().isBoolean(),
            body('categories').optional().isArray(),
            body('tags').optional().isArray()
        ],
        toolController.update.bind(toolController)
    );

    // DELETE /api/tools/:id - Archivar herramienta
    router.delete('/:id', toolController.delete.bind(toolController));

    // PATCH /api/tools/:id/favorito - Toggle favorito
    router.patch('/:id/favorito', toolController.toggleFavorito.bind(toolController));

    // GET /api/tools/:id/github-stats - Obtener stats de GitHub
    const githubController = new GitHubController(db);
    router.get('/:id/github-stats', githubController.getGitHubStats.bind(githubController));

    return router;
};

module.exports = createToolRoutes;