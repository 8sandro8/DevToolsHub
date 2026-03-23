/**
 * Base Repository
 * Generic CRUD operations for all database tables
 */

class BaseRepository {
    constructor(db, tableName) {
        this.db = db;
        this.tableName = tableName;
    }

    findAll(where = '', params = []) {
        const sql = where ? `SELECT * FROM ${this.tableName} WHERE ${where}` : `SELECT * FROM ${this.tableName}`;
        return this.db.prepare(sql).all(...params);
    }

    findById(id) {
        const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        return this.db.prepare(sql).get(id);
    }

    create(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
        const result = this.db.prepare(sql).run(...values);
        return this.findById(result.lastInsertRowid);
    }

    update(id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const sql = `UPDATE ${this.tableName} SET ${setClause}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?`;
        this.db.prepare(sql).run(...values, id);
        return this.findById(id);
    }

    delete(id) {
        const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
        return this.db.prepare(sql).run(id);
    }
}

module.exports = BaseRepository;