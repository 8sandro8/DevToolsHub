/**
 * Express Application Configuration
 * Core middleware and routing setup
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const createToolRoutes = require('./routes/tool.routes');
const createCategoryRoutes = require('./routes/category.routes');
const createTagRoutes = require('./routes/tag.routes');
const createAuthRoutes = require('./routes/auth.routes');
const { authenticateToken } = require('./middleware/auth.middleware');
const db = require('./config/database');
const { UPLOADS_DIR } = require('./config/paths');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// Static files - Frontend
const frontendPath = path.resolve(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendPath));

// Static files - Uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Root route - TEST
app.get('/test', (req, res) => {
    res.send('TEST OK');
});

// Root route
app.get('/', (req, res) => {
    console.log('Serving index.html from:', frontendPath);
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/detalle', (req, res) => {
    res.sendFile(path.join(frontendPath, 'detalle.html'));
});

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

app.get('/api', (req, res) => {
    res.json({
        name: 'DevToolsHub API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            tools: '/api/tools',
            categories: '/api/categories',
            tags: '/api/tags'
        }
    });
});

// Auth routes (public — no middleware)
app.use('/api/auth', createAuthRoutes(db));

// Protected mutation middleware — applies only to POST, PUT, PATCH, DELETE
const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
const protectMutations = (req, res, next) => {
    if (mutationMethods.includes(req.method)) {
        return authenticateToken(req, res, next);
    }
    next();
};

// API Routes with selective auth protection
app.use('/api/tools', protectMutations, createToolRoutes(db));
app.use('/api/categories', protectMutations, createCategoryRoutes(db));
app.use('/api/tags', protectMutations, createTagRoutes(db));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
});

// Error handler (4 params = error middleware)
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message);
    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
    });
});

module.exports = app;
