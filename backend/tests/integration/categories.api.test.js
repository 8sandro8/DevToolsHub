/**
 * Integration Tests - Categories API
 * Tests for REST API endpoints using supertest
 */

const request = require('supertest');
const { createTestApp, createTestDb, getAuthToken } = require('../setup');
const { seedCategories, fullSeed } = require('../fixtures/seed');

describe('Categories API Integration', () => {
    let app;
    let db;
    let authToken;

    beforeAll(async () => {
        db = createTestDb();
        app = createTestApp(db);
        // Get auth token for mutation tests
        authToken = await getAuthToken(app);
    });

    afterAll(() => {
        if (db) {
            db.close();
        }
    });

    beforeEach(() => {
        // Clean and reseed before each test
        db.prepare('DELETE FROM tool_tag').run();
        db.prepare('DELETE FROM tool_category').run();
        db.prepare('DELETE FROM tool').run();
        db.prepare('DELETE FROM category').run();
        db.prepare('DELETE FROM tag').run();
        // Reset auto-increment counters properly
        try {
            db.exec("UPDATE sqlite_sequence SET seq = 0 WHERE name IN ('tool', 'category', 'tag', 'tool_category')");
        } catch {}
        fullSeed(db);
    });

    describe('GET /api/categories', () => {
        it('should return 200 with categories list', async () => {
            // Act
            const response = await request(app).get('/api/categories');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('categories');
            expect(Array.isArray(response.body.categories)).toBe(true);
            expect(response.body.categories.length).toBe(4);
        });
    });

    describe('POST /api/categories', () => {
        it('should return 201 for valid category creation', async () => {
            // Arrange
            const newCategory = {
                nombre: 'Nueva Categoría',
                descripcion: 'Descripción de prueba',
                color: '#ff0000'
            };

            // Act — requires auth token
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newCategory);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.category).toBeDefined();
            expect(response.body.category.nombre).toBe('Nueva Categoría');
        });

        it('should return 400 for missing required field', async () => {
            // Arrange - missing nombre
            const newCategory = {
                descripcion: 'Sin nombre'
            };

            // Act — requires auth token
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newCategory);

            // Assert
            expect(response.status).toBe(400);
        });

        it('should return 400 for name too long', async () => {
            // Arrange - nombre too long (max 100)
            const newCategory = {
                nombre: 'A'.repeat(101)
            };

            // Act — requires auth token
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newCategory);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('PUT /api/categories/:id', () => {
        it('should update and return 200', async () => {
            // Arrange
            const updateData = {
                nombre: 'Desarrollo Web Actualizado',
                descripcion: 'Nueva descripción'
            };

            // Act — requires auth token
            const response = await request(app)
                .put('/api/categories/1')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.category.nombre).toBe('Desarrollo Web Actualizado');
            expect(response.body.category.descripcion).toBe('Nueva descripción');
        });

        it('should return 404 for non-existent category', async () => {
            // Act — requires auth token
            const response = await request(app)
                .put('/api/categories/999')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ nombre: 'Ghost' });

            // Assert
            expect(response.status).toBe(404);
        });

        it('should return 400 for name too long', async () => {
            // Arrange - nombre too long (max 100)
            const updateData = {
                nombre: 'A'.repeat(101)
            };

            // Act — requires auth token
            const response = await request(app)
                .put('/api/categories/1')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            // Assert
            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/categories/:id', () => {
        it('should delete category and return 200', async () => {
            // Act — requires auth token
            const response = await request(app)
                .delete('/api/categories/1')
                .set('Authorization', `Bearer ${authToken}`);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.message).toBeDefined();
        });
    });
});
