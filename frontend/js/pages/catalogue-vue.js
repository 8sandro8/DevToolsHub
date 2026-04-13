import { computed, createApp, onMounted, reactive, ref } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.prod.js';

const ROOT_ID = 'catalogue-vue-root';
const API_BASE_URL = '/api';
const ITEMS_PER_PAGE = 12;
const AUTH_TOKEN_KEY = 'devtoolshub_token';

const DEFAULT_LOGO = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-size="40">🛠️</text></svg>';

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatRating(rating = 0) {
  const value = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  return '★'.repeat(Math.max(0, Math.min(5, value))) + '☆'.repeat(Math.max(0, 5 - value));
}

function normalizeToolPayload(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.data || payload?.tools || payload?.items || [];
}

async function requestJson(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function buildQuery(filters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('buscar', filters.search);
  if (filters.category) params.set('categoria', filters.category);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.anio) params.set('anio', filters.anio);
  if (filters.page) params.set('page', String(filters.page));
  params.set('limit', String(ITEMS_PER_PAGE));
  if (filters.favorito) params.set('favorito', 'true');
  return params.toString();
}

function renderToolCategories(categories) {
  const select = document.getElementById('tool-categories');
  if (!select) return;

  const currentValue = select.value;
  select.replaceChildren();

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Selecciona una categoría';
  select.appendChild(placeholder);

  safeArray(categories).forEach((category) => {
    const option = document.createElement('option');
    option.value = String(category.id);
    option.textContent = category.nombre;
    select.appendChild(option);
  });

  if (currentValue) {
    select.value = currentValue;
  }
}

