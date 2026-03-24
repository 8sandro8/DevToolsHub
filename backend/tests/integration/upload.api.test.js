/**
 * Integration Tests - Upload API
 * Tests for image upload endpoints
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { createTestApp, createTestDb, getAuthToken } = require('../setup');
const { fullSeed } = require('../fixtures/seed');

describe('Upload API Integration', () => {
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
        db.prepare('DELETE FROM tool_category').run();
        db.prepare('DELETE FROM tool').run();
        db.prepare('DELETE FROM category').run();
        // Reset auto-increment counters properly
        try {
            db.exec("UPDATE sqlite_sequence SET seq = 0 WHERE name IN ('tool', 'category', 'tool_category')");
        } catch {}
        fullSeed(db);
    });

    describe('POST /api/tools/:id/image', () => {
        it('should upload image successfully with authentication', async () => {
            // Arrange - create a test image buffer
            const testImageBuffer = Buffer.from('fake image data');
            
            // Act
            const response = await request(app)
                .post('/api/tools/1/image')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', testImageBuffer, 'test-image.png');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('image_url');
            expect(response.body.image_url).toContain('/uploads/');
            expect(response.body).toHaveProperty('tool');
        });

        it('should return 401 without authentication', async () => {
            // Arrange - create a test image buffer
            const testImageBuffer = Buffer.from('fake image data');
            
            // Act
            const response = await request(app)
                .post('/api/tools/1/image')
                .attach('image', testImageBuffer, 'test-image.png');

            // Assert
            expect(response.status).toBe(401);
        });

        it('should return 400 when no image is provided', async () => {
            // Act
            const response = await request(app)
                .post('/api/tools/1/image')
                .set('Authorization', `Bearer ${authToken}`);

            // Assert
            expect(response.status).toBe(400);
        });

        it('should return 404 for non-existent tool', async () => {
            // Arrange - create a test image buffer
            const testImageBuffer = Buffer.from('fake image data');
            
            // Act
            const response = await request(app)
                .post('/api/tools/999/image')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', testImageBuffer, 'test-image.png');

            // Assert
            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/tools/:id/image', () => {
        it('should delete image successfully with authentication', async () => {
            // First upload an image to the tool
            const testImageBuffer = Buffer.from('fake image data');
            await request(app)
                .post('/api/tools/1/image')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', testImageBuffer, 'test-image.png');

            // Verify image was uploaded
            let tool = db.prepare('SELECT image_url FROM tool WHERE id = 1').get();
            expect(tool.image_url).toBeTruthy();

            // Act - delete the image
            const response = await request(app)
                .delete('/api/tools/1/image')
                .set('Authorization', `Bearer ${authToken}`);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Imagen eliminada correctamente');
            
            // Verify image_url is null
            tool = db.prepare('SELECT image_url FROM tool WHERE id = 1').get();
            expect(tool.image_url).toBeNull();
        });

        it('should return 401 without authentication', async () => {
            // Act
            const response = await request(app)
                .delete('/api/tools/1/image');

            // Assert
            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent tool', async () => {
            // Act
            const response = await request(app)
                .delete('/api/tools/999/image')
                .set('Authorization', `Bearer ${authToken}`);

            // Assert
            expect(response.status).toBe(404);
        });
    });
});
