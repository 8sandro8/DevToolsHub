/**
 * Integration Tests - GitHub Stats API
 * Tests for REST API endpoints using supertest
 */

const request = require('supertest');
const { createTestApp, createTestDb, getAuthToken } = require('../setup');
const { fullSeed } = require('../fixtures/seed');

jest.setTimeout(30000);

describe('GitHub Stats API Integration', () => {
    let app;
    let db;
    let authToken;
    let originalFetch;

    beforeAll(async () => {
        originalFetch = global.fetch;
        db = createTestDb();
        app = createTestApp(db);
        authToken = await getAuthToken(app);
    }, 30000);

    afterAll(() => {
        if (db) {
            db.close();
        }
        global.fetch = originalFetch;
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

    describe('GET /api/tools/:id/github-stats', () => {
        it('should return formatted GitHub stats for a valid repo URL', async () => {
            global.fetch = jest.fn(async (requestUrl) => {
                expect(requestUrl).toBe('https://api.github.com/repos/vercel/next.js');

                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        stargazers_count: 12345,
                        forks_count: 678,
                        pushed_at: '2026-03-20T12:00:00Z',
                        full_name: 'vercel/next.js',
                        description: 'React framework',
                        html_url: 'https://github.com/vercel/next.js'
                    })
                };
            });

            try {
                const createResponse = await request(app)
                    .post('/api/tools')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        nombre: 'Next.js Repo',
                        descripcion: 'Repo de prueba',
                        url: 'https://github.com/vercel/next.js',
                        rating: 5
                    });

                expect(createResponse.status).toBe(201);

                const statsResponse = await request(app).get(`/api/tools/${createResponse.body.tool.id}/github-stats`);

                expect(statsResponse.status).toBe(200);
                expect(statsResponse.body).toMatchObject({
                    stars: 12345,
                    starsFormatted: '12.3k',
                    forks: 678,
                    forksFormatted: '678',
                    lastCommit: '2026-03-20T12:00:00Z',
                    repoName: 'vercel/next.js',
                    url: 'https://github.com/vercel/next.js'
                });
                expect(global.fetch).toHaveBeenCalledTimes(1);
            } finally {
                global.fetch = originalFetch;
            }
        });
    });
});
