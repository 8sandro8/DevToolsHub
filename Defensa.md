# GUÍA DE DEFENSA - DevToolsHub

> **NOTA:** Este archivo está en .gitignore - solo tú puedes verlo

---

## ACCESO AL PROYECTO

- **Web:** http://192.168.1.77:4004/
- **Nota:** Proyecto dockerizado en NAS Synology. Servidor siempre levantado. No requiere ejecución local.

---

## CHECKLIST GLOBAL

### Lenguajes de Marcas (10 pts)

| Requisito | Puntos | Estado |
|-----------|--------|--------|
| Lista con nombre + 3 características | 2 | ✅ |
| Buscador en parte superior | 1 | ✅ |
| Click en nombre → página detalle | 1 | ✅ |
| CRUD completo desde frontend | 1 | ✅ |
| Detalle con imagen + info ampliada | 2 | ✅ |
| APIs externas (Wikipedia + GitHub) | 2 | ✅ |
| Diseño HTML+CSS limpio y responsive | 2 | ✅ |

### Entornos de Desarrollo (10 pts obligatorios + extras)

| Requisito | Puntos | Estado |
|-----------|--------|--------|
| Backend CRUD + REST API | 1 | ✅ |
| Frontend CRUD 2+ entidades | 1 | ✅ |
| GitHub repo + README | 1 | ✅ |
| GitFlow con ramas y PRs | 1 | ✅ |
| Relaciones entre elementos | 1 | ✅ |
| Login con usuario/contraseña (JWT) | 1 | ✅ |
| Validación backend (express-validator) | 1 | ✅ |
| Validación frontend con mensajes error | 1 | ✅ |
| Vue.js framework | 1 | ✅ |
| Nuevo elemento con CRUD (Comments) | 1 | ✅ |
| Wiki API en GitHub | 1 | ✅ |
| Colección Postman/Hoppscotch | 1 | ✅ |
| Operaciones con imágenes | 1 | ✅ |

---

## DESGLOSE PUNTO POR PUNTO

---

### [Lenguajes de Marcas] Lista con nombre + 3 características

**Cómo verlo en la web:** Abre http://192.168.1.77:4004/ → Verás 7 herramientas en cards con nombre, categoría, descripción y tags.

**Cómo verlo en el código:** `frontend/index.html` línea 289-331 (template card) + `frontend/js/pages/catalogue-vue.js` línea 44-100 (renderizado Vue).

**Resumen para el profesor:** Vue.js renderiza dinámicamente las cards desde la API. Cada card muestra: nombre, categoría, descripción y tags. Soporta skeleton loading mientras cargan los datos.

---

### [Lenguajes de Marcas] Buscador en parte superior

**Cómo verlo en la web:** En el catálogo, escribe "Postman" en el campo con icono 🔎 → Filtrado instantáneo.

**Cómo verlo en el código:** `frontend/index.html` línea 105-121 (input) + `frontend/js/app.js` línea 420-445 (función que llama a API con parámetro `buscar`).

**Resumen para el profesor:** Búsqueda en tiempo real via API con debounce. Usa FTS5 (Full-Text Search) en backend para búsqueda rápida de términos.

---

### [Lenguajes de Marcas] Click en nombre → página detalle

**Cómo verlo en la web:** Click en "Ver detalle" de cualquier card → Se abre `detalle.html?id=X`.

**Cómo verlo en el código:** `frontend/index.html` línea 320 (enlace con href dinámico) + `frontend/detalle.html` (página completa) + `frontend/js/app.js` línea 1260-1450 (`renderToolDetail()`).

**Resumen para el profesor:** Navegación a página detalle pasando ID por query param. Carga datos via `GET /api/tools/:id` y renderiza todas las secciones.

---

### [Lenguajes de Marcas] CRUD completo desde frontend

**Cómo verlo en la web:** Botón ➕ (crear), ✏️ (editar), 🗑️ (eliminar) en cada card.

**Cómo verlo en el código:** `frontend/index.html` línea 85-230 (modal crear/editar) + `frontend/js/app.js` línea 600-750 (`createTool()`, `updateTool()`, `deleteTool()`). API: `POST/PUT/DELETE /api/tools`.

**Resumen para el profesor:** Formulario con validación Bootstrap, tags y categorías desde dropdowns, rating con slider visual, subida de imagen opcional.

---

### [Lenguajes de Marcas] Detalle con imagen + información ampliada

**Cómo verlo en la web:** Ve a detalle de Postman (id=1) → Logo 140x140px, nombre grandote, rating con estrellas, descripción completa, categoría, tags, metadata.

