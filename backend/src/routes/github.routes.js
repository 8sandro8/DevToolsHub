/**
 * GitHub Routes
 * REST API endpoints for GitHub stats
 */

const express = require('express');
const router = express.Router();
const GitHubController = require('../controllers/github.controller');

/**
 * Factory function que crea las rutas con el controller inicializado
 * @param {Object} db - Instancia de la base de datos
 */
const createGitHubRoutes = (db) => {
    const githubController = new GitHubController(db);

    // GET /api/github/:id - Obtener stats de GitHub para una herramienta
    router.get('/:id', githubController.getGitHubStats.bind(githubController));

    return router;
};

module.exports = createGitHubRoutes;
