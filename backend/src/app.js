/**
 * Express Application Configuration
 * Core middleware and routing setup
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const createToolRoutes = require('./routes/tool.routes');
const createCategoryRoutes = require('./routes/category.routes');
const createTagRoutes = require('./routes/tag.routes');
const db = require('./config/database');

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
            tools: '/api/tools',
            categories: '/api/categories',
            tags: '/api/tags'
        }
    });
});

// API Routes
app.use('/api/tools', createToolRoutes(db));
app.use('/api/categories', createCategoryRoutes(db));
app.use('/api/tags', createTagRoutes(db));

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