/**
 * Integration Tests - Tools API
 * Tests for REST API endpoints using supertest
 */

const request = require('supertest');
const { createTestApp, createTestDb } = require('../setup');
const { fullSeed } = require('../fixtures/seed');

describe('Tools API Integration', () => {
    let app;
    let db;

    beforeAll(() => {
        db = createTestDb();
        app = createTestApp(db);
    });

    afterAll(() => {
        if (db) {
            db.close();
        }
    });

    beforeEach(() => {
        // Clean and reseed before each test
        db.prepare('DELETE FROM tool_category').run();
        db.prepare('DELETE FROM tool').run();
        db.prepare('DELETE FROM category').run();
        // Reset auto-increment counters properly
        db.exec("UPDATE sqlite_sequence SET seq = 0 WHERE name IN ('tool', 'category', 'tool_category')");
        fullSeed(db);
    });

    describe('GET /api/tools', () => {
        it('should return 200 with data, total, page, limit', async () => {
            // Act
            const response = await request(app).get('/api/tools');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('page');
            expect(response.body).toHaveProperty('limit');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.total).toBe(3);
        });

        it('should support pagination query params', async () => {
            // Act
            const response = await request(app).get('/api/tools?page=1&limit=2');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(2);
            expect(response.body.page).toBe(1);
            expect(response.body.limit).toBe(2);
        });

        it('should filter by favorite', async () => {
            // Act
            const response = await request(app).get('/api/tools?favorito=true');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.data.every(t => t.es_favorito === 1)).toBe(true);
        });
    });

    describe('GET /api/tools/:id', () => {
        it('should return 200 for valid tool ID', async () => {
            // Act
            const response = await request(app).get('/api/tools/1');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.tool).toBeDefined();
            expect(response.body.tool.nombre).toBe('VS Code');
        });

        it('should return 404 for non-existent tool ID', async () => {
            // Act
            const response = await request(app).get('/api/tools/999');

            // Assert
            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it('should return tool with categories', async () => {
            // Act
            const response = await request(app).get('/api/tools/1');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.tool).toHaveProperty('categories');
            expect(Array.isArray(response.body.tool.categories)).toBe(true);
        });
    });

    describe('POST /api/tools', () => {
        it('should return 201 for valid tool creation', async () => {
            // Arrange
            const newTool = {
                nombre: 'New Tool',
                descripcion: 'A new testing tool',
                url: 'https://newtool.example.com',
                rating: 4
            };

            // Act
            const response = await request(app).post('/api/tools').send(newTool);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.tool).toBeDefined();
            expect(response.body.tool.nombre).toBe('New Tool');
            expect(response.body.tool.id).toBeDefined();
        });

        it('should return 400 for missing required field', async () => {
            // Arrange - missing nombre
            const newTool = {
                descripcion: 'No name provided'
            };

            // Act
            const response = await request(app).post('/api/tools').send(newTool);

            // Assert
            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/tools/:id', () => {
        it('should update and return 200', async () => {
            // Arrange
            const updateData = {
                nombre: 'VS Code Updated',
                descripcion: 'Updated description'
            };

            // Act
            const response = await request(app).put('/api/tools/1').send(updateData);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.tool.nombre).toBe('VS Code Updated');
            expect(response.body.tool.descripcion).toBe('Updated description');
        });

        it('should return 404 for non-existent tool', async () => {
            // Act
            const response = await request(app).put('/api/tools/999').send({ nombre: 'Ghost' });

            // Assert
            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/tools/:id', () => {
        it('should soft-delete tool and return 200', async () => {
            // Act
            const response = await request(app).delete('/api/tools/1');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.message).toBeDefined();

            // Verify soft delete - es_archivado should be 1
            const archived = db.prepare('SELECT es_archivado FROM tool WHERE id = 1').get();
            expect(archived.es_archivado).toBe(1);
        });

        it('should return 200 even for non-existent ID (idempotent)', async () => {
            // Act
            const response = await request(app).delete('/api/tools/999');

            // Assert - API returns 200 for idempotent delete
            expect(response.status).toBe(200);
        });
    });

    describe('PATCH /api/tools/:id/favorito', () => {
        it('should toggle favorite status', async () => {
            // Arrange
            const initial = db.prepare('SELECT es_favorito FROM tool WHERE id = 1').get();
            const initialState = initial.es_favorito;

            // Act
            const response = await request(app).patch('/api/tools/1/favorito');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.tool.es_favorito).toBe(initialState === 1 ? 0 : 1);
        });

        it('should return 404 for non-existent tool', async () => {
            // Act
            const response = await request(app).patch('/api/tools/999/favorito');

            // Assert
            expect(response.status).toBe(404);
        });
    });
});
