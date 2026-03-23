/**
 * Category Routes
 * REST API endpoints for categories
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Factory function que crea las rutas
const createCategoryRoutes = (db) => {
    
    // GET /api/categories - Listar todas las categorías
    router.get('/', (req, res, next) => {
        try {
            const categories = db.prepare('SELECT * FROM category ORDER BY nombre').all();
            res.json({ categories });
        } catch (error) {
            next(error);
        }
    });

    // POST /api/categories - Crear nueva categoría
    router.post('/',
        [body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')],
        (req, res, next) => {
            try {
                const { nombre, color } = req.body;
                const result = db.prepare('INSERT INTO category (nombre, color) VALUES (?, ?)').run(nombre, color || '#6b7280');
                const category = db.prepare('SELECT * FROM category WHERE id = ?').get(result.lastInsertRowid);
                res.status(201).json({ category });
            } catch (error) {
                if (error.message.includes('UNIQUE constraint')) {
                    return res.status(400).json({ error: 'La categoría ya existe' });
                }
                next(error);
            }
        }
    );

    // DELETE /api/categories/:id - Eliminar categoría
    router.delete('/:id', (req, res, next) => {
        try {
            db.prepare('DELETE FROM category WHERE id = ?').run(req.params.id);
            res.json({ message: 'Categoría eliminada' });
        } catch (error) {
            next(error);
        }
    });

    return router;
};

module.exports = createCategoryRoutes;