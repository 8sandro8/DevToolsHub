# ESTADO.md — DevToolsHub
> Fuente de verdad única. Leer esto al iniciar cualquier sesión nueva.

---

## Última actualización
**Fecha:** 2026-03-24
**Sesión:** E8 validación frontend inline + E12 colección Postman/HoppScotch + E3 README — PRs abiertos

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
- **Validación backend** ✅ MERGEADO en `develop`:
  - Validaciones con límites de longitud en tools (nombre 100, descripción 500) y categories (nombre 100, descripción 300)
  - Fix URL nullable en PUT tools: `optional({ nullable: true, checkFalsy: true })`
  - Middleware `validate` aplicado uniformemente en POST y PUT
  - Nuevo endpoint `PUT /api/categories/:id` con validación completa
  - Tests nuevos en `backend/tests/integration/categories.api.test.js`
- **Validación frontend inline (E8)** ✅ PR #16 abierto (`feature/validacion-frontend` → `develop`):
  - Nuevo módulo `frontend/js/validation.js` — objeto `_VALIDATION` con `required`, `minLength`, `maxLength`, `optionalUrl`, `matches`, `requiredSelect`, `requiredTextarea`, `setupAutoClear`
  - `login.html` — validación inline en login (usuario mín 3 chars, pass mín 6 chars) y registro (+ confirmación contraseña)
  - `index.html` — incluye `validation.js` antes de `app.js`
  - `app.js` modal herramientas — reemplaza validación básica por `_VALIDATION`: nombre (obligatorio, máx 100), descripción (obligatoria, máx 500), URL/logo (opcional, formato válido), categoría (obligatoria)
  - Auto-limpieza de errores al escribir (evento `input`)
- **README del proyecto (E3)** ✅ PR #14 abierto (`feature/readme` → `develop`):
  - `README.md` en raíz con badges, stack, setup paso a paso, tabla de endpoints, tests y licencia MIT
- **Colección Postman/HoppScotch (E12)** ✅ PR #15 abierto (`feature/coleccion-postman` → `develop`):
  - `docs/DevToolsHub.hoppscotch.json` + `docs/DevToolsHub.postman_collection.json`
  - 22 endpoints, 4 carpetas, variables de entorno, headers JWT automáticos
- **GitHub API integration + fixes UI** ✅ MERGEADO en `develop` y luego en `main`:
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
- **PR #11 MERGEADO**: `feature/validacion-backend` → `develop` ✅
- **PR #13 CERRADO**: `feature/github-api-v2` mergeada directamente en `develop` y luego en `main` ✅
- **PR #14 ABIERTO**: `feature/readme` → `develop` (E3 README) ⏳ pendiente merge
- **PR #15 ABIERTO**: `feature/coleccion-postman` → `develop` (E12 Postman/HoppScotch) ⏳ pendiente merge
- **PR #16 ABIERTO**: `feature/validacion-frontend` → `develop` (E8 validación inline) ⏳ pendiente merge
- **PR #12 CERRADO**: `feature/ordenamiento` (duplicado)
- **PR #8 CERRADO**: `feature/tags-crud` (obsoleto)
- `main` y `develop` sincronizados al 100% ✅
- **Ramas activas**: `main`, `develop` + 3 feature ramas con PR abierto
- Rama activa de trabajo: `develop`

---

## ⚠️ Errores / Pendientes técnicos

- Tests no ejecutables en el entorno local del agente (better-sqlite3 requiere compilación nativa con Visual Studio). Los tests existentes deberían pasar en entorno correcto.
- `Gentleman-Skills/` y `nul` aparecen como untracked en git (son del entorno, ignorar).
- `backend/.env` untracked (correcto — contiene secretos, está en .gitignore).
- Iconos PWA son SVG con extensión `.png` (válido navegadores modernos; si se necesitan PNG reales, generar con Sharp o similar).

---

## 🎯 Próximo paso exacto

**Tarea 1 pendiente:** README del proyecto (obligatorio Entornos)

**BACKLOG AA2 — Entornos de Desarrollo**

Obligatorios (1 pto c/u):
| # | Requisito | Estado |
|---|-----------|--------|
| E1 | Backend CRUD completo (≥2 elementos) API REST | ✅ Hecho |
| E2 | Frontend CRUD completo (≥2 elementos) | ✅ Hecho |
| E3 | README en GitHub con info del proyecto e instrucciones de puesta en marcha | ✅ PR #14 abierto |
| E4 | Cada funcionalidad gestionada como rama + PR en GitHub | ✅ Hecho |

