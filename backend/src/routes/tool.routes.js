const express = require('express');
const router = express.Router();
const ToolController = require('../controllers/tool.controller');
const GitHubController = require('../controllers/github.controller');
const UploadController = require('../controllers/upload.controller');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload.middleware');

/**
 * Tool Routes
 * REST API endpoints for tools
 */

// Factory function que crea las rutas con el controller inicializado
const createToolRoutes = (db) => {
    const toolController = new ToolController(db);
    const uploadController = new UploadController(db);

    // GET /api/tools - Listar todas las herramientas
    router.get('/', toolController.getAll.bind(toolController));

    // GET /api/tools/:id - Obtener herramienta por ID
    router.get('/:id', toolController.getById.bind(toolController));

    // POST /api/tools - Crear nueva herramienta
    router.post('/',
        [
            body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
                .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
            body('descripcion').optional().trim()
                .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
            body('url').optional({ nullable: true, checkFalsy: true })
                .isURL({ require_protocol: false, require_tld: false })
                .withMessage('URL inválida'),
            body('logo_url').optional({ nullable: true, checkFalsy: true })
                .isURL({ require_protocol: false, require_tld: false })
                .withMessage('URL de logo inválida'),
            body('rating').optional()
                .isInt({ min: 0, max: 5 }).withMessage('Rating debe ser entre 0 y 5'),
            body('es_favorito').optional().isBoolean().withMessage('es_favorito debe ser booleano'),
            body('categories').optional().isArray().withMessage('categories debe ser un array'),
            body('tags').optional().isArray().withMessage('tags debe ser un array'),
        ],
        validate,
        toolController.create.bind(toolController)
    );

    // PUT /api/tools/:id - Actualizar herramienta
    router.put('/:id',
        [
            body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío')
                .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
            body('descripcion').optional().trim()
                .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
            body('url').optional({ nullable: true, checkFalsy: true })
                .isURL({ require_protocol: false, require_tld: false })
                .withMessage('URL inválida'),
            body('logo_url').optional({ nullable: true, checkFalsy: true })
                .isURL({ require_protocol: false, require_tld: false })
                .withMessage('URL de logo inválida'),
            body('rating').optional()
                .isInt({ min: 0, max: 5 }).withMessage('Rating debe ser entre 0 y 5'),
            body('es_favorito').optional().isBoolean(),
            body('categories').optional().isArray(),
            body('tags').optional().isArray(),
        ],
        validate,
        toolController.update.bind(toolController)
    );

    // POST /api/tools/:id/image - Subir imagen
    router.post('/:id/image', upload.single('image'), uploadController.uploadImage);

    // DELETE /api/tools/:id/image - Eliminar imagen
    router.delete('/:id/image', uploadController.deleteImage);

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
