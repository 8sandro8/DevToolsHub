/**
 * DevToolsHub - Frontend Application
 * ES6+ Vanilla JavaScript with Bootstrap 5
 */

import { initThemeToggle } from './theme.js';

// ============================================
// Auth helpers (inline — no module import needed)
// ============================================
const _Auth = {
    TOKEN_KEY: 'devtoolshub_token',
    USER_KEY: 'devtoolshub_user',

    getToken() { return localStorage.getItem(this.TOKEN_KEY); },
    getUser() {
        try { return JSON.parse(localStorage.getItem(this.USER_KEY)); } catch { return null; }
    },
    isAuthenticated() { return !!this.getToken(); },
    clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    },
    redirectToLogin() { window.location.href = '/login'; },
    handleUnauthorized(status) {
        if (status === 401 || status === 403) {
            this.clearAuth();
            this.redirectToLogin();
            return true;
        }
        return false;
    }
};

// ============================================
// Configuration
// ============================================
const _CONFIG = {
    API_BASE_URL: '/api',
    DEBOUNCE_DELAY: 300,
    ITEMS_PER_PAGE: 12,
    DEFAULT_LOGO: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-size="40">🛠️</text></svg>'
};

// ============================================
// State Management
// ============================================
const _state = {
    tools: [],
    categories: [],
    tags: [],
    filters: {
        search: '',
        category: '',
        tag: '',
        anio: '',
        favorito: false,
        page: 1
    },
    pagination: {
        total: 0,
        page: 1,
        limit: _CONFIG.ITEMS_PER_PAGE,
        totalPages: 0
    },
    isDetailMode: !!window.__DETAIL_MODE__
};

// State for sorting
const _sortState = {
    sortField: 'nombre',
    sortDirection: 'asc'
};

