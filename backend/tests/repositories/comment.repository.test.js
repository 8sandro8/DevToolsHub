/**
 * Unit Tests - CommentRepository
 */

const { createTestDb } = require('../setup');
const { fullSeed } = require('../fixtures/seed');
const CommentRepository = require('../../src/repositories/comment.repository');

describe('CommentRepository', () => {
    let db;
    let repository;

    beforeEach(() => {
        db = createTestDb();
        repository = new CommentRepository(db);
        fullSeed(db);
    });

    afterEach(() => {
        db.close();
    });

    it('normalizes SQLite timestamps when returning comments', () => {
        db.prepare(`
            INSERT INTO tool_comment (tool_id, autor, contenido, fecha_creacion)
            VALUES (?, ?, ?, ?)
        `).run(1, 'testadmin', 'Comentario antiguo', '2026-03-28 10:00:00');

        const comments = repository.findByToolId(1);

        expect(comments).toHaveLength(1);
        expect(comments[0].fecha_creacion).toBe('2026-03-28T10:00:00Z');
    });

    it('normalizes ISO-like timestamps without timezone', () => {
        db.prepare(`
            INSERT INTO tool_comment (tool_id, autor, contenido, fecha_creacion)
            VALUES (?, ?, ?, ?)
        `).run(1, 'testadmin', 'Comentario ISO', '2026-03-28T10:00:00');

        const comments = repository.findByToolId(1);

        expect(comments).toHaveLength(1);
        expect(comments[0].fecha_creacion).toBe('2026-03-28T10:00:00Z');
    });

    it('returns ISO timestamps for newly created comments', () => {
        const comment = repository.create(1, 'testadmin', 'Comentario nuevo');

        expect(comment).toBeDefined();
        expect(comment.fecha_creacion).toMatch(/T.*Z$/);
    });

    it('updates a comment by tool and id', () => {
        const created = repository.create(1, 'testadmin', 'Comentario original');

        const updated = repository.updateByIdAndToolId(created.id, 1, 'Comentario editado');

        expect(updated).toBeDefined();
        expect(updated.contenido).toBe('Comentario editado');
        expect(updated.autor).toBe('testadmin');
    });

    it('deletes a comment by tool and id', () => {
        const created = repository.create(1, 'testadmin', 'Comentario a borrar');

        const deleted = repository.deleteByIdAndToolId(created.id, 1);

        expect(deleted).toBe(true);
        expect(repository.findByIdAndToolId(created.id, 1)).toBeNull();
    });
});
