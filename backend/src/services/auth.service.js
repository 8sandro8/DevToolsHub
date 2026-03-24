/**
 * Auth Service
 * Business logic for authentication: register, login, token verification
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/user.repository');

const SALT_ROUNDS = 10;

class AuthService {
    constructor(db) {
        this.userRepository = new UserRepository(db);
    }

    /**
     * Register a new user
     * @param {string} username
     * @param {string} password
     * @returns {Object} Created user (without password_hash)
     * @throws {Error} 409 if username already exists
     */
    async register(username, password) {
        const existing = this.userRepository.findByUsername(username);
        if (existing) {
            const err = new Error('Username already exists');
            err.statusCode = 409;
            throw err;
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        return this.userRepository.create(username, passwordHash);
    }

    /**
     * Login and return JWT
     * @param {string} username
     * @param {string} password
     * @returns {{ token: string, user: Object }}
     * @throws {Error} 401 if credentials are invalid
     */
    async login(username, password) {
        const user = this.userRepository.findByUsername(username);
        if (!user) {
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            throw err;
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            throw err;
        }

        const payload = { id: user.id, username: user.username, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });

        return {
            token,
            user: { id: user.id, username: user.username, role: user.role }
        };
    }

    /**
     * Verify a JWT token
     * @param {string} token
     * @returns {Object} Decoded payload
     * @throws {Error} if token is invalid or expired
     */
    verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
}

module.exports = AuthService;
