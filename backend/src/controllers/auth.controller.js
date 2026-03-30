/**
 * Auth Controller
 * Handles HTTP requests for register and login
 */

const AuthService = require('../services/auth.service');

class AuthController {
    constructor(db) {
        this.authService = new AuthService(db);
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
    }

    /**
     * POST /api/auth/register
     */
    async register(req, res, next) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'username and password are required' });
            }

            if (typeof username !== 'string' || username.trim().length < 3) {
                return res.status(400).json({ error: 'username must be at least 3 characters' });
            }

            if (typeof password !== 'string' || password.length < 6) {
                return res.status(400).json({ error: 'password must be at least 6 characters' });
            }

            const user = await this.authService.register(username.trim(), password);
            return res.status(201).json(user);
        } catch (err) {
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }
            next(err);
        }
    }

    /**
     * POST /api/auth/login
     */
    async login(req, res, next) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'username and password are required' });
            }

            const result = await this.authService.login(username.trim(), password);
            return res.status(200).json(result);
        } catch (err) {
            if (err.statusCode) {
                return res.status(err.statusCode).json({ error: err.message });
            }
            next(err);
        }
    }
}

module.exports = AuthController;
