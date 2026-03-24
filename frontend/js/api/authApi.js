/**
 * Auth API Client
 * Fetch wrappers for /api/auth endpoints
 */

const API_BASE = '/api/auth';

/**
 * Login with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{token: string, user: Object}>}
 */
async function login(username, password) {
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
}

/**
 * Register a new user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} Created user
 */
async function register(username, password) {
    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
}

export { login, register };
