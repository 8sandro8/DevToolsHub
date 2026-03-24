# ESTADO.md — DevToolsHub
> Fuente de verdad única. Leer esto al iniciar cualquier sesión nueva.

---

## Última actualización
**Fecha:** 2026-03-24
**Sesión:** Upload de imágenes con multer — PR #4 abierto en `feature/upload-imagenes`

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
- **Upload de imágenes** ⏳ PR #4 abierto (`feature/upload-imagenes` → `develop`):
  - Columna `image_url TEXT DEFAULT NULL` en tabla `tool`
  - Script de migración: `database/migrations/add_image_url.sql`
  - Middleware `multer` — almacenamiento en `backend/uploads/`, filtros imagen, límite 5MB
  - `POST /api/tools/:id/image` — sube imagen (protegido con JWT)
  - `DELETE /api/tools/:id/image` — elimina imagen (protegido con JWT)
  - Frontend: preview en modal, imagen en cards y detalle
  - 7 tests nuevos en `backend/tests/integration/upload.api.test.js`

### Git / GitHub
- **PR #3 mergeado**: `feature/login-basico` → `develop` ✅
- **PR #4 abierto**: `feature/upload-imagenes` → `develop` ⏳ (pendiente merge)
- Rama activa: `feature/upload-imagenes`
- `main` pendiente de sincronizar cuando convenga

---

## ⚠️ Errores / Pendientes técnicos

- Tests no ejecutables en el entorno local del agente (better-sqlite3 requiere compilación nativa con Visual Studio). Los 51 tests existentes + 7 nuevos deberían pasar en entorno correcto.
- `Gentleman-Skills/` y `nul` aparecen como untracked en git (son del entorno, ignorar).
- `backend/.env` untracked (correcto — contiene secretos, está en .gitignore).

---

## 🎯 Próximo paso exacto

**ACCIÓN INMEDIATA:** Mergear PR #4 (`feature/upload-imagenes`) cuando el usuario lo apruebe.

**SIGUIENTE FEATURE:** `feature/pwa`
- Service Worker + manifest.json
- Instalable como PWA

**BACKLOG (en orden):**
| # | Feature | Estado |
|---|---------|--------|
| 1 | ~~Login básico~~ | ✅ Mergeado |
| 2 | Upload de imágenes | ⏳ PR #4 abierto |
| 3 | PWA (Service Worker + manifest) | ⏳ Pendiente |
| 4 | Ordenamiento asc/desc | ⏳ Pendiente |
| 5 | Digitalización (comparativa IDEs) | ⏳ Entrega: 27 mayo 2026 |

---

## 📁 Archivos clave del proyecto

| Archivo | Rol |
|---------|-----|
| `backend/src/app.js` | Entry point Express + rutas + middleware auth + static /uploads |
| `backend/src/middleware/auth.middleware.js` | JWT Bearer verification |
| `backend/src/middleware/upload.middleware.js` | Multer config — diskStorage, filtros, 5MB |
| `backend/src/controllers/upload.controller.js` | Upload/delete de imagen por tool ID |
| `backend/src/services/auth.service.js` | Lógica register/login/verify |
| `database/schema.sql` | Schema SQLite (tool, category, tag, user) + image_url |
| `database/migrations/add_image_url.sql` | Migración para BDs existentes |
| `frontend/login.html` | Página login/registro |
| `frontend/js/auth.js` | Gestión token localStorage |
| `frontend/js/app.js` | App principal frontend (incluye uploadImage/deleteImage) |
| `backend/tests/` | Tests Jest (auth + tools + categories + tags + upload) |
| `backend/uploads/.gitkeep` | Carpeta de uploads (imágenes ignoradas por .gitignore) |
| `backend/.env.example` | Plantilla variables de entorno |

---

## ⚙️ Stack y entorno

- **Backend:** Node.js + Express + SQLite (better-sqlite3) — puerto 4001
- **Frontend:** HTML5 + CSS3 + Vanilla JS (ES6+) + Bootstrap 5
- **Auth:** JWT (jsonwebtoken + bcryptjs), token en localStorage
- **Upload:** multer — `backend/uploads/`, servido como estático en `/uploads`
- **Tests:** Jest 29 + supertest — **51 tests passing** (+ 7 nuevos upload, pendientes de validar)
- **Repo:** https://github.com/8sandro8/DevToolsHub.git
- **Ramas:** `main` (producción) → `develop` → `feature/*`

---

## 🔴 Protocolo obligatorio (leer antes de trabajar)

1. **ARRANQUE EN FRÍO**: Solo leer este archivo al iniciar sesión. Nada de escanear directorios.
2. **DELEGACIÓN**: Jarvis planifica. El código lo ejecuta el agente apply.
3. **ACTUALIZAR ESTE ARCHIVO** al terminar cada sesión.
4. **GIT EN ESPAÑOL**: Commits, PRs, descripciones — todo en español.