**Cómo verlo en el código:** `frontend/detalle.html` + `frontend/js/app.js` línea 1260-1550 (`renderToolDetail()`) + `frontend/css/styles.css` línea 406-500.

**Resumen para el profesor:** Header con logo, título y rating. Secciones: descripción, Wikipedia, URL, categorías con badges, tags, fechas de creación/modificación.

---

### [Lenguajes de Marcas] APIs externas (Wikipedia + GitHub)

**Cómo verlo en la web:** En detalle de Postman → Sección Wikipedia con resumen enriquecido. En detalle de GitHub → Stats del repo (stars, forks, último commit).

**Cómo verlo en el código:** `backend/src/services/external-catalog.service.js` (Wikipedia API) + `backend/src/controllers/github.controller.js` (GitHub stats) + `frontend/js/app.js` línea 1330-1365.

**Resumen para el profesor:** Al cargar `/api/tools/:id`, el backend consulta Wikipedia API y guarda `external_title`, `external_summary`. GitHub stats: `GET /api/tools/:id/github-stats` devuelve stars, forks, open_issues, last_commit.

---

### [Lenguajes de Marcas] Diseño HTML+CSS limpio y responsive

**Cómo verlo en la web:** Toggle tema oscuro (botón navbar) + F12 → Device toolbar → Ver catálogo en móvil (cards se apilan verticalmente).

**Cómo verlo en el código:** `frontend/css/styles.css` línea 1-100 (variables CSS) + línea 710-850 (dark theme con `[data-bs-theme="dark"]`) + línea 810-850 (media queries 768px).

**Resumen para el profesor:** CSS Variables para colores, Flexbox/Grid (Bootstrap), dark mode con custom properties, animaciones fadeInUp, responsive mobile-first.

---

### [Entornos] Backend CRUD completo + REST API

**Cómo verlo en la web:** Todas las operaciones via API (sin acceso directo a BD). CRUD visible desde frontend.

**Cómo verlo en el código:** `backend/src/routes/tool.routes.js` → `GET /api/tools`, `GET /api/tools/:id`, `POST /api/tools`, `PUT /api/tools/:id`, `DELETE /api/tools/:id`, `PATCH /api/tools/:id/favorito` + controller/service/repository.

**Resumen para el profesor:** API RESTful con respuestas JSON `{data, total, page, limit}`. Autenticación JWT para mutaciones, validación con express-validator.

---

### [Entornos] Frontend CRUD para 2+ entidades

**Cómo verlo en la web:** Herramientas (crear/editar/eliminar) + Tags ("Gestionar Tags" en modal → CRUD completo).

**Cómo verlo en el código:** `frontend/js/api/tagsApi.js` + `frontend/js/components/tagManager.js` + `frontend/index.html` línea 235-290 (modal tags).

**Resumen para el profesor:** Tags y Categorías son entidades relacionadas con Tools (many-to-many). Asociación via arrays de IDs. CRUD completo para tags desde frontend.

---

### [Entornos] GitHub repo + README

**Cómo verlo en la web:** https://github.com/8sandro8/DevToolsHub → README.md con descripción, setup, tecnologías, endpoints.

**Cómo verlo en el código:** `README.md` + `docs/API_WIKI.md` + `.gitignore`, `LICENSE`.

**Resumen para el profesor:** Tabla de tecnologías (Node.js, Express, SQLite, Bootstrap, Vue), instrucciones Docker y sin Docker, credenciales de prueba, colección Postman.

---

### [Entornos] GitFlow con ramas y PRs

**Cómo verlo en la web:** https://github.com/8sandro8/DevToolsHub/pulls?q=is%3Apr → 23 PRs mergeados.

**Cómo verlo en el código:** Ramas: `main` (estable), `develop` (integración), `feature/*`, `hotfix/*`.

**Resumen para el profesor:** Cada funcionalidad en rama separada, fusionada via PR con nombres descriptivos en español.

---

### [Entornos] Relaciones entre elementos del modelo

**Cómo verlo en el código:** `database/schema.sql` → `tool_category` (many-to-many), `tool_tag` (many-to-many), `tool_comment` (one-to-many) + `backend/src/repositories/tool.repository.js` línea 81-120 (`getCategories()`, `getTags()`).

**Resumen para el profesor:** Una tool puede tener múltiples categorías y tags reutilizables. Comments relacionados con tools via FK.

---

### [Entornos] Login con usuario/contraseña (JWT)

**Cómo verlo en la web:** http://192.168.1.77:4004/login.html → Login con usuario `Sandro`, contraseña `Sandro`. Navbar muestra "Sandro" y botón "Salir".

**Cómo verlo en el código:** `backend/src/routes/auth.routes.js` (`/api/auth/register`, `/api/auth/login`) + `backend/src/middleware/auth.middleware.js` + `backend/src/services/auth.service.js` (bcrypt + JWT).

