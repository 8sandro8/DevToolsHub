/**
 * Auth Routes
 * POST /api/auth/register
 * POST /api/auth/login
 */

const express = require('express');
const AuthController = require('../controllers/auth.controller');

function createAuthRoutes(db) {
    const router = express.Router();
    const controller = new AuthController(db);

    // POST /api/auth/register
    router.post('/register', controller.register);

    // POST /api/auth/login
    router.post('/login', controller.login);

    return router;
}

module.exports = createAuthRoutes;
