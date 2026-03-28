/**
 * Integration Tests - Tags API
 * Tests for REST API endpoints using supertest
 */

const request = require('supertest');
const { createTestApp, createTestDb, getAuthToken } = require('../setup');
const { fullSeed } = require('../fixtures/seed');

describe('Tags API Integration', () => {
    let app;
    let db;
    let authToken;

    beforeAll(async () => {
        db = createTestDb();
        app = createTestApp(db);
        authToken = await getAuthToken(app);
    });

    afterAll(() => {
        if (db) {
            db.close();
        }
    });

    beforeEach(() => {
        db.prepare('DELETE FROM tool_tag').run();
        db.prepare('DELETE FROM tool_category').run();
        db.prepare('DELETE FROM tool').run();
        db.prepare('DELETE FROM category').run();
        db.prepare('DELETE FROM tag').run();
        try {
            db.exec("UPDATE sqlite_sequence SET seq = 0 WHERE name IN ('tool', 'category', 'tag', 'tool_category')");
        } catch {}
        fullSeed(db);
    });

    describe('GET /api/tags', () => {
        it('should return 200 with tags list', async () => {
            const response = await request(app).get('/api/tags');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('tags');
            expect(Array.isArray(response.body.tags)).toBe(true);
            expect(response.body.tags.length).toBe(4);
        });
    });

    describe('POST /api/tags/:id/tools', () => {
        it('should assign a tool to a tag and return the updated association on read', async () => {
            const mutationResponse = await request(app)
                .post('/api/tags/1/tools')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ toolId: 3 });

            expect(mutationResponse.status).toBe(200);
            expect(mutationResponse.body.message).toBe('Herramienta asignada al tag');

            const readResponse = await request(app).get('/api/tags/1/tools');

            expect(readResponse.status).toBe(200);
            expect(readResponse.body.tag).toBeDefined();
            expect(Array.isArray(readResponse.body.tag.tools)).toBe(true);
            expect(readResponse.body.tag.tools).toHaveLength(2);
            expect(readResponse.body.tag.tools.some(tool => tool.nombre === 'GitHub')).toBe(true);
        });
    });
});