**Resumen para el profesor:** Password hasheado con bcrypt, token JWT 24h, middleware protege rutas de mutación, token en localStorage.

---

### [Entornos] Validación backend con express-validator

**Cómo verlo en el código:** `backend/src/routes/tool.routes.js` línea 28-40 con `body('nombre').trim().notEmpty()`, `body('url').optional().isURL()`, etc. + `backend/src/middleware/validate.js` + `backend/src/app.js` línea 124-130 (error handler).

**Resumen para el profesor:** Validación estricta en servidor, mensajes de error en español,拒绝 datos inválidos (400), sanitización de inputs.

---

### [Entornos] Validación frontend con mensajes de error

**Cómo verlo en la web:** Crear herramienta sin nombre → Mensaje rojo "El nombre es obligatorio".

**Cómo verlo en el código:** `frontend/index.html` líneas 107, 121, 134 (`div.invalid-feedback`) + `frontend/js/validation.js` + `frontend/js/app.js` línea 600-650 (`validateToolForm()`, `showFieldError()`).

**Resumen para el profesor:** Validación HTML5 + JavaScript custom, mensajes inline, Bootstrap `class="is-invalid"`, prevención de envío si hay errores.

---

### [Entornos] Vue.js framework

**Cómo verlo en el código:** `frontend/index.html` línea 342 `<script src="js/pages/catalogue-vue.js" type="module">` + `frontend/js/pages/catalogue-vue.js` con `import { computed, createApp, onMounted, reactive, ref } from 'vue'`.

**Resumen para el profesor:** Vue 3 Composition API con estado reactivo `ref()`/`reactive()`, propiedades computadas `computed()`, ciclo de vida `onMounted()`.

---

### [Entornos] Nuevo elemento con CRUD completo (Comments)

**Cómo verlo en la web:** Detalle de cualquier herramienta → Sección "Comentarios" abajo del todo → Escribe comentario y pulsa "Publicar".

**Cómo verlo en el código:** `database/schema.sql` línea 101-108 (tabla `tool_comment`) + `backend/src/routes/comment.routes.js` + `backend/src/services/comment.service.js` + `frontend/js/app.js` líneas 1453-1470.

**Resumen para el profesor:** Tabla relacionada con tool via FK, CRUD: GET comments, POST new comment. Muestra autor, contenido, fecha. Protegido con JWT.

---

### [Entornos] Wiki API en GitHub

**Cómo verlo en la web:** https://github.com/8sandro8/DevToolsHub → docs/API_WIKI.md.

**Resumen para el profesor:** Documentación completa: autenticación JWT, todos los endpoints (Tools, Categories, Tags, Auth), parámetros, códigos de respuesta, ejemplos.

---

### [Entornos] Colección Postman/Hoppscotch

**Cómo verlo en el código:** `docs/DevToolsHub.postman_collection.json` + `docs/DevToolsHub.hoppscotch.json`.

**Resumen para el profesor:** Requests para todas las rutas (GET, POST, PUT, DELETE), variables de entorno configuradas, headers de autenticación predefinidos.

---

### [Entornos] Operaciones con imágenes

**Cómo verlo en la web:** Crear/editar herramienta → Campo "Logo URL" o "Subir imagen" → Logo visible en card y detalle.

**Cómo verlo en el código:** `backend/src/routes/upload.routes.js` (`POST /api/upload`) + `backend/src/middleware/upload.middleware.js` (multipart/form-data) + `backend/src/config/paths.js` (directorio `/data/uploads`).

**Resumen para el profesor:** Upload imágenes (jpg, png, gif, webp, svg), máximo 5MB, guardado en `/data/uploads`, endpoint `POST /api/upload` con `toolId` y `file`.

---

## PROPUESTAS

**Detalle técnico para lucirte:**

1. **FTS5 Full-Text Search:** El buscador usa SQLite FTS5 para búsqueda performant, no `LIKE` `%texto%` (que es O(n)).

2. **Vue 3 Composition API:** No es Vue completo con componentes `.vue`, sino Vue embebido via ES modules - approach ligero para páginas SPA sin build step.

3. **Docker multi-stage:** El Dockerfile usa multi-stage build para minimizar la imagen final.

4. **CORS configurado:** Backend permite orígenes específicos, no `*` (más seguro).

5. **bcrypt cost factor 10:** Hash de passwords conbcrypt, no MD5/SHA1.

6. **JWT sin stored en cookies httpOnly:** Token en localStorage (aceptable para SPA demo, producción usaría httpOnly cookies).

---

*Última actualización: 3 de mayo de 2026*