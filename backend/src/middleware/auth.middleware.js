/**
 * Auth Middleware
 * Verifies JWT Bearer token on protected routes
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware that verifies the JWT token in the Authorization header.
 * Injects req.user with the decoded payload on success.
 * Returns 401 if no token, 403 if token is invalid or expired.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { authenticateToken };
