/**
 * Auth Module
 * Manages JWT token in localStorage and auth state for the frontend
 */

const TOKEN_KEY = 'devtoolshub_token';
const USER_KEY = 'devtoolshub_user';

/**
 * Get the stored JWT token
 * @returns {string|null}
 */
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store the JWT token and user info
 * @param {string} token
 * @param {Object} user
 */
function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear all auth data (logout)
 */
function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is authenticated (has a token)
 * @returns {boolean}
 */
function isAuthenticated() {
    return !!getToken();
}

/**
 * Get stored user info
 * @returns {Object|null}
 */
function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
}

/**
 * Apply Authorization header to fetch options for mutation requests
 * @param {Object} options - fetch options object
 * @returns {Object} options with Authorization header added
 */
function applyAuthHeader(options = {}) {
    const token = getToken();
    if (!token) return options;

    return {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    };
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    window.location.href = '/login';
}

/**
 * Redirect to login if not authenticated
 */
function redirectIfUnauth() {
    if (!isAuthenticated()) {
        redirectToLogin();
    }
}

/**
 * Handle a 401/403 response — clear auth and redirect to login
 * @param {Response} response - fetch Response object
 * @returns {boolean} true if was unauthorized (caller should stop processing)
 */
function handleUnauthorized(response) {
    if (response.status === 401 || response.status === 403) {
        clearAuth();
        redirectToLogin();
        return true;
    }
    return false;
}

export {
    getToken,
    setAuth,
    clearAuth,
    isAuthenticated,
    getUser,
    applyAuthHeader,
    redirectToLogin,
    redirectIfUnauth,
    handleUnauthorized
};
