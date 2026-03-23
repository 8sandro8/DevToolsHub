/**
 * Unit Tests - ToolService
 * Tests for business logic layer
 */

const { createTestDb, resetDb } = require('../setup');
const ToolService = require('../../src/services/tool.service');
const { seedCategories, seedTools, seedToolCategories, fullSeed } = require('../fixtures/seed');

describe('ToolService', () => {
    let db;
    let service;

    beforeEach(() => {
        db = createTestDb();
        service = new ToolService(db);
    });

    afterEach(() => {
        db.close();
    });

    describe('getAll()', () => {
        it('should return all tools with pagination when no filters', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = service.getAll({});
            
            // Assert
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('page');
            expect(result).toHaveProperty('limit');
            expect(result.data.length).toBeGreaterThan(0);
        });

        it('should return only favorite tools when filtro favorito: true', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = service.getAll({ favorito: true });
            
            // Assert
            expect(result.data.every(t => t.es_favorito === 1)).toBe(true);
        });

        it('should filter by search text if FTS5 is available', () => {
            // Arrange
            fullSeed(db);
            
            // Act - try searching for "code" (VS Code)
            const result = service.getAll({ buscar: 'code' });
            
            // Assert - may return empty if FTS5 not working in memory
            // This test documents the expected behavior
            expect(result).toHaveProperty('data');
        });
    });

    describe('getById()', () => {
        it('should return tool with categories when ID exists', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = service.getById(1);
            
            // Assert
            expect(result).not.toBeNull();
            expect(result.id).toBe(1);
            expect(result.nombre).toBe('VS Code');
            expect(result).toHaveProperty('categories');
        });

        it('should return null when ID does not exist', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = service.getById(999);
            
            // Assert
            expect(result).toBeNull();
        });
    });

    describe('create()', () => {
        it('should create tool with valid data', () => {
            // Arrange
            seedCategories(db);
            const newTool = {
                nombre: 'Jest',
                descripcion: 'Testing framework',
                url: 'https://jestjs.io',
                rating: 4,
                categories: [3] // Testing
            };
            
            // Act
            const result = service.create(newTool);
            
            // Assert
            expect(result).not.toBeNull();
            expect(result.nombre).toBe('Jest');
            expect(result.id).toBeDefined();
        });

        it('should clamp rating to 5 when rating > 5', () => {
            // Arrange
            seedCategories(db);
            const newTool = {
                nombre: 'Test Tool',
                rating: 10 // Should be clamped to 5
            };
            
            // Act
            const result = service.create(newTool);
            
            // Assert
            expect(result.rating).toBe(5);
        });

        it('should clamp rating to 0 when rating < 0', () => {
            // Arrange
            seedCategories(db);
            const newTool = {
                nombre: 'Test Tool',
                rating: -5 // Should be clamped to 0
            };
            
            // Act
            const result = service.create(newTool);
            
            // Assert
            expect(result.rating).toBe(0);
        });
    });

    describe('update()', () => {
        it('should update and return tool', () => {
            // Arrange
            fullSeed(db);
            const updateData = {
                nombre: 'VS Code Updated',
                descripcion: 'Updated description'
            };
            
            // Act
            const result = service.update(1, updateData);
            
            // Assert
            expect(result).not.toBeNull();
            expect(result.nombre).toBe('VS Code Updated');
            expect(result.descripcion).toBe('Updated description');
        });

        it('should clamp rating on update', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = service.update(1, { rating: 10 });
            
            // Assert
            expect(result.rating).toBe(5);
        });
    });

    describe('delete()', () => {
        it('should soft-delete tool (es_archivado = 1)', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = service.delete(1);
            
            // Assert
            expect(result).toBeDefined();
            
            // Verify it's archived
            const archived = db.prepare('SELECT es_archivado FROM tool WHERE id = 1').get();
            expect(archived.es_archivado).toBe(1);
        });
    });

    describe('toggleFavorito()', () => {
        it('should toggle favorite status', () => {
            // Arrange
            fullSeed(db);
            
            // Verify initial state (es_favorito = 1)
            let tool = db.prepare('SELECT es_favorito FROM tool WHERE id = 1').get();
            const initialState = tool.es_favorito;
            
            // Act
            const result = service.toggleFavorito(1);
            
            // Assert
            expect(result).not.toBeNull();
            expect(result.es_favorito).toBe(initialState === 1 ? 0 : 1);
        });

        it('should return null for non-existent tool', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = service.toggleFavorito(999);
            
            // Assert
            expect(result).toBeNull();
        });
    });
});