/**
 * DevToolsHub Server Entry Point
 * Starts Express server on configured port
 */

const app = require('./app');
const db = require('./config/database');

// Configuration
const PORT = process.env.PORT || 4001;
const HOST = process.env.HOST || '0.0.0.0';

// ============================================
// SERVER STARTUP
// ============================================

const server = app.listen(PORT, HOST, () => {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║         DevToolsHub API Server             ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  Status:    ✅ Running                     ║`);
    console.log(`║  Port:      ${PORT.toString().padEnd(32)}║`);
    console.log(`║  Host:      ${HOST.padEnd(32)}║`);
    console.log(`║  Env:       ${(process.env.NODE_ENV || 'development').padEnd(32)}║`);
    console.log(`║  Database:  ${db.name.padEnd(32)}║`);
    console.log('╚════════════════════════════════════════════╝');
    console.log(`\n📡 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check at http://localhost:${PORT}/health`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    server.close(() => {
        console.log('HTTP server closed');
        
        // Close database connection
        try {
            db.close();
            console.log('Database connection closed');
        } catch (err) {
            console.error('Error closing database:', err.message);
        }
        
        console.log('Graceful shutdown completed');
        process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = server;
