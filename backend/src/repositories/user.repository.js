/**
 * User Repository
 * Data access layer for user table
 */

class UserRepository {
    constructor(db) {
        this.db = db;
    }

    /**
     * Find a user by username
     * @param {string} username
     * @returns {Object|undefined}
     */
    findByUsername(username) {
        return this.db.prepare('SELECT * FROM user WHERE username = ?').get(username);
    }

    /**
     * Find a user by ID
     * @param {number} id
     * @returns {Object|undefined}
     */
    findById(id) {
        return this.db.prepare('SELECT id, username, role, created_at FROM user WHERE id = ?').get(id);
    }

    /**
     * Create a new user
     * @param {string} username
     * @param {string} passwordHash
     * @param {string} role
     * @returns {Object} Created user (without password_hash)
     */
    create(username, passwordHash, role = 'admin') {
        const stmt = this.db.prepare(
            'INSERT INTO user (username, password_hash, role) VALUES (?, ?, ?)'
        );
        const result = stmt.run(username, passwordHash, role);
        return this.findById(result.lastInsertRowid);
    }
}

module.exports = UserRepository;