// ============================================
// API Client
// ============================================
const _API = {
    async request(endpoint, options = {}) {
        const url = `${_CONFIG.API_BASE_URL}${endpoint}`;
        const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        const isMutation = options.method && mutationMethods.includes(options.method.toUpperCase());

        // Add auth header for mutation requests
        const authHeaders = {};
        if (isMutation) {
            const token = _Auth.getToken();
            if (token) authHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);

            // Handle unauthorized — redirect to login
            if (_Auth.handleUnauthorized(response.status)) return;

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                
                // Manejar los distintos formatos de error del backend
                let errorMessage = `HTTP error! status: ${response.status}`;
                if (error.message) {
                    errorMessage = error.message;
                } else if (error.error) {
                    errorMessage = error.error;
                } else if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
                    errorMessage = error.errors.map(e => e.msg).join(', ');
                }
                throw new Error(errorMessage);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getTools(filters = {}) {
        const params = new URLSearchParams();
        if (filters.search) params.append('buscar', filters.search);
        if (filters.category) params.append('categoria', filters.category);
        if (filters.tag) params.append('tag', filters.tag);
        if (filters.anio) params.append('anio', filters.anio);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.favorito) params.append('favorito', 'true');
        
        return this.request(`/tools?${params.toString()}`);
    },

    toggleFavorite(toolId) {
        return this.request(`/tools/${toolId}/favorito`, {
            method: 'PATCH'
        });
    },

    getToolById(id) {
        return this.request(`/tools/${id}`);
    },

    getToolHistory(id) {
        return this.request(`/tools/${id}/history`).catch((error) => {
            // Si el endpoint no existe (404), devolver estructura vacía
            if (error.message.includes('404') || error.message.includes('Not Found')) {
                console.warn('History endpoint not available:', error.message);
                return { history: [] };
            }
            throw error;
        });
    },

    getToolComments(id) {
        return this.request(`/tools/${id}/comments`).catch((error) => {
            // Si el endpoint no existe (404), devolver estructura vacía
            if (error.message.includes('404') || error.message.includes('Not Found')) {
                console.warn('Comments endpoint not available:', error.message);
                return { comments: [] };
            }
            throw error;
        });
    },

    createToolComment(id, commentData) {
        return this.request(`/tools/${id}/comments`, {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
    },

    updateToolComment(toolId, commentId, commentData) {
        return this.request(`/tools/${toolId}/comments/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify(commentData)
        });
    },

    deleteToolComment(toolId, commentId) {
        return this.request(`/tools/${toolId}/comments/${commentId}`, {
            method: 'DELETE'
        });
    },

    getCategories() {
        return this.request('/categories');
    },

    // Crear nueva herramienta
    createTool(toolData) {
        return this.request('/tools', {
            method: 'POST',
            body: JSON.stringify(toolData)
        });
    },

    // Actualizar herramienta existente
    updateTool(id, toolData) {
        return this.request(`/tools/${id}`, {
            method: 'PUT',
            body: JSON.stringify(toolData)
        });
    },

    // Eliminar herramienta
    deleteTool(id) {
        return this.request(`/tools/${id}`, {
            method: 'DELETE'
        });
    },

    healthCheck() {
        return this.request('/health');
    },

    getTags() {
        return this.request('/tags');
    },

    getGitHubStats(toolId) {
        return this.request(`/tools/${toolId}/github-stats`);
    }
};

// ============================================
// DOM Utilities
// ============================================
const _DOM = {
    $(selector) {
        return document.querySelector(selector);
    },

    $$(selector) {
        return document.querySelectorAll(selector);
    },

    createElement(tag, className = '', attributes = {}) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    },

    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
};

// ============================================
// Utilities
// ============================================
const _Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatRating(rating) {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    },

    getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    getDomainFromUrl(urlString) {
        try {
            const url = new URL(urlString);
            return url.hostname.replace('www.', '');
        } catch (e) {
            return urlString;
        }
    },

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return { text, truncated: false };
        return {
            text: text.substring(0, maxLength).trim() + '...',
            truncated: true
        };
    },

    formatRelativeTime(dateString) {
        if (!dateString) return '';
        const isSqliteTimestamp = typeof dateString === 'string'
            && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString);
        const date = new Date(isSqliteTimestamp ? `${dateString.replace(' ', 'T')}Z` : dateString);
        if (Number.isNaN(date.getTime())) return '';
        const now = new Date();
        const diffMs = now - date;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);
        
        const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
        
        if (diffYears !== 0) return rtf.format(-diffYears, 'year');
        if (diffMonths !== 0) return rtf.format(-diffMonths, 'month');
        if (diffWeeks !== 0) return rtf.format(-diffWeeks, 'week');
        if (diffDays !== 0) return rtf.format(-diffDays, 'day');
        if (diffHours !== 0) return rtf.format(-diffHours, 'hour');
        if (diffMinutes !== 0) return rtf.format(-diffMinutes, 'minute');
        
        return 'hace un momento';
    }
};

// ============================================
// Sorting Functions
// ============================================
function sortTools(tools) {
    return [...tools].sort((a, b) => {
        let valA, valB;
        
        // Handle different field types
        if (_sortState.sortField === 'fecha_creacion') {
            // Date comparison - use ISO strings directly
            valA = a.fecha_creacion || '';
            valB = b.fecha_creacion || '';
        } else if (_sortState.sortField === 'categoria') {
            // For category, we need to get the first category name
            valA = (a.categories && a.categories.length > 0 && a.categories[0].nombre) || '';
            valB = (b.categories && b.categories.length > 0 && b.categories[0].nombre) || '';
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
        } else {
            // Default: sort by name
            valA = (a.nombre || '').toString().toLowerCase();
            valB = (b.nombre || '').toString().toLowerCase();
        }
        
        // Compare values
        if (valA < valB) return _sortState.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return _sortState.sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

// ============================================
// Tool Card Component (Bootstrap Card)
// ============================================
const ToolCard = {
    render(tool) {
        // Use the Bootstrap template structure
        const template = _DOM.$('#tool-card-template');
        const card = template.content.cloneNode(true);
        
        // Set card data - use image_url if available, otherwise logo_url
        const logo = card.querySelector('.tool-logo');
        logo.src = tool.image_url || tool.logo_url || _CONFIG.DEFAULT_LOGO;
        logo.alt = `${tool.nombre} logo`;
        
        const ratingStars = card.querySelector('.rating-stars');
        ratingStars.textContent = _Utils.formatRating(tool.rating || 0);
        
        const name = card.querySelector('.tool-name');
        name.textContent = tool.nombre;

        const primaryCategory = card.querySelector('.tool-primary-category');
        primaryCategory.textContent = (tool.categories && tool.categories.length > 0)
            ? tool.categories[0].nombre
            : 'Sin categoría';

        const description = card.querySelector('.tool-description');
        description.textContent = _Utils.truncateText(tool.descripcion || 'Sin descripción', 120).text;

        const tagsSummary = card.querySelector('.tool-tags-summary');
        tagsSummary.textContent = (tool.tags && tool.tags.length > 0)
            ? tool.tags.map(tag => tag.nombre).join(', ')
            : 'Sin tags';

        const categoriesDiv = card.querySelector('.tool-categories');
        if (tool.categories && tool.categories.length > 0) {
            tool.categories.forEach(cat => {
                const catSpan = _DOM.createElement('span', 'tool-category', {
                    textContent: cat.nombre
                });
                categoriesDiv.appendChild(catSpan);
            });
        }
        
        // Render tags
        const tagsContainer = card.querySelector('.tool-tags');
        if (tagsContainer && tool.tags && tool.tags.length > 0) {
            tool.tags.forEach(tag => {
                const tagSpan = _DOM.createElement('span', 'tool-tag', {
                    textContent: tag.nombre,
                    style: `background-color: ${tag.color || '#6c757d'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; margin-right: 4px;`
                });
                tagsContainer.appendChild(tagSpan);
            });
        }
        
        const detailLink = card.querySelector('.btn-detail');
        detailLink.href = `detalle.html?id=${tool.id}`;
        
        const editBtn = card.querySelector('.btn-edit');
        editBtn.dataset.id = tool.id;
        
        const favoriteBtn = card.querySelector('.btn-favorite');
        favoriteBtn.dataset.id = tool.id;
        
        const favIcon = favoriteBtn.querySelector('.favorite-icon');
        favIcon.textContent = tool.es_favorito ? '★' : '☆';
        
        if (tool.es_favorito) {
            favoriteBtn.classList.add('favorited');
            favoriteBtn.setAttribute('aria-label', 'Quitar de favoritos');
        } else {
            favoriteBtn.setAttribute('aria-label', 'Marcar como favorito');
        }
        
        return card;
    }
};

// ============================================
// Category Filter Component
// ============================================
const CategoryFilter = {
    render(categories) {
        const select = _DOM.$('#category-filter');
        if (!select) return;
        
        _DOM.clearElement(select);
        
        const defaultOption = _DOM.createElement('option', '', {
            value: '',
            textContent: 'Todas las categorías'
        });
        select.appendChild(defaultOption);
        
        categories.forEach(cat => {
            const option = _DOM.createElement('option', '', {
                value: cat.id,
                textContent: cat.nombre
            });
            select.appendChild(option);
        });
    }
};

// ============================================
// Tag Filter Component
// ============================================
const TagFilter = {
    render(tags) {
        const select = _DOM.$('#tag-filter');
        if (!select) return;

        _DOM.clearElement(select);

        const defaultOption = _DOM.createElement('option', '', {
            value: '',
            textContent: 'Todos los tags'
        });
        select.appendChild(defaultOption);

        tags.forEach(tag => {
            const option = _DOM.createElement('option', '', {
                value: tag.id,
                textContent: tag.nombre
            });
            select.appendChild(option);
        });
    }
};

// ============================================
// Year Filter Component
// ============================================
const YearFilter = {
    render() {
        const select = _DOM.$('#year-filter');
        if (!select) return;

        _DOM.clearElement(select);

        const defaultOption = _DOM.createElement('option', '', {
            value: '',
            textContent: 'Todos los años'
        });
        select.appendChild(defaultOption);

        const currentYear = new Date().getFullYear();
        const minYear = currentYear - 9;

        for (let year = currentYear; year >= minYear; year--) {
            const option = _DOM.createElement('option', '', {
                value: String(year),
                textContent: String(year)
            });
            select.appendChild(option);
        }
    }
};

// ============================================
// Category Select for Modal
// ============================================
const CategorySelect = {
    render(categories) {
        const select = _DOM.$('#tool-categories');
        if (!select) return;
        
        _DOM.clearElement(select);
        
        categories.forEach(cat => {
            const option = _DOM.createElement('option', '', {
                value: cat.id,
                textContent: cat.nombre
            });
            select.appendChild(option);
        });
    },
    
    // Set selected categories (for editing)
    setSelected(categoryIds) {
        const select = _DOM.$('#tool-categories');
        if (!select) return;
        
        const options = select.querySelectorAll('option');
        options.forEach(option => {
            if (categoryIds.includes(parseInt(option.value, 10))) {
                option.selected = true;
            } else {
                option.selected = false;
            }
        });
    },
    
    // Get selected category IDs
    getSelected() {
        const select = _DOM.$('#tool-categories');
        if (!select) return [];
        
        return Array.from(select.selectedOptions).map(option => parseInt(option.value, 10));
    }
};

// ============================================
// Pagination Component (Bootstrap)
// ============================================
const Pagination = {
    render(pagination) {
        const container = _DOM.$('#pagination');
        if (!container) return;
        
        _DOM.clearElement(container);
        
        if (pagination.totalPages <= 1) return;
        
        const { page, totalPages } = pagination;
        
        // Create nav wrapper
        const nav = _DOM.createElement('nav', 'd-flex justify-content-center');
        const ul = _DOM.createElement('ul', 'pagination');
        
        // Previous button
        const prevLi = _DOM.createElement('li', `page-item ${page === 1 ? 'disabled' : ''}`);
        const prevLink = _DOM.createElement('a', 'page-link', {
            href: '#',
            textContent: 'Anterior',
            'data-page': page - 1
        });
        prevLi.appendChild(prevLink);
        ul.appendChild(prevLi);
        
        // Page numbers
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        if (start > 1) {
            const firstLi = _DOM.createElement('li', 'page-item');
            const firstLink = _DOM.createElement('a', 'page-link', {
                href: '#',
                textContent: '1',
                'data-page': 1
            });
            firstLi.appendChild(firstLink);
            ul.appendChild(firstLi);
            
            if (start > 2) {
                const dotsLi = _DOM.createElement('li', 'page-item');
                dotsLi.innerHTML = '<span class="page-link">...</span>';
                ul.appendChild(dotsLi);
            }
        }
        
        for (let i = start; i <= end; i++) {
            const pageLi = _DOM.createElement('li', `page-item ${i === page ? 'active' : ''}`);
            const pageLink = _DOM.createElement('a', 'page-link', {
                href: '#',
                textContent: i,
                'data-page': i
            });
            pageLi.appendChild(pageLink);
            ul.appendChild(pageLi);
        }
        
        if (end < totalPages) {
            if (end < totalPages - 1) {
                const dotsLi = _DOM.createElement('li', 'page-item');
                dotsLi.innerHTML = '<span class="page-link">...</span>';
                ul.appendChild(dotsLi);
            }
            
            const lastLi = _DOM.createElement('li', 'page-item');
            const lastLink = _DOM.createElement('a', 'page-link', {
                href: '#',
                textContent: totalPages,
                'data-page': totalPages
            });
            lastLi.appendChild(lastLink);
            ul.appendChild(lastLi);
        }
        
        // Next button
        const nextLi = _DOM.createElement('li', `page-item ${page === totalPages ? 'disabled' : ''}`);
        const nextLink = _DOM.createElement('a', 'page-link', {
            href: '#',
            textContent: 'Siguiente',
            'data-page': page + 1
        });
        nextLi.appendChild(nextLink);
        ul.appendChild(nextLi);
        
        nav.appendChild(ul);
        container.appendChild(nav);
    }
};

// ============================================
// Results Count Component
// ============================================
const ResultsCount = {
    render(pagination) {
        const container = _DOM.$('#results-count');
        if (!container) return;
        
        const { total, page, limit } = pagination;
        const start = (page - 1) * limit + 1;
        const end = Math.min(page * limit, total);
        
        if (total === 0) {
            container.textContent = 'No se encontraron herramientas';
        } else if (total === 1) {
            container.textContent = '1 herramienta encontrada';
        } else {
            container.textContent = `Mostrando ${start}-${end} de ${total} herramientas`;
        }
    }
};

// ============================================
// Toast Notifications (Bootstrap Toast)
// ============================================
const Toast = {
    show(message, type = 'info') {
        const container = _DOM.$('#toast-container');
        if (!container) return;
        
        const toastId = 'toast-' + Date.now();
        
        const toast = _DOM.createElement('div', `toast show`, {
            id: toastId,
            role: 'alert',
            'aria-live': 'assertive',
            'aria-atomic': 'true'
        });
        
        // Set background color based on type
        const bgClass = {
            'success': 'bg-success',
            'error': 'bg-danger',
            'info': 'bg-primary',
            'warning': 'bg-warning'
        };
        
        toast.style.backgroundColor = type === 'success' ? '#10b981' : 
                                       type === 'error' ? '#ef4444' : 
                                       type === 'warning' ? '#f59e0b' : '#3b82f6';
        
        toast.innerHTML = `
            <div class="toast-body d-flex justify-content-between align-items-center text-white">
                <span>${message}</span>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('toast-hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    },
    
    success(message) {
        this.show(message, 'success');
    },
    
    error(message) {
        this.show(message, 'error');
    },
    
    info(message) {
        this.show(message, 'info');
    }
};

// ============================================
// Modal Component (Bootstrap Modal)
// ============================================
const Modal = {
    isOpen: false,
    editingToolId: null,
    bootstrapModal: null,
    
    init() {
        const modalEl = _DOM.$('#tool-modal');
        if (modalEl) {
            this.bootstrapModal = new bootstrap.Modal(modalEl);
        }
    },
    
    async open(editingTool = null) {
        // Initialize bootstrap modal if not already
        if (!this.bootstrapModal) {
            this.init();
        }

        // Load categories if not already loaded (needed for detail page)
        if (_state.categories.length === 0) {
            try {
                const catsData = await _API.getCategories();
                _state.categories = catsData.categories || catsData || [];
                CategorySelect.render(_state.categories);
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        }

        // Load tags if not already loaded (needed for detail page)
        const hasTagManager = typeof TagManager !== 'undefined' && TagManager;
        if (hasTagManager && TagManager.tags.length === 0) {
            try {
                await TagManager.loadTags();
            } catch (error) {
                console.error('Error loading tags:', error);
            }
        }
        
        const form = _DOM.$('#tool-form');
        const title = _DOM.$('#modal-title');
        const ratingDisplay = _DOM.$('#rating-display');
        
        if (!form) return;
        
        // Reset form validation
        form.classList.remove('was-validated');
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        
        // Reset form
        form.reset();
        this.clearErrors();
        
        // Preserve a valid category selection for add mode
        const categorySelect = _DOM.$('#tool-categories');
        if (categorySelect) {
            const firstValidOption = Array.from(categorySelect.options).find(opt => opt.value);
            if (firstValidOption) {
                firstValidOption.selected = true;
            }
        }
        
        // Reset rating display
        if (ratingDisplay) {
            ratingDisplay.textContent = '★★★☆☆';
        }

        // Reset image previews
        this.resetImagePreviews();
        
        // Set editing mode
        this.editingToolId = editingTool ? editingTool.id : null;
        console.log('[DEBUG] Modal.open - editingToolId:', this.editingToolId, 'editingTool:', editingTool);
        
        if (editingTool) {
            // Edit mode - pre-fill form
            title.textContent = 'Editar Herramienta';
            _DOM.$('#tool-id').value = editingTool.id;
            _DOM.$('#tool-name').value = editingTool.nombre || '';
            _DOM.$('#tool-description').value = editingTool.descripcion || '';
            _DOM.$('#tool-url').value = editingTool.url || '';
            _DOM.$('#tool-logo').value = editingTool.logo_url || '';
            
            const rating = editingTool.rating || 3;
            _DOM.$('#tool-rating').value = rating;
            if (ratingDisplay) {
                ratingDisplay.textContent = _Utils.formatRating(rating);
            }
            
            // Set selected categories
            if (editingTool.categories && editingTool.categories.length > 0) {
                const categoryIds = editingTool.categories.map(c => c.id);
                CategorySelect.setSelected(categoryIds);
            }
            
            // Set selected tags
            if (hasTagManager && editingTool.tags && editingTool.tags.length > 0) {
                const tagIds = editingTool.tags.map(t => t.id);
                TagManager.renderTagSelect(tagIds);
            } else if (hasTagManager) {
                TagManager.renderTagSelect([]);
            }

            // Show current image if exists
            if (editingTool.image_url) {
                this.showCurrentImage(editingTool.image_url);
            }
        } else {
            // Add mode
            title.textContent = 'Agregar Herramienta';
            _DOM.$('#tool-id').value = '';
            _DOM.$('#tool-rating').value = 3;
            if (ratingDisplay) {
                ratingDisplay.textContent = '★★★☆☆';
            }
            
            // Render tag select (empty for new tool)
            if (hasTagManager) {
                TagManager.renderTagSelect([]);
            }
        }
        
        // Show bootstrap modal
        this.bootstrapModal.show();
        this.isOpen = true;
        
        // Focus first input
        setTimeout(() => {
            _DOM.$('#tool-name')?.focus();
        }, 100);
    },
    
    close() {
        if (this.bootstrapModal) {
            this.bootstrapModal.hide();
        }
        this.isOpen = false;
        this.editingToolId = null;
    },
    
    clearErrors() {
        const errors = _DOM.$$('.invalid-feedback');
        errors.forEach(el => el.textContent = '');
        
        const inputs = _DOM.$$('#tool-form input, #tool-form textarea, #tool-form select');
        inputs.forEach(el => el.classList.remove('is-invalid'));
    },
    
    showError(fieldName, message) {
        const errorEl = _DOM.$('#error-' + fieldName);
        const inputEl = _DOM.$('#tool-' + (fieldName === 'logo_url' ? 'logo' : fieldName));
        
        if (inputEl) {
            inputEl.classList.add('is-invalid');
        }
        if (errorEl) {
            errorEl.textContent = message;
        }
    },
    
    setLoading(loading) {
        const submitBtn = _DOM.$('#btn-submit');
        const btnText = submitBtn?.querySelector('.btn-text-submit');
        const btnLoading = submitBtn?.querySelector('.btn-loading');
        
        if (!submitBtn) return;
        
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading-state');
            if (btnText) btnText.classList.add('d-none');
            if (btnLoading) btnLoading.classList.remove('d-none');
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading-state');
            if (btnText) btnText.classList.remove('d-none');
            if (btnLoading) btnLoading.classList.add('d-none');
        }
    },

    resetImagePreviews() {
        const currentPreview = _DOM.$('#current-image-preview');
        const newPreview = _DOM.$('#new-image-preview');
        const imageInput = _DOM.$('#tool-image');

        if (currentPreview) currentPreview.classList.add('d-none');
        if (newPreview) newPreview.classList.add('d-none');
        if (imageInput) imageInput.value = '';
    },

    showCurrentImage(imageUrl) {
        const currentPreview = _DOM.$('#current-image-preview');
        const currentImage = _DOM.$('#current-image');

        if (currentPreview && currentImage) {
            currentImage.src = imageUrl;
            currentPreview.classList.remove('d-none');
        }
    },

    showNewImagePreview(file) {
        const newPreview = _DOM.$('#new-image-preview');
        const newImage = _DOM.$('#new-image');

        if (newPreview && newImage && file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newImage.src = e.target.result;
                newPreview.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        }
    }
};

if (typeof window !== 'undefined') {
    window.DevToolsHub = window.DevToolsHub || {};
    window.DevToolsHub.openToolModal = (tool) => Modal.open(tool);
}

// ============================================
// Form Handler
// ============================================
const ToolForm = {
    async handleSubmit(e) {
        if (e) e.preventDefault(); // Escudo 1: Parar el recargo de página sí o sí
        
        console.log('[DEBUG] handleSubmit called - Modal.editingToolId:', Modal.editingToolId);
        
        try {
            Modal.clearErrors();
            const form = document.getElementById('tool-form');
            const formData = new FormData(form);
            
            const toolData = {
                nombre: formData.get('nombre')?.trim(),
                descripcion: formData.get('descripcion')?.trim() || null,
                url: formData.get('url')?.trim() || null,
                logo_url: formData.get('logo_url')?.trim() || null,
                rating: parseInt(formData.get('rating'), 10) || 3,
                categories: CategorySelect.getSelected(),
                tags: typeof TagManager !== 'undefined' ? TagManager.getSelectedTags() : []
            };
            
            // Validación manual antibalas (sin depender de validation.js)
            if (!toolData.nombre || !toolData.descripcion || toolData.categories.length === 0) {
                Toast.error('Nombre, descripción y categoría son obligatorios.');
                return;
            }
            
            Modal.setLoading(true);
            let result;
            let savedToolId;
            
            console.log('[DEBUG] handleSubmit - Modal.editingToolId before save:', Modal.editingToolId);
            console.log('[DEBUG] handleSubmit - toolData to save:', toolData);
            
            if (Modal.editingToolId) {
                console.log('[DEBUG] handleSubmit - Calling updateTool with ID:', Modal.editingToolId);
                result = await _API.updateTool(Modal.editingToolId, toolData);
                console.log('[DEBUG] handleSubmit - updateTool result:', result);
                savedToolId = Modal.editingToolId;
                Toast.success('¡Herramienta actualizada!');
            } else {
                console.log('[DEBUG] handleSubmit - Calling createTool');
                result = await _API.createTool(toolData);
                console.log('[DEBUG] handleSubmit - createTool result:', result);
                savedToolId = result.tool?.id;
                Toast.success('¡Herramienta creada!');
            }

            if (savedToolId) {
                try {
                    await this.handleImageUpload(savedToolId);
                } catch (err) { console.warn("Error de imagen omitido", err); }
            }
            
            Modal.close();
            
            // Recarga bruta y funcional (garantiza que ves los cambios)
            if (window.location.pathname.includes('detalle.html')) {
                window.location.href = `detalle.html?id=${savedToolId}`;
            } else {
                window.location.reload();
            }
            
        } catch (error) {
            console.error("Error crítico guardando:", error);
            Toast.error(error.message || 'Error al guardar la herramienta');
        } finally {
            Modal.setLoading(false);
        }
    },
    
    setupEventListeners() {
        // SOLUCIÓN DEFINITIVA: Click directo al botón, no submit del form
        const saveButton = document.getElementById('btn-submit');
        if (saveButton) {
            saveButton.addEventListener('click', (e) => {
                this.handleSubmit(e);
            });
        }
        
        // Escudo 3: Try-Catch en la validación visual para que NO crashee el resto de la app
        try {
            ['#tool-name', '#tool-description', '#tool-url', '#tool-logo', '#tool-categories'].forEach(sel => {
                if (typeof _VALIDATION !== 'undefined' && _VALIDATION.setupAutoClear) {
                    _VALIDATION.setupAutoClear(document.querySelector(sel));
                }
            });
        } catch(e) {
            console.warn("Saltando validación visual externa para evitar crasheo total");
        }
        
        // Listeners básicos (Rating)
        const ratingInput = document.getElementById('tool-rating');
        const ratingDisplay = document.getElementById('rating-display');
        if (ratingInput && ratingDisplay) {
            ratingInput.addEventListener('input', (e) => {
                ratingDisplay.textContent = _Utils.formatRating(parseInt(e.target.value, 10));
            });
        }
        
        // Limpieza al cerrar modal
        document.getElementById('tool-modal')?.addEventListener('hidden.bs.modal', () => {
            Modal.isOpen = false;
            Modal.editingToolId = null;
        });
        
        // Imágenes
        const imageInput = document.getElementById('tool-image');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                        Toast.error('El archivo no puede superar los 5MB');
                        imageInput.value = '';
                        return;
                    }
                    Modal.showNewImagePreview(file);
                }
            });
        }

        const deleteImageBtn = document.getElementById('btn-delete-image');
        if (deleteImageBtn) {
            deleteImageBtn.addEventListener('click', async () => {
                if (!Modal.editingToolId) return;
                if (!confirm('¿Eliminar la imagen?')) return;
                try {
                    await _API.deleteImage(Modal.editingToolId);
                    Toast.success('Imagen eliminada');
                    Modal.resetImagePreviews();
                    window.location.reload();
                } catch (error) {
                    Toast.error('Error al eliminar');
                }
            });
        }
    },
    
    async handleImageUpload(toolId) {
        const imageInput = document.getElementById('tool-image');
        if (!imageInput || !imageInput.files[0]) return null;

        try {
            const result = await _API.uploadImage(toolId, imageInput.files[0]);
            Toast.success('Imagen subida');
            return result;
        } catch (error) {
            Toast.error(error.message || 'Error subiendo imagen');
            throw error;
        }
    }
};

