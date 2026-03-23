/**
 * DevToolsHub - Frontend Application
 * ES6+ Vanilla JavaScript
 */

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
    filters: {
        search: '',
        category: '',
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

// ============================================
// API Client
// ============================================
const _API = {
    async request(endpoint, options = {}) {
        const url = `${_CONFIG.API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
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
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        
        return this.request(`/tools?${params.toString()}`);
    },

    getToolById(id) {
        return this.request(`/tools/${id}`);
    },

    getCategories() {
        return this.request('/categories');
    },

    healthCheck() {
        return this.request('/health');
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
    }
};

// ============================================
// Tool Card Component
// ============================================
const ToolCard = {
    render(tool) {
        const card = _DOM.createElement('article', 'tool-card');
        
        const logo = _DOM.createElement('img', 'tool-logo', {
            src: tool.logo_url || _CONFIG.DEFAULT_LOGO,
            alt: `${tool.nombre} logo`
        });
        
        const ratingStars = _DOM.createElement('span', 'rating-stars', {
            textContent: _Utils.formatRating(tool.rating || 0)
        });
        
        const metaDiv = _DOM.createElement('div', 'tool-meta');
        metaDiv.appendChild(ratingStars);
        
        const headerDiv = _DOM.createElement('div', 'tool-header');
        headerDiv.appendChild(logo);
        headerDiv.appendChild(metaDiv);
        
        const name = _DOM.createElement('h3', 'tool-name', {
            textContent: tool.nombre
        });
        
        const description = _DOM.createElement('p', 'tool-description', {
            textContent: tool.descripcion || 'Sin descripción'
        });
        
        const categoriesDiv = _DOM.createElement('div', 'tool-categories');
        if (tool.categories && tool.categories.length > 0) {
            tool.categories.forEach(cat => {
                const catSpan = _DOM.createElement('span', 'tool-category', {
                    textContent: cat.nombre
                });
                categoriesDiv.appendChild(catSpan);
            });
        }
        
        const detailLink = _DOM.createElement('a', 'btn btn-primary btn-detail', {
            href: `detalle.html?id=${tool.id}`,
            textContent: 'Ver detalle'
        });
        
        const favoriteBtn = _DOM.createElement('button', 'btn btn-icon btn-favorite', {
            'aria-label': tool.es_favorito ? 'Quitar de favoritos' : 'Marcar como favorito',
            'data-id': tool.id
        });
        
        const favIcon = _DOM.createElement('span', 'favorite-icon', {
            textContent: tool.es_favorito ? '★' : '☆'
        });
        favoriteBtn.appendChild(favIcon);
        
        if (tool.es_favorito) {
            favoriteBtn.classList.add('favorited');
        }
        
        const actionsDiv = _DOM.createElement('div', 'tool-actions');
        actionsDiv.appendChild(detailLink);
        actionsDiv.appendChild(favoriteBtn);
        
        card.appendChild(headerDiv);
        card.appendChild(name);
        card.appendChild(description);
        card.appendChild(categoriesDiv);
        card.appendChild(actionsDiv);
        
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
// Pagination Component
// ============================================
const Pagination = {
    render(pagination) {
        const container = _DOM.$('#pagination');
        if (!container) return;
        
        _DOM.clearElement(container);
        
        if (pagination.totalPages <= 1) return;
        
        const { page, totalPages } = pagination;
        
        // Previous button
        const prevBtn = _DOM.createElement('button', 'pagination-btn', {
            textContent: '← Anterior',
            disabled: page === 1,
            'data-page': page - 1
        });
        container.appendChild(prevBtn);
        
        // Page numbers
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        if (start > 1) {
            const firstBtn = _DOM.createElement('button', 'pagination-btn', {
                textContent: '1',
                'data-page': 1
            });
            container.appendChild(firstBtn);
            
            if (start > 2) {
                const dots = _DOM.createElement('span', 'pagination-info', {
                    textContent: '...'
                });
                container.appendChild(dots);
            }
        }
        
        for (let i = start; i <= end; i++) {
            const pageBtn = _DOM.createElement('button', `pagination-btn ${i === page ? 'active' : ''}`, {
                textContent: i,
                'data-page': i
            });
            container.appendChild(pageBtn);
        }
        
        if (end < totalPages) {
            if (end < totalPages - 1) {
                const dots = _DOM.createElement('span', 'pagination-info', {
                    textContent: '...'
                });
                container.appendChild(dots);
            }
            
            const lastBtn = _DOM.createElement('button', 'pagination-btn', {
                textContent: totalPages,
                'data-page': totalPages
            });
            container.appendChild(lastBtn);
        }
        
        // Next button
        const nextBtn = _DOM.createElement('button', 'pagination-btn', {
            textContent: 'Siguiente →',
            disabled: page === totalPages,
            'data-page': page + 1
        });
        container.appendChild(nextBtn);
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
// Detail View Component
// ============================================
const DetailView = {
    async render(toolId) {
        const container = _DOM.$('#tool-detail');
        if (!container) return;
        
        try {
            const data = await _API.getToolById(toolId);
            const tool = data.tool || data;
            
            _DOM.clearElement(container);
            
            const backLink = _DOM.createElement('a', 'back-link', {
                href: 'index.html',
                textContent: '← Volver al catálogo'
            });
            
            const headerDiv = _DOM.createElement('div', 'tool-detail-header');
            
            const logo = _DOM.createElement('img', 'tool-detail-logo', {
                src: tool.logo_url || _CONFIG.DEFAULT_LOGO,
                alt: `${tool.nombre} logo`
            });
            
            const infoDiv = _DOM.createElement('div', 'tool-detail-info');
            
            const title = _DOM.createElement('h2', 'tool-detail-title', {
                textContent: tool.nombre
            });
            
            const description = _DOM.createElement('p', 'tool-detail-description', {
                textContent: tool.descripcion || 'Sin descripción'
            });
            
            const metaDiv = _DOM.createElement('div', 'tool-detail-meta');
            
            const ratingSpan = _DOM.createElement('span', 'tool-detail-rating', {
                textContent: `Valoración: ${_Utils.formatRating(tool.rating || 0)}`
            });
            
            const createdSpan = _DOM.createElement('span', '', {
                textContent: `Creado: ${_Utils.formatDate(tool.fecha_creacion)}`
            });
            
            const updatedSpan = _DOM.createElement('span', '', {
                textContent: `Actualizado: ${_Utils.formatDate(tool.fecha_actualizacion)}`
            });
            
            metaDiv.appendChild(ratingSpan);
            metaDiv.appendChild(createdSpan);
            metaDiv.appendChild(updatedSpan);
            
            infoDiv.appendChild(title);
            infoDiv.appendChild(description);
            infoDiv.appendChild(metaDiv);
            
            if (tool.url) {
                const urlLink = _DOM.createElement('a', 'tool-detail-url', {
                    href: tool.url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    textContent: '🔗 Visitar sitio web'
                });
                infoDiv.appendChild(urlLink);
            }
            
            headerDiv.appendChild(logo);
            headerDiv.appendChild(infoDiv);
            
            const categoriesDiv = _DOM.createElement('div', 'tool-detail-categories');
            const catTitle = _DOM.createElement('h3', '', {
                textContent: 'Categorías'
            });
            categoriesDiv.appendChild(catTitle);
            
            const catContainer = _DOM.createElement('div', 'tool-categories');
            if (tool.categories && tool.categories.length > 0) {
                tool.categories.forEach(cat => {
                    const catSpan = _DOM.createElement('span', 'tool-category', {
                        textContent: cat.nombre
                    });
                    catContainer.appendChild(catSpan);
                });
            } else {
                const noCat = _DOM.createElement('p', '', {
                    textContent: 'Sin categorías'
                });
                catContainer.appendChild(noCat);
            }
            categoriesDiv.appendChild(catContainer);
            
            container.appendChild(backLink);
            container.appendChild(headerDiv);
            container.appendChild(categoriesDiv);
            
        } catch (error) {
            _DOM.clearElement(container);
            const errorMsg = _DOM.createElement('div', 'error-message', {
                innerHTML: `<p>Error al cargar los detalles de la herramienta.</p>
                           <button class="btn btn-retry" onclick="location.reload()">Reintentar</button>`
            });
            container.appendChild(errorMsg);
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
            
            // Load tools
            await this.loadTools();
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            this.showError('Error al cargar los datos. Asegúrate de que el servidor esté funcionando.');
        }
    },
    
    async loadTools() {
        const grid = _DOM.$('#tools-grid');
        if (!grid) return;
        
        // Show loading
        _DOM.clearElement(grid);
        const spinner = _DOM.createElement('div', 'loading-spinner', {
            innerHTML: '<div class="spinner"></div><p>Cargando herramientas...</p>'
        });
        grid.appendChild(spinner);
        
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
            const emptyMsg = _DOM.createElement('div', 'empty-message', {
                textContent: 'No se encontraron herramientas. Prueba con otros filtros.'
            });
            grid.appendChild(emptyMsg);
        } else {
            _state.tools.forEach((tool, index) => {
                const card = ToolCard.render(tool);
                card.style.animationDelay = `${index * 0.05}s`;
                grid.appendChild(card);
            });
        }
        
        ResultsCount.render(_state.pagination);
        Pagination.render(_state.pagination);
    },
    
    showError(message) {
        const grid = _DOM.$('#tools-grid');
        if (!grid) return;
        
        _DOM.clearElement(grid);
        const errorMsg = _DOM.createElement('div', 'error-message', {
            innerHTML: `<p>${message}</p><button class="btn btn-retry" onclick="App.init()">Reintentar</button>`
        });
        grid.appendChild(errorMsg);
        
        const count = _DOM.$('#results-count');
        if (count) count.textContent = 'Error al cargar';
    },
    
    setupEventListeners() {
        const searchInput = _DOM.$('#search-input');
        const categoryFilter = _DOM.$('#category-filter');
        
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
        
        const pagination = _DOM.$('#pagination');
        if (pagination) {
            pagination.addEventListener('click', (e) => {
                if (e.target.classList.contains('pagination-btn') && !e.target.disabled) {
                    const page = parseInt(e.target.dataset.page, 10);
                    _state.filters.page = page;
                    this.loadTools();
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    }
};

// ============================================
// App Initialization
// ============================================
const App = {
    init() {
        if (_state.isDetailMode) {
            const toolId = _Utils.getQueryParam('id');
            if (toolId) {
                DetailView.render(toolId);
            } else {
                window.location.href = 'index.html';
            }
        } else {
            ListView.init();
        }
    }
};

// ============================================
// Start Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});