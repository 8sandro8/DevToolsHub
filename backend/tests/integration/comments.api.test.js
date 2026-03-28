/**
 * Integration Tests - Comments API
 */

const request = require('supertest');
const { createTestApp, createTestDb, getAuthToken, resetDb } = require('../setup');
const { fullSeed } = require('../fixtures/seed');

jest.setTimeout(30000);

describe('Comments API Integration', () => {
    let app;
    let db;
    let authToken;

    beforeAll(async () => {
        db = createTestDb();
        app = createTestApp(db);
        authToken = await getAuthToken(app);
    });

    afterAll(() => {
        if (db) db.close();
    });

    beforeEach(() => {
        resetDb(db);
        fullSeed(db);
    });

    describe('GET /api/tools/:id/comments', () => {
        it('returns an empty list when there are no comments', async () => {
            const response = await request(app).get('/api/tools/1/comments');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.comments)).toBe(true);
            expect(response.body.comments).toHaveLength(0);
        });

        it('returns 404 for a missing tool', async () => {
            const response = await request(app).get('/api/tools/999/comments');

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/tools/:id/comments', () => {
        it('creates a comment with auth', async () => {
            const createResponse = await request(app)
                .post('/api/tools/1/comments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ contenido: 'Muy buena herramienta para desarrollo.' });

            expect(createResponse.status).toBe(201);
            expect(createResponse.body.comment).toBeDefined();
            expect(createResponse.body.comment.autor).toBe('testadmin');
            expect(createResponse.body.comment.contenido).toBe('Muy buena herramienta para desarrollo.');

            const listResponse = await request(app).get('/api/tools/1/comments');
            expect(listResponse.status).toBe(200);
            expect(listResponse.body.comments).toHaveLength(1);
        });

        it('rejects unauthenticated comment creation', async () => {
            const response = await request(app)
                .post('/api/tools/1/comments')
                .send({ contenido: 'Sin token' });

            expect(response.status).toBe(401);
        });

        it('rejects empty comment content', async () => {
            const response = await request(app)
                .post('/api/tools/1/comments')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ contenido: '   ' });

            expect(response.status).toBe(400);
        });
    });
});
