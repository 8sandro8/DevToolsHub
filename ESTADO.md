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

## 🎯 Backlog actualizado — Lista para el 10

> Cruzado con los requisitos de la AA2 (Lenguajes de Marcas + Entornos de Desarrollo).
> Fecha revisión: 2026-03-24

---

### ✅ Ya cubierto (no tocar)

| Requisito | Asignatura | Pts | Estado |
|-----------|-----------|-----|--------|
| Backend CRUD completo ≥2 entidades (tools + categorías) | Entornos | 1 | ✅ |
| Frontend CRUD completo ≥2 entidades | Entornos | 1 | ✅ |
| README con instrucciones + repo GitHub | Entornos | 1 | ✅ |
| Ramas de trabajo + Pull Requests | Entornos | 1 | ✅ |
| Relaciones entre entidades (tool_tag, categorías) | Entornos (bonus) | 1 | ✅ |
| Login usuario/contraseña (JWT) | Entornos (bonus) | 1 | ✅ |
| Wiki GitHub con spec de la API | Entornos (bonus) | 1 | ✅ |
| Colección Postman/HoppScotch | Entornos (bonus) | 1 | ✅ |
| API con operaciones de imágenes (upload) | Entornos (bonus) | 1 | ✅ |
| Lista de herramientas con nombre + 3 características | Lenguajes (home) | 2 | ✅ |
| Buscador en home | Lenguajes (home) | 1 | ✅ |
| Click elemento → página detalle | Lenguajes (home) | 1 | ✅ |
| CRUD completo desde el frontend | Lenguajes (home) | 1 | ✅ |
| Página detalle: imagen + datos ampliados de nuestra API | Lenguajes (detalle) | 2 | ✅ (parcial) |

---

### 🔴 PENDIENTE — Tareas para el 10 (ordenadas por prioridad/impacto)

| # | Tarea | Asignatura | Pts | Prioridad |
|---|-------|-----------|-----|-----------|
| 1 | **Integración API externa** en página detalle: conectar a GitHub/NPM API para enriquecer la ficha de cada herramienta con datos en tiempo real (ej: repo stats, versión npm, etc.) — necesario para los 2 ptos de "múltiples endpoints" | Lenguajes (detalle) | 2 | 🔴 Alta |
| 2 | **Validación backend con `express-validator`**: añadir middleware de validación en las rutas POST/PUT de tools y categorías; respuesta 422 con errores detallados | Entornos (bonus) | 1 | 🔴 Alta |
| 3 | **Validación frontend en formularios**: mostrar mensajes de error inline antes de enviar al backend (campo vacío, URL inválida, longitud, etc.) | Entornos (bonus) | 1 | 🔴 Alta |
| 4 | **CRUD completo de Tags en frontend**: actualmente falta el botón Editar tag (PUT). Completar el ciclo Create/Read/Update/Delete visible en UI | Entornos (bonus) | 1 | 🟡 Media |
| 5 | **Diseño y limpieza de código**: revisar coherencia visual (colores, tipografía, espaciado), limpiar comentarios muertos y `console.log` en producción, asegurar responsive en móvil | Lenguajes (detalle) | 2 | 🟡 Media |
| 6 | **Explorar más endpoints de la API externa** y mostrarlos en secciones distintas del detalle (ej: sección "Stats del repo", sección "Últimas releases", etc.) | Lenguajes (detalle) | 2 | 🟡 Media (incluido en tarea #1) |

---

### 📊 Puntuación estimada actual vs objetivo

| Asignatura | Ptos actuales | Ptos objetivo | Falta |
|-----------|--------------|--------------|-------|
| Lenguajes de Marcas | ~7/11 | 11/11 | Tareas 1, 5, 6 |
| Entornos de Desarrollo | ~8/10 (aprox.) | 10/10 | Tareas 2, 3, 4 |

> ⚠️ Nota: Lenguajes de Marcas requiere API **externa**. Nuestra app usa API propia — eso ya cubre el CRUD (1 pto), pero los 2 ptos de "múltiples endpoints" exigen llamadas a servicios externos como GitHub API o NPM Registry.

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
