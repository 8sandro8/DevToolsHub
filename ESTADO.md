# ESTADO.md — DevToolsHub
> Fuente de verdad única. Leer esto al iniciar cualquier sesión nueva.

---

## Última actualización
**Fecha:** 2026-03-24
**Sesión:** GitHub API + fixes UI — merge completado en main

---

## ✅ Completado hasta hoy

### Funcionalidades implementadas
- **MVP Base**: CRUD de herramientas y categorías, Bootstrap 5 UI, favoritos, modal agregar/editar, página detalle (`detalle.html`)
- **Tags CRUD**: Sistema completo de tags (backend + frontend + relación tool_tag)
- **Login básico JWT** ✅ MERGEADO en `develop`:
  - Tabla `user` en SQLite
  - `POST /api/auth/register` y `POST /api/auth/login`
  - Middleware `authenticateToken` (protege POST/PUT/PATCH/DELETE; GET queda público)
  - `login.html` con tabs Bootstrap 5 (Login / Registro)
  - Gestión de token en `localStorage` (`frontend/js/auth.js`)
  - Botón Logout + nombre de usuario en navbar
  - **51 tests passing (0 fallos)**
- **Upload de imágenes** ✅ MERGEADO en `develop` (PR #4):
  - Columna `image_url TEXT DEFAULT NULL` en tabla `tool`
  - Script de migración: `database/migrations/add_image_url.sql`
  - Middleware `multer` — almacenamiento en `backend/uploads/`, filtros imagen, límite 5MB
  - `POST /api/tools/:id/image` — sube imagen (protegido con JWT)
  - `DELETE /api/tools/:id/image` — elimina imagen (protegido con JWT)
  - Frontend: preview en modal, imagen en cards y detalle
  - 7 tests en `backend/tests/integration/upload.api.test.js`
- **PWA** ✅ MERGEADO en `develop` (PR #6):
  - `frontend/manifest.json` — nombre, iconos, colores, display standalone
  - `frontend/sw.js` — Service Worker (Network First API / Cache First estáticos)
  - `frontend/icons/` — iconos 192x192 y 512x512
  - Meta tags PWA + registro SW en los 3 HTML
- **Ordenamiento asc/desc** ✅ MERGEADO en `develop` (PR #7):
  - Selector de campo: Nombre / Categoría / Fecha de creación
  - Botón toggle asc/desc con icono SVG inline
  - Ordenamiento en memoria sobre `ListView._state.tools` (sin recarga)
  - `sortTools()` integrada en `ListView.render()`
  - `_sortState` como objeto de estado local al módulo
  - Reset de sorting al limpiar filtros ("Inicio")
  - Ordenamiento por categoría toma la primera del array
- **Validación backend** ⏳ PR #11 abierto (`feature/validacion-backend` → `develop`):
  - Validaciones con límites de longitud en tools (nombre 100, descripción 500) y categories (nombre 100, descripción 300)
  - Fix URL nullable en PUT tools: `optional({ nullable: true, checkFalsy: true })`
  - Middleware `validate` aplicado uniformemente en POST y PUT
  - Nuevo endpoint `PUT /api/categories/:id` con validación completa
  - Tests nuevos en `backend/tests/integration/categories.api.test.js`
- **GitHub API integration + fixes UI** ✅ PR #13 abierto (`feature/github-api-v2` → `develop`):
  - `GitHubController` — extrae owner/repo de URL, llama a GitHub API
  - Endpoint `GET /api/tools/:id/github-stats` — devuelve stars, forks, último commit, nombre del repo
  - Soporte para `GITHUB_TOKEN` opcional (aumenta rate limit de 60 a 5000 req/hora)
  - Frontend: sección "Stats del Repo GitHub" en página detalle con cards Bootstrap 5
  - Carga asíncrona de stats al abrir la página de detalle
  - Fix captura de errores API: maneja `error.message`, `error.error` y `error.errors[]`
  - Fix `tagManager.js`: utilidades DOM locales `_TM` (elimina dependencia de `_DOM` de app.js)
  - Fix `tagsApi.js`: config local `_TAGS_API_CONFIG` (elimina dependencia de `_CONFIG` de app.js)
  - Fix grid de cards: `row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4` — cards de tamaño fijo
  - Fix CSS: `.tool-name` truncado a 2 líneas, `.tool-description` truncado a 3 líneas

### Git / GitHub
- **PR #3 mergeado**: `feature/login-basico` → `develop` ✅
- **PR #4 mergeado**: `feature/upload-imagenes` → `develop` ✅
- **PR #6 mergeado**: `feature/pwa` → `develop` ✅
- **PR #7 mergeado**: `feature/ordenamiento` → `develop` ✅
- **PR #11 abierto**: `feature/validacion-backend` → `develop` ⏳
  - URL: https://github.com/8sandro8/DevToolsHub/pull/11
- **PR #13 abierto**: `feature/github-api-v2` → `develop` ⏳
  - URL: https://github.com/8sandro8/DevToolsHub/pull/13
- Rama activa: `feature/github-api-v2`
- `main` sincronizado con develop

---

## ⚠️ Errores / Pendientes técnicos

- Tests no ejecutables en el entorno local del agente (better-sqlite3 requiere compilación nativa con Visual Studio). Los tests existentes deberían pasar en entorno correcto.
- `Gentleman-Skills/` y `nul` aparecen como untracked en git (son del entorno, ignorar).
- `backend/.env` untracked (correcto — contiene secretos, está en .gitignore).
- Iconos PWA son SVG con extensión `.png` (válido navegadores modernos; si se necesitan PNG reales, generar con Sharp o similar).

---

## 🎯 Próximo paso exacto

**ACCIÓN INMEDIATA:** Ninguna — repositorio sincronizado.

**SIGUIENTE FEATURE:** `Digitalización (comparativa IDEs)`
- Feature para comparar IDEs y herramientas de desarrollo

**BACKLOG (en orden):**
| # | Feature | Estado |
|---|---------|--------|
| 1 | ~~Login básico~~ | ✅ Mergeado |
| 2 | ~~Upload de imágenes~~ | ✅ Mergeado |
| 3 | ~~PWA (Service Worker + manifest)~~ | ✅ Mergeado |
| 4 | ~~Ordenamiento asc/desc~~ | ✅ Mergeado |
| 5 | Validación backend | ✅ Mergeado en main |
| 6 | GitHub API + fixes UI | ✅ Mergeado en main |
| 7 | Digitalización (comparativa IDEs) | ⏳ Entrega: 27 mayo 2026 |

---

## 📁 Archivos clave del proyecto

| Archivo | Rol |
|---------|-----|
| `backend/src/app.js` | Entry point Express + rutas + middleware auth + static /uploads |
| `backend/src/middleware/auth.middleware.js` | JWT Bearer verification |
| `backend/src/middleware/upload.middleware.js` | Multer config — diskStorage, filtros, 5MB |
| `backend/src/middleware/validate.js` | express-validator result handler — 400 si hay errores |
| `backend/src/controllers/upload.controller.js` | Upload/delete de imagen por tool ID |
| `backend/src/services/auth.service.js` | Lógica register/login/verify |
| `database/schema.sql` | Schema SQLite (tool, category, tag, user) + image_url |
| `database/migrations/add_image_url.sql` | Migración para BDs existentes |
| `frontend/manifest.json` | PWA manifest — nombre, iconos, display standalone |
| `frontend/sw.js` | Service Worker — cache estáticos + Network First para API |
| `frontend/icons/` | Iconos PWA 192x192 y 512x512 |
| `frontend/index.html` | Vista principal — controles ordenamiento en línea ~66-81 |
| `frontend/js/app.js` | App principal — ListView con sortTools(), _sortState, listeners |
| `frontend/login.html` | Página login/registro |
| `frontend/js/auth.js` | Gestión token localStorage |
| `backend/tests/` | Tests Jest (auth + tools + categories + tags + upload) |
| `backend/uploads/.gitkeep` | Carpeta de uploads (imágenes ignoradas por .gitignore) |
| `backend/.env.example` | Plantilla variables de entorno |
| `backend/src/controllers/github.controller.js` | GitHubController — extrae owner/repo, llama GitHub API, formatea números |
| `frontend/js/components/tagManager.js` | Tag Manager UI — usa `_TM` (DOM local, sin dependencia de app.js) |
| `frontend/js/api/tagsApi.js` | Tags API client — usa `_TAGS_API_CONFIG` (sin dependencia de app.js) |

---

## ⚙️ Stack y entorno

- **Backend:** Node.js + Express + SQLite (better-sqlite3) — puerto 4001
- **Frontend:** HTML5 + CSS3 + Vanilla JS (ES6+) + Bootstrap 5
- **Auth:** JWT (jsonwebtoken + bcryptjs), token en localStorage
- **Upload:** multer — `backend/uploads/`, servido como estático en `/uploads`
- **PWA:** Service Worker + manifest.json — instalable desde Chrome/Edge/Firefox
- **Tests:** Jest 29 + supertest — **51 tests passing** (pendientes de validar en entorno nativo)
- **Repo:** https://github.com/8sandro8/DevToolsHub.git
- **Ramas:** `main` (producción) → `develop` → `feature/*`

---

## 🔴 Protocolo obligatorio (leer antes de trabajar)

1. **ARRANQUE EN FRÍO**: Solo leer este archivo al iniciar sesión. Nada de escanear directorios.
2. **DELEGACIÓN**: Jarvis planifica. El código lo ejecuta el agente apply.
3. **ACTUALIZAR ESTE ARCHIVO** al terminar cada sesión.
4. **GIT EN ESPAÑOL**: Commits, PRs, descripciones — todo en español.