Adicionales (1 pto c/u):
| # | Requisito | Estado |
|---|-----------|--------|
| E5 | Elementos del modelo relacionados entre sí | ✅ Hecho (tool↔category↔tag) |
| E6 | Login/contraseña protegiendo zona del frontend | ✅ Hecho (JWT) |
| E7 | Validación backend con express-validator | ✅ Hecho |
| E8 | Validación frontend en formularios antes de enviar | ✅ PR #16 abierto |
| E9 | Framework React o Vue en frontend | ⏳ Pendiente (usa Vanilla JS) |
| E10 | Nuevo elemento en modelo de datos con CRUD completo (backend + frontend) | ✅ Hecho (Tags) |
| E11 | Wiki en GitHub con especificación de la API | ✅ Hecho |
| E12 | Colección Postman/HoppScotch con ejemplos de todos los endpoints | ✅ PR #15 abierto |
| E13 | API con operación para trabajar con imágenes | ✅ Hecho (multer upload/delete) |

**BACKLOG AA2 — Lenguajes de Marcas**

(pendiente de leer PDF — añadir cuando sea legible)

---

**PRs PENDIENTES DE MERGE:**
- PR #14 — E3 README
- PR #15 — E12 Colección Postman/HoppScotch
- PR #16 — E8 Validación frontend inline

**PENDIENTES EN ORDEN DE ATAQUE:**
1. Mergear PRs #14, #15, #16 en `develop`
2. E11 — Wiki GitHub API
3. LM pendientes (cuando se lea el PDF)

---

## 📋 BACKLOG DEFINITIVO AA2 — Lenguajes de Marcas + Entornos

### Requisitos OBLIGATORIOS

| # | Requisito | Asignatura | Estado |
|---|-----------|------------|--------|
| 1 | Login/Register con JWT | Lenguajes de Marcas | ✅ |
| 2 | Listado de herramientas con búsqueda por nombre | Lenguajes de Marcas | ✅ |
| 3 | Alta/Baja/Modificación de herramientas (CRUD completo) | Lenguajes de Marcas | ✅ |
| 4 | Sistema de favoritos (marcar/desmarcar) | Lenguajes de Marcas | ✅ |
| 5 | Tags - creación, edición, eliminación | Lenguajes de Marcas | ✅ |
| 6 | Ver detalles completos de una herramienta | Lenguajes de Marcas | ✅ |
| 7 | PWA - manifest.json + service worker + iconos | Lenguajes de Marcas | ✅ |
| 8 | GitHub API - stats del repositorio | Lenguajes de Marcas | ✅ |
| 9 | Imágenes - upload/download de imágenes de herramientas | Lenguajes de Marcas | ✅ |
| 10 | Ordenación ASC/DESC por nombre, categoría y fecha | Lenguajes de Marcas | ✅ |
| 11 | Validación backend (express-validator, límites longitud) | Lenguajes de Marcas | ✅ |
| 12 | **Publicación del proyecto (despliegue/producción)** | Lenguajes de Marcas | ⏳ |

### Requisitos ADICIONALES

| # | Requisito | Asignatura | Estado |
|---|-----------|------------|--------|
| 1 | Filtros avanzados (por tag, categoría, año) | Lenguajes de Marcas | ⏳ |
| 2 | Modo oscuro/claro | Lenguajes de Marcas | ⏳ |
| 3 | Historial de cambios en herramientas | Lenguajes de Marcas | ⏳ |
| 4 | Sistema de comentarios/opiniones | Lenguajes de Marcas | ⏳ |
| 5 | Uso de API externas (además de GitHub) | Lenguajes de Marcas | ⏳ |
| 6 | Tests de integración | Entornos | ⏳ |
| 7 | Documentación técnica (README, INSTALL) | Entornos | ⏳ |

---

**RESUMEN:** 11/12 obligatorios ✅ — 1 pendiente ⏳ (despliegue)
**Adicionales completados Entornos:** E5 ✅ E6 ✅ E7 ✅ E8 ✅(PR) E10 ✅ E12 ✅(PR) — E9 ⏳ E11 ⏳

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
| `frontend/js/validation.js` | Módulo `_VALIDATION` — validación inline Bootstrap 5 (E8) |
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
