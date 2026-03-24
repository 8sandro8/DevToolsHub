/**
 * Category Routes
 * REST API endpoints for categories
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');

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
        [
            body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
                .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
            body('descripcion').optional().trim()
                .isLength({ max: 300 }).withMessage('La descripción no puede exceder 300 caracteres'),
        ],
        validate,
        (req, res, next) => {
            try {
                const { nombre, descripcion, color } = req.body;
                const result = db.prepare('INSERT INTO category (nombre, descripcion, color) VALUES (?, ?, ?)').run(
                    nombre, 
                    descripcion || null, 
                    color || '#6b7280'
                );
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

    // PUT /api/categories/:id - Actualizar categoría
    router.put('/:id',
        [
            body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío')
                .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
            body('descripcion').optional().trim()
                .isLength({ max: 300 }).withMessage('La descripción no puede exceder 300 caracteres'),
        ],
        validate,
        (req, res, next) => {
            try {
                const { nombre, descripcion, color } = req.body;
                const existing = db.prepare('SELECT * FROM category WHERE id = ?').get(req.params.id);
                if (!existing) {
                    return res.status(404).json({ error: 'Categoría no encontrada' });
                }
                db.prepare(`
                    UPDATE category 
                    SET nombre = COALESCE(?, nombre), 
                        descripcion = COALESCE(?, descripcion),
                        color = COALESCE(?, color)
                    WHERE id = ?
                `).run(nombre, descripcion, color, req.params.id);
                const category = db.prepare('SELECT * FROM category WHERE id = ?').get(req.params.id);
                res.json({ category });
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