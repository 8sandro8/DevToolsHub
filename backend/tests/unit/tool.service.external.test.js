const { createTestDb, resetDb } = require('../setup');
const { fullSeed } = require('../fixtures/seed');
const ToolService = require('../../src/services/tool.service');

describe('ToolService external catalog enrichment', () => {
    let db;
    let service;
    let originalFetch;

    const mockWikipediaFetch = async (requestUrl) => {
        const parsed = new URL(requestUrl);
        const rawTitle = decodeURIComponent(parsed.pathname.split('/').pop() || 'Wikipedia');
        const title = rawTitle.replace(/_/g, ' ');

        return {
            ok: true,
            status: 200,
            json: async () => ({
                title,
                extract: `Resumen externo de ${title}`,
                content_urls: {
                    desktop: {
                        page: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
                    }
                },
                thumbnail: {
                    source: `https://upload.wikimedia.org/${encodeURIComponent(title)}.png`
                }
            })
        };
    };

    beforeAll(() => {
        originalFetch = global.fetch;
        global.fetch = jest.fn(mockWikipediaFetch);
    });

    beforeEach(() => {
        db = createTestDb();
        resetDb(db);
        fullSeed(db);
        service = new ToolService(db);
    });

    afterEach(() => {
        if (db) {
            db.close();
        }
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    it('enriches the list response without breaking filters or pagination', async () => {
        const result = await service.getAll({ categoria: 1, page: 1, limit: 10 });

        expect(result.total).toBeGreaterThan(0);
        expect(result.data[0]).toHaveProperty('external_source', 'Wikipedia');
        expect(result.data[0]).toHaveProperty('external_summary');
        expect(result.data[0]).toHaveProperty('external_thumbnail');
    });

});