function getVisiblePages(page, totalPages) {
  if (totalPages <= 1) return [];

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);

  if (end - start < windowSize - 1) {
    start = Math.max(1, end - windowSize + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
}

const root = document.getElementById(ROOT_ID);

if (root) {
  createApp({
    setup() {
      const state = reactive({
        tools: [],
        categories: [],
        tags: [],
        loading: true,
        error: '',
        pagination: {
          total: 0,
          page: 1,
          limit: ITEMS_PER_PAGE,
          totalPages: 0,
        },
        filters: {
          search: '',
          category: '',
          tag: '',
          anio: '',
          favorito: false,
          page: 1,
        },
      });

      const sortField = ref('nombre');
      const sortDirection = ref('asc');
      let searchTimer = null;

      const sortedTools = computed(() => {
        const tools = [...state.tools];

        tools.sort((a, b) => {
          let valueA = '';
          let valueB = '';

          if (sortField.value === 'categoria') {
            valueA = a.categories?.[0]?.nombre || '';
            valueB = b.categories?.[0]?.nombre || '';
          } else if (sortField.value === 'fecha_creacion') {
            valueA = a.fecha_creacion || '';
            valueB = b.fecha_creacion || '';
          } else {
            valueA = a.nombre || '';
            valueB = b.nombre || '';
          }

          valueA = String(valueA).toLowerCase();
          valueB = String(valueB).toLowerCase();

          if (valueA < valueB) return sortDirection.value === 'asc' ? -1 : 1;
          if (valueA > valueB) return sortDirection.value === 'asc' ? 1 : -1;
          return 0;
        });

        return tools;
      });

      const resultsText = computed(() => {
        const { total, page, limit } = state.pagination;
        if (state.loading) return 'Cargando herramientas...';
        if (state.error) return state.error;
        if (total === 0) return 'No se encontraron herramientas';

        const start = (page - 1) * limit + 1;
        const end = Math.min(page * limit, total);
        return total === 1 ? '1 herramienta encontrada' : `Mostrando ${start}-${end} de ${total} herramientas`;
      });

      const visiblePages = computed(() => getVisiblePages(state.pagination.page, state.pagination.totalPages));
      const isAuthenticated = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

      function setActiveNav() {
        const homeLink = document.getElementById('nav-home');
        const favLink = document.getElementById('nav-favorites');

        if (homeLink) homeLink.classList.toggle('active', !state.filters.favorito);
        if (favLink) favLink.classList.toggle('active', state.filters.favorito);
      }

      async function loadLookups() {
        const [categoriesPayload, tagsPayload] = await Promise.all([
          requestJson('/categories'),
          requestJson('/tags'),
        ]);

        state.categories = safeArray(categoriesPayload.categories || categoriesPayload);
        state.tags = safeArray(tagsPayload.tags || tagsPayload);
        renderToolCategories(state.categories);
      }

      async function loadTools() {
        state.loading = true;
        state.error = '';

        try {
          const payload = await requestJson(`/tools?${buildQuery(state.filters)}`);
          const tools = normalizeToolPayload(payload);

          state.tools = safeArray(tools);
          state.pagination = {
            total: payload.total || state.tools.length,
            page: payload.page || state.filters.page,
            limit: payload.limit || ITEMS_PER_PAGE,
            totalPages: payload.totalPages || Math.ceil((payload.total || state.tools.length) / ITEMS_PER_PAGE),
          };
        } catch (error) {
          state.tools = [];
          state.pagination = { total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 0 };
          state.error = 'Error al cargar el catálogo';
        } finally {
          state.loading = false;
          setActiveNav();
        }
      }

      function scheduleReload() {
        state.filters.page = 1;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(loadTools, 250);
      }

      function setFilter(key, value) {
        state.filters[key] = value;
        state.filters.page = 1;
        loadTools();
      }

      function changePage(page) {
        if (page < 1 || page > state.pagination.totalPages || page === state.pagination.page) return;
        state.filters.page = page;
        loadTools();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function toggleSort() {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      }

      function openCreateToolModal() {
        window.DevToolsHub?.openToolModal?.();
      }

      function openEditToolModal(tool) {
        console.log('[Vue] openEditToolModal called with:', tool);
        if (window.DevToolsHub?.openToolModal) {
          window.DevToolsHub.openToolModal(tool);
        } else {
          console.error('[Vue] DevToolsHub.openToolModal not available');
        }
      }

      async function toggleFavorite(toolId) {
        try {
          await fetch(`${API_BASE_URL}/tools/${toolId}/favorito`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`
            }
          });
          // Reload tools to reflect the change
          await loadTools();
        } catch (error) {
          console.error('Error toggling favorite:', error);
        }
      }

      function applyFavoritesFromQuery() {
        const params = new URLSearchParams(window.location.search);
        state.filters.favorito = params.get('favoritos') === 'true';
      }

      onMounted(async () => {
        applyFavoritesFromQuery();

        try {
          await loadLookups();
        } catch (error) {
          state.error = 'Error al cargar filtros';
          state.loading = false;
          return;
        }

        await loadTools();
      });

      return {
        state,
        sortField,
        sortDirection,
        sortedTools,
        resultsText,
        visiblePages,
        setFilter,
        changePage,
        scheduleReload,
        toggleSort,
        openCreateToolModal,
        openEditToolModal,
        toggleFavorite,
        formatRating,
        DEFAULT_LOGO,
        isAuthenticated,
      };
    },
    template: `
      <section v-if="isAuthenticated" class="d-flex justify-content-end mb-3">
        <button id="btn-add-tool" type="button" class="btn btn-primary" @click="openCreateToolModal">
          <i class="bi bi-plus-lg me-1"></i> Crear nueva herramienta
        </button>
      </section>

      <section class="search-section mb-4">
        <div class="row g-3 mb-3">
          <div class="col-12 col-md">
            <div class="input-group">
              <span class="input-group-text bg-white">🔎</span>
              <input
                type="search"
                class="form-control"
                placeholder="Buscar herramientas..."
                autocomplete="off"
                aria-label="Buscar herramientas"
                :value="state.filters.search"
                @input="(event) => { state.filters.search = event.target.value; scheduleReload(); }"
              >
            </div>
          </div>

          <div class="col-12 col-sm-auto col-md-auto">
            <select class="form-select" :value="state.filters.category" @change="(event) => setFilter('category', event.target.value)">
              <option value="">Todas las categorías</option>
              <option v-for="category in state.categories" :key="category.id" :value="String(category.id)">{{ category.nombre }}</option>
            </select>
          </div>

          <div class="col-12 col-sm-auto col-md-auto">
            <select class="form-select" :value="state.filters.tag" @change="(event) => setFilter('tag', event.target.value)">
              <option value="">Todos los tags</option>
              <option v-for="tag in state.tags" :key="tag.id" :value="String(tag.id)">{{ tag.nombre }}</option>
            </select>
          </div>

          <div class="col-12 col-sm-auto col-md-auto">
            <select class="form-select" :value="state.filters.anio" @change="(event) => setFilter('anio', event.target.value)">
              <option value="">Todos los años</option>
              <option v-for="year in Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index)" :key="year" :value="String(year)">{{ year }}</option>
            </select>
          </div>

          <div class="col-12 col-sm-auto col-md-auto">
            <div class="d-flex align-items-center gap-2">
              <select class="form-select form-select-sm" style="width: auto;" v-model="sortField">
                <option value="nombre">Nombre</option>
                <option value="categoria">Categoría</option>
                <option value="fecha_creacion">Fecha</option>
              </select>
              <button class="btn btn-sm btn-outline-secondary" type="button" title="Cambiar orden" @click="toggleSort()">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </button>
            </div>
          </div>
        </div>

        <div class="text-muted small" aria-live="polite">{{ resultsText }}</div>
      </section>

      <section class="tools-section mb-4" aria-label="Catálogo de herramientas">
        <div class="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4">
          <template v-if="state.loading">
            <div class="col-12 text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2 text-muted">Cargando herramientas...</p>
            </div>
          </template>

          <template v-else-if="state.error">
            <div class="col-12">
              <div class="alert alert-danger mb-0">{{ state.error }}</div>
            </div>
          </template>

          <template v-else-if="sortedTools.length === 0">
            <div class="col-12 text-center py-5">
              <p class="mb-0 text-muted">No se encontraron herramientas. Prueba con otros filtros.</p>
            </div>
          </template>

          <article v-for="tool in sortedTools" :key="tool.id" class="col">
            <div class="card h-100 border-0 shadow-sm tool-card">
              <div class="card-header bg-transparent border-0 pt-3">
                <div class="d-flex justify-content-between align-items-start gap-3">
                  <img class="tool-logo rounded" :src="tool.external_thumbnail || tool.image_url || tool.logo_url || DEFAULT_LOGO" :alt="tool.nombre + ' logo'" width="48" height="48" loading="lazy">
                  <span class="tool-rating text-warning" :aria-label="'Valoración ' + (tool.rating || 0) + ' de 5'">{{ formatRating(tool.rating || 0) }}</span>
                </div>
              </div>
              <div class="card-body pt-2">
                <h3 class="card-title h6 tool-name mb-2">{{ tool.nombre }}</h3>
                <div v-if="tool.external_source" class="mb-2">
                  <span class="badge text-bg-secondary">Fuente: {{ tool.external_source }}</span>
                </div>
                <ul class="list-unstyled small mb-2">
                  <li class="mb-1">
                    <span class="fw-semibold">Categoría:</span>
                    <span>{{ tool.categories?.[0]?.nombre || 'Sin categoría' }}</span>
                  </li>
                  <li class="mb-1 text-muted">
                    <span class="fw-semibold text-body">Descripción:</span>
                    <span>{{ (tool.descripcion || 'Sin descripción').slice(0, 120) }}</span>
                  </li>
                  <li>
                    <span class="fw-semibold">Tags:</span>
                    <span>{{ tool.tags?.length ? tool.tags.map((tag) => tag.nombre).join(', ') : 'Sin tags' }}</span>
                  </li>
                </ul>
              </div>
              <div class="card-footer bg-transparent border-0 pb-3">
                <div class="d-flex gap-2">
                  <a class="btn btn-outline-primary btn-sm flex-grow-1" :href="'detalle.html?id=' + tool.id">Ver detalle</a>
                  <button v-if="isAuthenticated" class="btn btn-outline-secondary btn-icon btn-edit" aria-label="Editar herramienta" title="Editar" @click="openEditToolModal(tool)">
                    <span class="edit-icon">✏️</span>
                  </button>
                  <button v-if="isAuthenticated" class="btn btn-icon btn-favorite" :class="tool.es_favorito ? 'btn-warning' : 'btn-outline-warning'" aria-label="Marcar como favorito" :title="tool.es_favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'" @click="toggleFavorite(tool.id)">
                    <span class="favorite-icon">{{ tool.es_favorito ? '★' : '☆' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <nav v-if="state.pagination.totalPages > 1" aria-label="Paginación" class="d-flex justify-content-center">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: state.pagination.page === 1 }">
            <button class="page-link" type="button" @click="changePage(state.pagination.page - 1)">Anterior</button>
          </li>
          <li v-if="visiblePages[0] > 1" class="page-item"><span class="page-link">1</span></li>
          <li v-if="visiblePages[0] > 2" class="page-item disabled"><span class="page-link">...</span></li>
          <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === state.pagination.page }">
            <button class="page-link" type="button" @click="changePage(page)">{{ page }}</button>
          </li>
          <li v-if="visiblePages[visiblePages.length - 1] < state.pagination.totalPages - 1" class="page-item disabled"><span class="page-link">...</span></li>
          <li v-if="visiblePages[visiblePages.length - 1] < state.pagination.totalPages" class="page-item"><span class="page-link">{{ state.pagination.totalPages }}</span></li>
          <li class="page-item" :class="{ disabled: state.pagination.page === state.pagination.totalPages }">
            <button class="page-link" type="button" @click="changePage(state.pagination.page + 1)">Siguiente</button>
          </li>
        </ul>
      </nav>
    `,
  });

  // Listen for tool-saved events from app.js (used by both ListView and Vue)
  document.addEventListener('tool-saved', () => {
    console.log('[Vue] Tool saved event received, reloading tools');
    loadTools();
  });

}).mount(`#${ROOT_ID}`);
}
