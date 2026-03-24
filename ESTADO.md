# ESTADO.md — DevToolsHub
> Fuente de verdad única. Leer esto al iniciar cualquier sesión nueva.

---

## Última actualización
**Fecha:** 2026-03-24
**Sesión:** Ordenamiento asc/desc — PR #7 mergeado ✅

---

## ✅ Completado hasta hoy

### Funcionalidades implementadas
- **MVP Base**: CRUD de herramientas y categorías, Bootstrap 5 UI, favoritos, modal agregar/editar, página detalle (`detalle.html`)
- **Tags CRUD**: Sistema completo de tags (backend + frontend + relación tool_tag)
- **Login básico JWT** ✅ MERGEADO en `develop`
- **Upload de imágenes** ✅ MERGEADO en `develop` (PR #4)
- **PWA** ✅ MERGEADO en `develop` (PR #6)
- **Ordenamiento asc/desc** ✅ MERGEADO en `develop` (PR #7):
  - Selector: Nombre / Categoría / Fecha
  - Toggle asc/desc con icono SVG inline
  - Ordenamiento en memoria en `ListView._state.tools`
  - Reset al limpiar filtros

### Git / GitHub
- **PR #3 mergeado**: `feature/login-basico` ✅
- **PR #4 mergeado**: `feature/upload-imagenes` ✅
- **PR #6 mergeado**: `feature/pwa` ✅
- **PR #7 mergeado**: `feature/ordenamiento` ✅
- `main` pendiente de sincronizar cuando convenga

---

## ⚠️ Pendientes técnicos

- Tests no ejecutables en el entorno local del agente (better-sqlite3 requiere compilación nativa). Deberían pasar en entorno correcto.
- `Gentleman-Skills/` y `nul` — untracked, del entorno, ignorar.
- `backend/.env` — untracked, contiene secretos, correcto.
- Iconos PWA son SVG con extensión `.png` (válido navegadores modernos).

---

## 🎯 Próximo paso exacto

**BACKLOG (en orden):**
| # | Feature | Estado |
|---|---------|--------|
| 1 | ~~Login básico~~ | ✅ Mergeado |
| 2 | ~~Upload de imágenes~~ | ✅ Mergeado |
| 3 | ~~PWA~~ | ✅ Mergeado |
| 4 | ~~Ordenamiento asc/desc~~ | ✅ Mergeado |
| 5 | Digitalización (comparativa IDEs) | 🙋 Lo hace el usuario a mano |

**Estado actual: BACKLOG DE FEATURES COMPLETADO** 🎉

---

## 📁 Archivos clave del proyecto

| Archivo | Rol |
|---------|-----|
| `backend/src/app.js` | Entry point Express + rutas + middleware auth |
| `backend/src/middleware/auth.middleware.js` | JWT Bearer verification |
| `backend/src/middleware/upload.middleware.js` | Multer config |
| `backend/src/controllers/upload.controller.js` | Upload/delete imagen |
| `backend/src/services/auth.service.js` | Lógica register/login/verify |
| `database/schema.sql` | Schema SQLite completo |
| `database/migrations/add_image_url.sql` | Migración image_url |
| `frontend/manifest.json` | PWA manifest |
| `frontend/sw.js` | Service Worker |
| `frontend/icons/` | Iconos PWA |
| `frontend/index.html` | Vista principal con ordenamiento |
| `frontend/js/app.js` | App principal (ListView, sortTools, auth, upload) |
| `frontend/login.html` | Página login/registro |
| `frontend/js/auth.js` | Gestión token localStorage |
| `backend/tests/` | Tests Jest completos |
| `backend/.env.example` | Plantilla variables de entorno |

---

## ⚙️ Stack y entorno

- **Backend:** Node.js + Express + SQLite (better-sqlite3) — puerto 4001
- **Frontend:** HTML5 + CSS3 + Vanilla JS (ES6+) + Bootstrap 5
- **Auth:** JWT (jsonwebtoken + bcryptjs), token en localStorage
- **Upload:** multer — `backend/uploads/`
- **PWA:** Service Worker + manifest.json
- **Tests:** Jest 29 + supertest — 51+ tests
- **Repo:** https://github.com/8sandro8/DevToolsHub.git
- **Ramas:** `main` → `develop` → `feature/*`

---

## 🔴 Protocolo obligatorio

1. **ARRANQUE EN FRÍO**: Solo leer este archivo. Nada de escanear directorios.
2. **DELEGACIÓN**: Jarvis planifica. El código lo ejecuta el agente apply.
3. **ACTUALIZAR ESTE ARCHIVO** al terminar cada sesión.
4. **GIT EN ESPAÑOL**: Commits, PRs, descripciones — todo en español.
