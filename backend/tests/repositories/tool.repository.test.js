/**
 * Unit Tests - ToolRepository
 * Tests for data access layer
 */

const { createTestDb } = require('../setup');
const ToolRepository = require('../../src/repositories/tool.repository');
const { seedCategories, seedTools, seedToolCategories, fullSeed } = require('../fixtures/seed');

describe('ToolRepository', () => {
    let db;
    let repository;

    beforeEach(() => {
        db = createTestDb();
        repository = new ToolRepository(db);
    });

    afterEach(() => {
        db.close();
    });

    describe('findWithFilters()', () => {
        it('should return all tools without filters', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = repository.findWithFilters({});
            
            // Assert
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('page');
            expect(result).toHaveProperty('limit');
            expect(result.data.length).toBe(3);
            expect(result.total).toBe(3);
        });

        it('should return paginated results', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = repository.findWithFilters({ page: 1, limit: 2 });
            
            // Assert
            expect(result.data.length).toBe(2);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(2);
            expect(result.totalPages).toBe(2);
        });

        it('should return second page correctly', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = repository.findWithFilters({ page: 2, limit: 2 });
            
            // Assert
            expect(result.data.length).toBe(1);
            expect(result.page).toBe(2);
        });

        it('should filter by favorite', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = repository.findWithFilters({ favorito: true });
            
            // Assert
            expect(result.data.length).toBe(2); // VS Code and GitHub are favorites
            expect(result.data.every(t => t.es_favorito === 1)).toBe(true);
        });

        it('should filter by category', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = repository.findWithFilters({ categoria: 'Desarrollo Web' });
            
            // Assert
            expect(result.data.length).toBe(3); // All tools have Desarrollo Web
        });
    });

    describe('getCategories()', () => {
        it('should return categories for a tool', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            const result = repository.getCategories(1); // VS Code
            
            // Assert
            expect(result.length).toBe(2);
            expect(result.map(c => c.nombre)).toContain('Desarrollo Web');
            expect(result.map(c => c.nombre)).toContain('Testing');
        });

        it('should return empty array for tool without categories', () => {
            // Arrange
            seedCategories(db);
            const toolId = db.prepare('INSERT INTO tool (nombre) VALUES (?)').run('Orphan Tool').lastInsertRowid;
            
            // Act
            const result = repository.getCategories(toolId);
            
            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('setCategories()', () => {
        it('should replace categories for a tool', () => {
            // Arrange
            fullSeed(db);
            // VS Code initially has Desarrollo Web (1) and Testing (3)
            
            // Act - change to only Base de Datos (2)
            repository.setCategories(1, [2]);
            
            // Assert
            const result = repository.getCategories(1);
            expect(result.length).toBe(1);
            expect(result[0].nombre).toBe('Base de Datos');
        });

        it('should clear all categories when empty array provided', () => {
            // Arrange
            fullSeed(db);
            
            // Act
            repository.setCategories(1, []);
            
            // Assert
            const result = repository.getCategories(1);
            expect(result).toEqual([]);
        });
    });
});
