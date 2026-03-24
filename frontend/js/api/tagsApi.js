/**
 * Tags API Client
 * API communication for tags management
 */

// Local config - avoids dependency on _CONFIG from app.js
const _TAGS_API_CONFIG = {
    API_BASE_URL: '/api'
};

const TagsAPI = {
    /**
     * Get all tags
     * @returns {Promise<Array>} List of tags
     */
    async getAll() {
        const response = await fetch(`${_TAGS_API_CONFIG.API_BASE_URL}/tags`);
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al obtener los tags');
        }
        const data = await response.json();
        return data.tags || data;
    },

    /**
     * Get a tag by ID
     * @param {number} id - Tag ID
     * @returns {Promise<Object>} Tag object
     */
    async getById(id) {
        const response = await fetch(`${_TAGS_API_CONFIG.API_BASE_URL}/tags/${id}`);
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al obtener el tag');
        }
        const data = await response.json();
        return data.tag || data;
    },

    /**
     * Create a new tag
     * @param {Object} tagData - Tag data { nombre, color }
     * @returns {Promise<Object>} Created tag
     */
    async create(tagData) {
        const response = await fetch(`${_TAGS_API_CONFIG.API_BASE_URL}/tags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tagData)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al crear el tag');
        }
        const data = await response.json();
        return data.tag || data;
    },

    /**
     * Update a tag
     * @param {number} id - Tag ID
     * @param {Object} tagData - Tag data { nombre, color }
     * @returns {Promise<Object>} Updated tag
     */
    async update(id, tagData) {
        const response = await fetch(`${_TAGS_API_CONFIG.API_BASE_URL}/tags/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tagData)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al actualizar el tag');
        }
        const data = await response.json();
        return data.tag || data;
    },

    /**
     * Delete a tag
     * @param {number} id - Tag ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        const response = await fetch(`${_TAGS_API_CONFIG.API_BASE_URL}/tags/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al eliminar el tag');
        }
    },

    /**
     * Get tools associated with a tag
     * @param {number} id - Tag ID
     * @returns {Promise<Array>} List of tools
     */
    async getTools(id) {
        const response = await fetch(`${_TAGS_API_CONFIG.API_BASE_URL}/tags/${id}/tools`);
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al obtener las herramientas del tag');
        }
        const data = await response.json();
        return data.tag?.tools || data.tools || [];
    },

    /**
     * Assign tools to a tag
     * @param {number} id - Tag ID
     * @param {Array<number>} toolIds - Array of tool IDs
     * @returns {Promise<void>}
     */
    async setTools(id, toolIds) {
        const response = await fetch(`${_TAGS_API_CONFIG.API_BASE_URL}/tags/${id}/tools`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ toolIds })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al asignar herramientas al tag');
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TagsAPI;
}