// ============================================
// Detail View Component
// ============================================
const DetailView = {
    currentTool: null,

    async render(toolId) {
        const container = _DOM.$('#tool-detail');
        if (!container) return;
        
        try {
            const data = await _API.getToolById(toolId);
            const tool = data.tool || data;
            this.currentTool = tool;
            
            _DOM.clearElement(container);
            
            // Back link
            const backLink = _DOM.createElement('a', 'back-link mb-4 d-inline-flex align-items-center', {
                href: 'index.html',
                innerHTML: '<i class="bi bi-arrow-left me-2"></i>Volver al catálogo'
            });
            
            // Main card
            const card = _DOM.createElement('div', 'detail-card');
            
            // Header section with logo and title
            const headerSection = _DOM.createElement('div', 'detail-header');
            
            // Logo - use image_url if available, otherwise logo_url
            const logoWrapper = _DOM.createElement('div', 'detail-logo-wrapper');
            const logo = _DOM.createElement('img', 'detail-logo', {
                src: tool.image_url || tool.logo_url || _CONFIG.DEFAULT_LOGO,
                alt: `${tool.nombre} logo`
            });
            logoWrapper.appendChild(logo);
            
            // Title and rating section
            const titleSection = _DOM.createElement('div', 'detail-title-section flex-grow-1');
            
            const title = _DOM.createElement('h1', 'detail-title mb-2', {
                textContent: tool.nombre
            });
            
            // Rating
            const ratingDiv = _DOM.createElement('div', 'detail-rating mb-3');
            const ratingStars = _DOM.createElement('span', 'rating-stars text-warning me-2', {
                textContent: _Utils.formatRating(tool.rating || 0)
            });
            const ratingText = _DOM.createElement('span', 'text-muted', {
                textContent: `${tool.rating || 0}/5`
            });
            ratingDiv.appendChild(ratingStars);
            ratingDiv.appendChild(ratingText);
            
            titleSection.appendChild(title);
            titleSection.appendChild(ratingDiv);
            
            headerSection.appendChild(logoWrapper);
            headerSection.appendChild(titleSection);
            
            // Action buttons
            const actionsDiv = _DOM.createElement('div', 'detail-actions mb-4');
            
            // Favorite button
            const favBtn = _DOM.createElement('button', `btn btn-action btn-favorite-action ${tool.es_favorito ? 'favorited' : ''}`, {
                'data-id': tool.id,
                title: tool.es_favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'
            });
            favBtn.innerHTML = tool.es_favorito 
                ? '<i class="bi bi-star-fill"></i> Favorito' 
                : '<i class="bi bi-star"></i> Favorito';
            favBtn.onclick = () => this.toggleFavorite(tool.id);
            actionsDiv.appendChild(favBtn);
            
            // Edit button
            const editBtn = _DOM.createElement('button', 'btn btn-action btn-edit-action', {
                'data-id': tool.id,
                title: 'Editar herramienta'
            });
            editBtn.innerHTML = '<i class="bi bi-pencil"></i> Editar';
            editBtn.onclick = () => this.openEditModal(tool);
            actionsDiv.appendChild(editBtn);
            
            // Delete button
            const deleteBtn = _DOM.createElement('button', 'btn btn-action btn-delete-action', {
                'data-id': tool.id,
                title: 'Eliminar herramienta'
            });
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
            deleteBtn.onclick = () => this.confirmDelete(tool.id, tool.nombre);
            actionsDiv.appendChild(deleteBtn);
            
            card.appendChild(headerSection);
            card.appendChild(actionsDiv);
            
            // Description section
            const descSection = _DOM.createElement('div', 'detail-section');
            const descTitle = _DOM.createElement('h3', 'detail-section-title', {
                textContent: 'Descripción'
            });
            descSection.appendChild(descTitle);
            
            const descContent = _DOM.createElement('div', 'detail-description');
            const { text: descText, truncated } = _Utils.truncateText(tool.descripcion || 'Sin descripción', 300);
            
            if (truncated) {
                descContent.innerHTML = `
                    <p class="description-text">${_Utils.escapeHtml(descText)}</p>
                    <button class="btn btn-link text-primary p-0 read-more-btn" data-full="${_Utils.escapeHtml(tool.descripcion)}">
                        Leer más <i class="bi bi-arrow-down"></i>
                    </button>
                `;
            } else {
                descContent.innerHTML = `<p class="description-text">${_Utils.escapeHtml(tool.descripcion || 'Sin descripción')}</p>`;
            }
            descSection.appendChild(descContent);
            
            card.appendChild(descSection);
            
            // Wikipedia section (if external data exists)
            if (tool.external_source === 'Wikipedia' && tool.external_summary) {
                const wikiSection = _DOM.createElement('div', 'detail-section wikipedia-section');
                const wikiHeader = _DOM.createElement('div', 'd-flex justify-content-between align-items-center mb-2');
                const wikiTitle = _DOM.createElement('h3', 'detail-section-title mb-0', {
                    textContent: 'Acerca de'
                });
                const wikiBadge = _DOM.createElement('span', 'badge bg-secondary', {
                    textContent: 'Fuente: Wikipedia'
                });
                wikiHeader.appendChild(wikiTitle);
                wikiHeader.appendChild(wikiBadge);
                wikiSection.appendChild(wikiHeader);
                
                const wikiContent = _DOM.createElement('div', 'wikipedia-content');
                if (tool.external_title) {
                    wikiContent.innerHTML += `
                        <h5 class="wiki-title">${_Utils.escapeHtml(tool.external_title)}</h5>
                    `;
                }
                wikiContent.innerHTML += `
                    <p class="wiki-summary mb-3">${_Utils.escapeHtml(tool.external_summary)}</p>
                `;
                if (tool.external_url) {
                    wikiContent.innerHTML += `
                        <a href="${tool.external_url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-wikipedia me-1"></i> Leer en Wikipedia
                        </a>
                    `;
                }
                wikiSection.appendChild(wikiContent);
                card.appendChild(wikiSection);
            }
            
            // Website section (if URL exists)
            if (tool.url) {
                const urlSection = _DOM.createElement('div', 'detail-section');
                const urlTitle = _DOM.createElement('h3', 'detail-section-title', {
                    textContent: 'Sitio Web'
                });
                urlSection.appendChild(urlTitle);
                
                const urlContent = _DOM.createElement('div', 'detail-url');
                const domain = _Utils.getDomainFromUrl(tool.url);
                urlContent.innerHTML = `
                    <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="btn btn-url">
                        <i class="bi bi-box-arrow-up-right me-2"></i>
                        <span class="url-domain">${domain}</span>
                    </a>
                `;
                urlSection.appendChild(urlContent);
                
                card.appendChild(urlSection);
            }
            
            // Categories section
            const catSection = _DOM.createElement('div', 'detail-section');
            const catTitle = _DOM.createElement('h3', 'detail-section-title', {
                textContent: 'Categorías'
            });
            catSection.appendChild(catTitle);
            
            const catContainer = _DOM.createElement('div', 'detail-categories');
            if (tool.categories && tool.categories.length > 0) {
                tool.categories.forEach(cat => {
                    const catBadge = _DOM.createElement('span', 'category-badge', {
                        textContent: cat.nombre
                    });
                    catContainer.appendChild(catBadge);
                });
            } else {
                const noCat = _DOM.createElement('span', 'text-muted fst-italic', {
                    textContent: 'Sin categorías'
                });
                catContainer.appendChild(noCat);
            }
            catSection.appendChild(catContainer);
            
            card.appendChild(catSection);
            
            // Metadata section
            const metaSection = _DOM.createElement('div', 'detail-section detail-meta-section');
            
            const createdMeta = _DOM.createElement('div', 'meta-item');
            createdMeta.innerHTML = `
                <i class="bi bi-calendar-plus me-2 text-muted"></i>
                <span class="meta-label">Creado:</span>
                <span class="meta-value">${_Utils.formatDate(tool.fecha_creacion)}</span>
            `;
            
            const updatedMeta = _DOM.createElement('div', 'meta-item');
            updatedMeta.innerHTML = `
                <i class="bi bi-clock-history me-2 text-muted"></i>
                <span class="meta-label">Actualizado:</span>
                <span class="meta-value">${_Utils.formatDate(tool.fecha_actualizacion)}</span>
            `;
            
            metaSection.appendChild(createdMeta);
            metaSection.appendChild(updatedMeta);
            
            card.appendChild(metaSection);

            const historySection = _DOM.createElement('div', 'detail-section', {
                id: 'tool-history-section'
            });

            const historyTitle = _DOM.createElement('h3', 'detail-section-title', {
                textContent: 'Historial de cambios'
            });
            historySection.appendChild(historyTitle);

            const historySkeleton = _DOM.createElement('div', 'tool-history-skeleton');
            historySkeleton.innerHTML = `
                <div class="placeholder-glow">
                    <span class="placeholder col-8 mb-2"></span>
                    <span class="placeholder col-6"></span>
                </div>
            `;
            historySection.appendChild(historySkeleton);

            card.appendChild(historySection);

            const commentsSection = _DOM.createElement('div', 'detail-section', {
                id: 'tool-comments-section'
            });

            const commentsTitle = _DOM.createElement('h3', 'detail-section-title', {
                textContent: 'Comentarios / opiniones'
            });
            commentsSection.appendChild(commentsTitle);

            const commentsSkeleton = _DOM.createElement('div', 'tool-comments-skeleton');
            commentsSkeleton.innerHTML = `
                <div class="placeholder-glow mb-3">
                    <span class="placeholder col-8 mb-2"></span>
                    <span class="placeholder col-10"></span>
                </div>
            `;
            commentsSection.appendChild(commentsSkeleton);

            card.appendChild(commentsSection);
            
            // GitHub Stats section - will be loaded separately
            const githubSection = _DOM.createElement('div', 'detail-section');
            githubSection.id = 'github-stats-section';
            
            const githubTitle = _DOM.createElement('h3', 'detail-section-title', {
                textContent: 'Stats del Repo GitHub'
            });
            githubSection.appendChild(githubTitle);
            
            // Skeleton loader
            const skeletonLoader = _DOM.createElement('div', 'github-stats-skeleton');
            skeletonLoader.innerHTML = `
                <div class="row text-center">
                    <div class="col-4">
                        <div class="placeholder-glow">
                            <span class="placeholder col-8"></span>
                        </div>
                        <p class="mb-0 small text-muted">Estrellas</p>
                    </div>
                    <div class="col-4">
                        <div class="placeholder-glow">
                            <span class="placeholder col-8"></span>
                        </div>
                        <p class="mb-0 small text-muted">Forks</p>
                    </div>
                    <div class="col-4">
                        <div class="placeholder-glow">
                            <span class="placeholder col-8"></span>
                        </div>
                        <p class="mb-0 small text-muted">Último Commit</p>
                    </div>
                </div>
            `;
            githubSection.appendChild(skeletonLoader);
            card.appendChild(githubSection);
            
            container.appendChild(backLink);
            container.appendChild(card);
            
            // Load GitHub stats after rendering
            this.loadGitHubStats(toolId);

            // Load history after rendering
            this.loadToolHistory(toolId);

            // Load comments after rendering
            await this.loadToolComments(toolId);

            // Setup comments form
            this.setupCommentForm(toolId);
            
            // Setup read more button event
            this.setupReadMoreButton();
            
        } catch (error) {
            _DOM.clearElement(container);
            const errorMsg = _DOM.createElement('div', 'alert alert-danger', {
                innerHTML: `<p>Error al cargar los detalles de la herramienta.</p>
                           <button class="btn btn-outline-danger" onclick="location.reload()">Reintentar</button>`
            });
            container.appendChild(errorMsg);
        }
    },

    setupReadMoreButton() {
        const readMoreBtn = _DOM.$('.read-more-btn');
        if (readMoreBtn) {
            readMoreBtn.addEventListener('click', () => {
                const fullText = readMoreBtn.dataset.full;
                const descText = _DOM.$('.description-text');
                if (descText) {
                    descText.textContent = fullText;
                    readMoreBtn.remove();
                }
            });
        }
    },

    async toggleFavorite(toolId) {
        try {
            await _API.toggleFavorite(toolId);
            Toast.success('Estado de favorito actualizado');
            await this.render(toolId);
        } catch (error) {
            Toast.error('Error al actualizar favorito');
        }
    },

    openEditModal(tool) {
        Modal.open(tool);
    },

    confirmDelete(toolId, toolName) {
        if (confirm(`¿Estás seguro de que deseas eliminar "${toolName}"?\n\nEsta acción no se puede deshacer.`)) {
            this.deleteTool(toolId);
        }
    },

    async deleteTool(toolId) {
        try {
            await _API.request(`/tools/${toolId}`, { method: 'DELETE' });
            Toast.success('Herramienta eliminada correctamente');
            window.location.href = 'index.html';
        } catch (error) {
            Toast.error('Error al eliminar la herramienta');
        }
    },

    async loadGitHubStats(toolId) {
        const section = _DOM.$('#github-stats-section');
        if (!section) return;

        try {
            const stats = await _API.getGitHubStats(toolId);
            
            // Clear skeleton loader
            const skeleton = section.querySelector('.github-stats-skeleton');
            if (skeleton) skeleton.remove();
            
            // Create stats display
            const statsDiv = _DOM.createElement('div', 'github-stats-content');
            statsDiv.innerHTML = `
                <div class="row text-center">
                    <div class="col-4">
                        <div class="fs-4 fw-bold text-warning">
                            <i class="bi bi-star-fill"></i> ${stats.starsFormatted}
                        </div>
                        <p class="mb-0 small text-muted">Estrellas</p>
                    </div>
                    <div class="col-4">
                        <div class="fs-4 fw-bold text-primary">
                            <i class="bi bi-git"></i> ${stats.forksFormatted}
                        </div>
                        <p class="mb-0 small text-muted">Forks</p>
                    </div>
                    <div class="col-4">
                        <div class="fs-4 fw-bold text-success">
                            <i class="bi bi-calendar-event"></i> ${_Utils.formatRelativeTime(stats.lastCommit)}
                        </div>
                        <p class="mb-0 small text-muted">Último Commit</p>
                    </div>
                </div>
            `;
            section.appendChild(statsDiv);
            
        } catch (error) {
            // Silently hide section if tool has no GitHub URL or URL is invalid
            // Only show "Stats no disponibles" for API errors
            const skeleton = section.querySelector('.github-stats-skeleton');
            if (skeleton) {
                skeleton.innerHTML = `
                    <div class="text-center text-muted py-2">
                        <i class="bi bi-info-circle me-1"></i>
                        <span class="small">Stats no disponibles</span>
                    </div>
                `;
            }
        }
    },

    async loadToolHistory(toolId) {
        const section = _DOM.$('#tool-history-section');
        if (!section) return;

        try {
            const data = await _API.getToolHistory(toolId);
            const history = data.history || data.data || [];

            const skeleton = section.querySelector('.tool-history-skeleton');
            if (skeleton) skeleton.remove();

            if (!history.length) {
                const empty = _DOM.createElement('p', 'text-muted mb-0', {
                    textContent: 'Todavía no hay cambios registrados.'
                });
                section.appendChild(empty);
                return;
            }

            const list = _DOM.createElement('div', 'list-group list-group-flush');
            history.forEach((entry) => {
                const item = _DOM.createElement('div', 'list-group-item px-0');
                item.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <div class="fw-semibold">${_Utils.escapeHtml(entry.resumen || entry.accion || 'Cambio')}</div>
                            <div class="small text-muted">${_Utils.escapeHtml(entry.accion || 'update')}</div>
                        </div>
                        <span class="small text-muted text-nowrap">${_Utils.formatDate(entry.fecha_creacion)}</span>
                    </div>
                `;
                list.appendChild(item);
            });

            section.appendChild(list);
        } catch (error) {
            console.warn('Error loading history:', error.message);
            if (section) section.classList.add('d-none');
        }
    },

    setupCommentForm(toolId) {
        const form = _DOM.$('#tool-comment-form');
        if (!form) return;

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const textarea = form.querySelector('#comment-content');
            const submitBtn = form.querySelector('[type="submit"]');
            const contenido = textarea ? textarea.value.trim() : '';

            if (!contenido) {
                Toast.error('Escribe un comentario antes de publicar');
                return;
            }

            try {
                if (submitBtn) submitBtn.disabled = true;
                await _API.createToolComment(toolId, { contenido });
                Toast.success('Comentario publicado');
                await this.render(toolId);
            } catch (error) {
                Toast.error(error.message || 'No se pudo publicar el comentario');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    },

    setupCommentActions(toolId) {
        const section = _DOM.$('#tool-comments-section');
        if (!section) return;

        const currentUsername = _Auth.getUser()?.username;
        const editButtons = section.querySelectorAll('[data-comment-action="edit"]');
        const deleteButtons = section.querySelectorAll('[data-comment-action="delete"]');

        editButtons.forEach((button) => {
            button.addEventListener('click', async () => {
                const commentId = button.dataset.commentId;
                const currentContent = button.dataset.commentContent || '';
                const nextContent = window.prompt('Edita tu comentario', currentContent);

                if (nextContent === null) return;

                const contenido = nextContent.trim();
                if (!contenido) {
                    Toast.error('El comentario no puede estar vacío');
                    return;
                }

                try {
                    button.disabled = true;
                    await _API.updateToolComment(toolId, commentId, { contenido });
                    Toast.success('Comentario actualizado');
                    await this.render(toolId);
                } catch (error) {
                    Toast.error(error.message || 'No se pudo actualizar el comentario');
                } finally {
                    button.disabled = false;
                }
            });
        });

        deleteButtons.forEach((button) => {
            button.addEventListener('click', async () => {
                const commentId = button.dataset.commentId;
                const confirmed = window.confirm('¿Eliminar tu comentario?');
                if (!confirmed) return;

                try {
                    button.disabled = true;
                    await _API.deleteToolComment(toolId, commentId);
                    Toast.success('Comentario eliminado');
                    await this.render(toolId);
                } catch (error) {
                    Toast.error(error.message || 'No se pudo eliminar el comentario');
                } finally {
                    button.disabled = false;
                }
            });
        });
    },

    async loadToolComments(toolId) {
        const section = _DOM.$('#tool-comments-section');
        if (!section) return;

        try {
            const data = await _API.getToolComments(toolId);
            const comments = data.comments || data.data || [];
            const currentUsername = _Auth.getUser()?.username || '';

            const skeleton = section.querySelector('.tool-comments-skeleton');
            if (skeleton) skeleton.remove();

            const authNote = _Auth.isAuthenticated()
                ? ''
                : `
                    <div class="alert alert-info mb-3">
                        <i class="bi bi-info-circle me-1"></i>
                        Inicia sesión para publicar un comentario.
                    </div>
                `;

            const formHtml = _Auth.isAuthenticated()
                ? `
                    <form id="tool-comment-form" class="comment-form mb-4">
                        <div class="mb-3">
                            <label for="comment-content" class="form-label">Tu comentario</label>
                            <textarea id="comment-content" class="form-control" rows="4" maxlength="500" placeholder="Comparte tu opinión sobre esta herramienta..."></textarea>
                        </div>
                        <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                            <small class="text-muted">Máximo 500 caracteres</small>
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-send me-1"></i> Publicar
                            </button>
                        </div>
                    </form>
                `
                : '';

            const commentsMarkup = comments.length
                ? comments.map((comment) => {
                    const isOwner = currentUsername && comment.autor === currentUsername;
                    const actionsMarkup = isOwner
                        ? `
                            <div class="btn-group btn-group-sm" role="group" aria-label="Acciones del comentario">
                                <button
                                    type="button"
                                    class="btn btn-outline-secondary"
                                    data-comment-action="edit"
                                    data-comment-id="${comment.id}"
                                    data-comment-content="${_Utils.escapeHtml(comment.contenido || '')}"
                                >
                                    <i class="bi bi-pencil me-1"></i> Editar
                                </button>
                                <button
                                    type="button"
                                    class="btn btn-outline-danger"
                                    data-comment-action="delete"
                                    data-comment-id="${comment.id}"
                                >
                                    <i class="bi bi-trash me-1"></i> Eliminar
                                </button>
                            </div>
                        `
                        : '<span class="badge text-bg-light">Opinión</span>';

                    return `
                    <article class="comment-item">
                        <div class="d-flex justify-content-between align-items-start gap-3">
                            <div>
                                <div class="comment-author">${_Utils.escapeHtml(comment.autor || 'Usuario')}</div>
                                <div class="comment-meta text-muted small">${_Utils.formatRelativeTime(comment.fecha_creacion)}</div>
                            </div>
                            ${actionsMarkup}
                        </div>
                        <p class="comment-content mb-0">${_Utils.escapeHtml(comment.contenido || '')}</p>
                    </article>
                    `;
                }).join('')
                : '<p class="text-muted mb-0">Todavía no hay comentarios para esta herramienta.</p>';

            section.innerHTML = `
                ${authNote}
                ${formHtml}
                <div class="comment-list d-grid gap-3">${commentsMarkup}</div>
            `;

            if (currentUsername) {
                this.setupCommentActions(toolId);
            }
        } catch (error) {
            console.warn('Error loading comments:', error.message);
            if (section) section.classList.add('d-none');
        }
    }
};

// ============================================
// List View Component
// ============================================
const ListView = {
    async init() {
        try {
            // Load categories first
            const catsData = await _API.getCategories();
            _state.categories = catsData.categories || catsData || [];
            CategoryFilter.render(_state.categories);
            CategorySelect.render(_state.categories);
            
            // Load tags
            const tagsData = await _API.getTags();
            _state.tags = tagsData.tags || tagsData || [];
            TagFilter.render(_state.tags);
            YearFilter.render();
            
            // Load tools
            await this.loadTools();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup form handlers
            ToolForm.setupEventListeners();
            
        } catch (error) {
            this.showError('Error al cargar los datos. Asegúrate de que el servidor esté funcionando.');
        }
    },
    
    async loadTools() {
        const grid = _DOM.$('#tools-grid');
        if (!grid) return;
        
        // Show loading
        _DOM.clearElement(grid);
        const spinnerContainer = _DOM.createElement('div', 'col-12 text-center py-5');
        spinnerContainer.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Cargando herramientas...</p>
        `;
        grid.appendChild(spinnerContainer);
        
        try {
            const data = await _API.getTools(_state.filters);
            _state.tools = data.data || data.tools || data || [];
            _state.pagination = {
                total: data.total || _state.tools.length,
                page: _state.filters.page,
                limit: _state.filters.limit || _CONFIG.ITEMS_PER_PAGE,
                totalPages: Math.ceil((data.total || _state.tools.length) / (_state.filters.limit || _CONFIG.ITEMS_PER_PAGE))
            };
            
            this.render();
            
        } catch (error) {
            this.showError('Error al cargar las herramientas.');
        }
    },
    
    render() {
        const grid = _DOM.$('#tools-grid');
        if (!grid) return;
        
        _DOM.clearElement(grid);
        
        if (_state.tools.length === 0) {
            const emptyMsg = _DOM.createElement('div', 'col-12 text-center py-5 empty-message', {
                textContent: 'No se encontraron herramientas. Prueba con otros filtros.'
            });
            grid.appendChild(emptyMsg);
        } else {
            const sortedTools = sortTools(_state.tools);
            sortedTools.forEach((tool, index) => {
                const card = ToolCard.render(tool);
                const cardElement = card.querySelector('.tool-card');
                cardElement.style.animationDelay = `${index * 0.05}s`;
                grid.appendChild(card);
            });
        }
        
        ResultsCount.render(_state.pagination);
        Pagination.render(_state.pagination);
        
        // Setup card action listeners after render
        this.setupCardActions();
    },
    
    setupCardActions() {
        // Favorite buttons
        const favoriteBtns = _DOM.$$('.btn-favorite');
        favoriteBtns.forEach(btn => {
            btn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const toolId = parseInt(btn.dataset.id, 10);
                try {
                    await _API.toggleFavorite(toolId);
                    await this.loadTools();
                } catch (error) {
                    Toast.error('Error al cambiar estado de favorito');
                }
            };
        });
        
        // Edit buttons
        const editBtns = _DOM.$$('.btn-edit');
        editBtns.forEach(btn => {
            btn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const toolId = parseInt(btn.dataset.id, 10);
                try {
                    const data = await _API.getToolById(toolId);
                    const tool = data.tool || data;
                    Modal.open(tool);
                } catch (error) {
                    Toast.error('Error al cargar los datos de la herramienta');
                }
            };
        });
    },
    
    showError(message) {
        const grid = _DOM.$('#tools-grid');
        if (!grid) return;
        
        _DOM.clearElement(grid);
        const errorMsg = _DOM.createElement('div', 'col-12 text-center py-5', {
            innerHTML: `<div class="alert alert-danger">${message}</div><button class="btn btn-outline-danger" onclick="App.init()">Reintentar</button>`
        });
        grid.appendChild(errorMsg);
        
        const count = _DOM.$('#results-count');
        if (count) count.textContent = 'Error al cargar';
    },
    
    setupEventListeners() {
        const searchInput = _DOM.$('#search-input');
        const categoryFilter = _DOM.$('#category-filter');
        const tagFilter = _DOM.$('#tag-filter');
        const yearFilter = _DOM.$('#year-filter');
        
        if (searchInput) {
            searchInput.addEventListener('input', _Utils.debounce((e) => {
                _state.filters.search = e.target.value;
                _state.filters.page = 1;
                this.loadTools();
            }, _CONFIG.DEBOUNCE_DELAY));
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                _state.filters.category = e.target.value;
                _state.filters.page = 1;
                this.loadTools();
            });
        }

        if (tagFilter) {
            tagFilter.addEventListener('change', (e) => {
                _state.filters.tag = e.target.value;
                _state.filters.page = 1;
                this.loadTools();
            });
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', (e) => {
                _state.filters.anio = e.target.value;
                _state.filters.page = 1;
                this.loadTools();
            });
        }
        
        const pagination = _DOM.$('#pagination');
        if (pagination) {
            pagination.addEventListener('click', (e) => {
                const link = e.target.closest('.page-link');
                if (link && !link.parentElement.classList.contains('disabled') && !link.parentElement.classList.contains('active')) {
                    const page = parseInt(link.dataset.page, 10);
                    _state.filters.page = page;
                    this.loadTools();
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
        
        // Nav link for favorites
        const favLink = _DOM.$('a[href="?favoritos=true"]');
        if (favLink) {
            favLink.addEventListener('click', (e) => {
                e.preventDefault();
                _state.filters.favorito = true;
                _state.filters.page = 1;
                
                // Update URL without reload
                const url = new URL(window.location);
                url.searchParams.set('favoritos', 'true');
                window.history.pushState({}, '', url);
                
                // Update active nav link
                _DOM.$$('.nav-link').forEach(link => link.classList.remove('active'));
                favLink.classList.add('active');
                
                this.loadTools();
            });
        }
        
        // Home link reset
        const homeLink = _DOM.$('a[href="index.html"].nav-link');
        if (homeLink) {
            homeLink.addEventListener('click', () => {
                _state.filters.favorito = false;
                _state.filters.search = '';
                _state.filters.category = '';
                _state.filters.tag = '';
                _state.filters.anio = '';
                _state.filters.page = 1;
                
                // Clear URL params
                const url = new URL(window.location);
                url.searchParams.delete('favoritos');
                window.history.pushState({}, '', url);
                
                const searchInput = _DOM.$('#search-input');
                const categoryFilter = _DOM.$('#category-filter');
                const tagFilter = _DOM.$('#tag-filter');
                const yearFilter = _DOM.$('#year-filter');
                if (searchInput) searchInput.value = '';
                if (categoryFilter) categoryFilter.value = '';
                if (tagFilter) tagFilter.value = '';
                if (yearFilter) yearFilter.value = '';
                
                // Reset sorting
                const sortField = _DOM.$('#sortField');
                const sortIcon = _DOM.$('#sortIcon');
                if (sortField) sortField.value = 'nombre';
                _sortState.sortField = 'nombre';
                _sortState.sortDirection = 'asc';
                if (sortIcon) {
                    sortIcon.innerHTML = '<path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>';
                }
            });
        }
        
        // Sorting controls
        const sortFieldEl = _DOM.$('#sortField');
        const sortToggleEl = _DOM.$('#sortToggle');
        
        if (sortFieldEl) {
            sortFieldEl.addEventListener('change', (e) => {
                _sortState.sortField = e.target.value;
                this.render();
            });
        }
        
        if (sortToggleEl) {
            sortToggleEl.addEventListener('click', () => {
                _sortState.sortDirection = _sortState.sortDirection === 'asc' ? 'desc' : 'asc';
                const sortIcon = _DOM.$('#sortIcon');
                if (sortIcon) {
                    if (_sortState.sortDirection === 'asc') {
                        sortIcon.innerHTML = '<path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>';
                    } else {
                        sortIcon.innerHTML = '<path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>';
                    }
                }
                this.render();
            });
        }
    }
};

// ============================================
// App Initialization
// ============================================
const App = {
    _setupAuthNav() {
        const navList = _DOM.$('.navbar-nav');
        if (!navList) return;

        if (_Auth.isAuthenticated()) {
            const user = _Auth.getUser();
            const li = document.createElement('li');
            li.className = 'nav-item d-flex align-items-center ms-2';
            li.innerHTML = `
                <span class="text-muted small me-2">👤 ${user ? user.username : ''}</span>
                <button class="btn btn-outline-secondary btn-sm" id="logoutBtn">Salir</button>
            `;
            navList.appendChild(li);

            document.addEventListener('click', (e) => {
                if (e.target && e.target.id === 'logoutBtn') {
                    _Auth.clearAuth();
                    window.location.href = '/login';
                }
            });
        } else {
            const li = document.createElement('li');
            li.className = 'nav-item ms-2';
            li.innerHTML = `<a href="/login" class="btn btn-primary btn-sm">Iniciar sesión</a>`;
            navList.appendChild(li);
        }
    },

    init() {
        initThemeToggle();

        // Setup auth UI in navbar
        this._setupAuthNav();

        const hasVueCatalogue = !!_DOM.$('#catalogue-vue-root');

        // Check for favorites filter in URL
        const favoritosParam = _Utils.getQueryParam('favoritos');
        if (favoritosParam === 'true') {
            _state.filters.favorito = true;
        }
        
        // Update nav active state
        if (_state.filters.favorito) {
            const favLink = _DOM.$('a[href="?favoritos=true"]');
            const homeLink = _DOM.$('a[href="index.html"].nav-link');
            if (favLink) favLink.classList.add('active');
            if (homeLink) homeLink.classList.remove('active');
        }
        
        if (_state.isDetailMode) {
            const toolId = _Utils.getQueryParam('id');
            if (toolId) {
                // Initialize modal and form handlers for detail page
                Modal.init();
                ToolForm.setupEventListeners();
                DetailView.render(toolId);
            } else {
                window.location.href = 'index.html';
            }
        } else if (!hasVueCatalogue) {
            ListView.init();
        } else {
            Modal.init();
            ToolForm.setupEventListeners();
            // Vue owns the catalogue/home island in E9.
        }
    }
};

// ============================================
// Start Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
