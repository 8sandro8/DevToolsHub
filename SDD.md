# 🏗️ Documento de Diseño de Software (SDD)
# Proyecto: DevToolsHub
# ATENCIÓN JARVIS: Este documento es tu responsabilidad. Debes mantenerlo actualizado con las decisiones de arquitectura.

## 1. Stack Tecnológico Seleccionado

| Capa | Tecnología | Versión | Justificación |
|------|-------------|---------|---------------|
| **Frontend** | HTML5 + CSS3 + JavaScript Vanilla | ES6+ | Requisito AA2 - Sin frameworks, máximo control, mejor rendimiento |
| **Backend** | Node.js + Express.js | 20 LTS / 4.x | Runtime estable, API RESTful robusta, ecosystem maduro |
| **Base de Datos** | SQLite + better-sqlite3 | 3.x | Requisito AA2 - Ligero, sin instalación, ideal para MVP |
| **Validación** | express-validator | 7.x | Validación robusta siguiendo mejores prácticas |
| **Testing** | Jest | 29.x | Framework de testing establecido |
| **Infraestructura** | Servidor local / NAS Synology | - | Despliegue flexible |

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   HTML5     │  │   CSS3      │  │   JavaScript ES6+   │ │
│  │  Semántico │  │  Responsive │  │   Vanilla DOM/BOM    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                        SERVIDOR                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Express.js                           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │ │
│  │  │ Routes   │  │Controllers│  │    Middleware        │ │ │
│  │  │ /api/tools│  │  Tools   │  │ - Error Handler      │ │ │
│  │  │ /api/cats │  │Categories│  │ - CORS               │ │ │
│  │  │ /api/git  │  │GitHub    │  │ - Validation         │ │ │
│  │  └──────────┘  └──────────┘  └──────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              │                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Services Layer                        │ │
│  │  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐ │ │
│  │  │ ToolsService  │  │CategoriesService│  │GitHubService│ │ │
│  │  └──────────────┘  └───────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              │                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Data Access Layer                     │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │              better-sqlite3                     │    │ │
│  │  │   ToolsRepository   CategoriesRepository        │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      SQLite Database                         │
│  ┌─────────────┐  ┌─────────────────────────────────────┐  │
│  │    tools    │  │           categories                │  │
│  │   (TABLE)   │  │              (TABLE)                │  │
│  └─────────────┘  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 3. Modelos de Datos (Base de Datos)

### 3.1 Tabla: `tools`

```sql
CREATE TABLE tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    url TEXT,
    logo_url TEXT,
    rating INTEGER DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
    es_favorito INTEGER DEFAULT 0,
    es_archivado INTEGER DEFAULT 0,  -- Soft delete: 0=activo, 1=archivado
    fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tools_nombre ON tools(nombre);
CREATE INDEX idx_tools_favorito ON tools(es_favorito);
CREATE INDEX idx_tools_archivado ON tools(es_archivado);
```

### 3.2 Tabla: `categories`

```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6b7280',
    descripcion TEXT
);

CREATE INDEX idx_categories_nombre ON categories(nombre);
```

### 3.3 Tabla: `tool_categories` (Relación muchos a muchos)

```sql
CREATE TABLE tool_categories (
    tool_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (tool_id, category_id),
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_toolcat_tool ON tool_categories(tool_id);
CREATE INDEX idx_toolcat_cat ON tool_categories(category_id);
```

### 3.4 FTS5 para búsqueda full-text

```sql
-- Tabla virtual para búsqueda full-text en nombre y descripción
CREATE VIRTUAL TABLE tools_fts USING fts5(
    nombre,
    descripcion,
    content='tools',
    content_rowid='id'
);

-- Triggers para mantener FTS sincronizado
CREATE TRIGGER tools_ai AFTER INSERT ON tools BEGIN
    INSERT INTO tools_fts(rowid, nombre, descripcion) VALUES (new.id, new.nombre, new.descripcion);
END;

CREATE TRIGGER tools_ad AFTER DELETE ON tools BEGIN
    INSERT INTO tools_fts(tools_fts, rowid, nombre, descripcion) VALUES('delete', old.id, old.nombre, old.descripcion);
END;

CREATE TRIGGER tools_au AFTER UPDATE ON tools BEGIN
    INSERT INTO tools_fts(tools_fts, rowid, nombre, descripcion) VALUES('delete', old.id, old.nombre, old.descripcion);
    INSERT INTO tools_fts(rowid, nombre, descripcion) VALUES (new.id, new.nombre, new.descripcion);
END;
```

## 4. Endpoints del API Principal

### 4.1 Herramientas

| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/tools` | Listar herramientas (con filtros) | Query: `?buscar=&categoria=&favorito=&page=1&limit=10` | `{data: [], total, page, limit}` |
| GET | `/api/tools/:id` | Obtener herramienta por ID | - | `{tool: {...}}` |
| POST | `/api/tools` | Crear nueva herramienta | `{nombre, descripcion, url, logo_url, rating, es_favorito}` | `{tool: {...}}` |
| PUT | `/api/tools/:id` | Actualizar herramienta | `{nombre?, descripcion?, url?, logo_url?, rating?, es_favorito?}` | `{tool: {...}}` |
| DELETE | `/api/tools/:id` | Archivar herramienta (soft delete) | - | `{message: "Archivado"}` |
| PATCH | `/api/tools/:id/favorito` | Cambiar estado de favorito | `{es_favorito: boolean}` | `{tool: {...}}` |

### 4.2 Categorías

| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/categories` | Listar categorías | - | `{categories: []}` |
| GET | `/api/categories/:id` | Obtener categoría por ID | - | `{category: {...}}` |
| POST | `/api/categories` | Crear nueva categoría | `{nombre, color, descripcion}` | `{category: {...}}` |
| PUT | `/api/categories/:id` | Actualizar categoría | `{nombre?, color?, descripcion?}` | `{category: {...}}` |
| DELETE | `/api/categories/:id` | Eliminar categoría (si no tiene herramientas asociadas) | - | `{message: "Eliminado"}` |

### 4.3 GitHub Integration (Futuro - Fase 2+)

| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/github/search` | Buscar repositorios | Query: `?q=tool&page=1&limit=10` | `{repos: [], total}` |
| GET | `/api/github/repo/:owner/:repo` | Detalle de repo | - | `{repo: {...}}` |
| POST | `/api/github/favorito` | Guardar como favorito | `{tool_id?, github_repo_id, nombre, descripcion, estrellas, lenguaje_principal, url}` | `{favorito: {...}}` |
| GET | `/api/github/favoritos` | Listar favoritos | Query: `?tool_id=` | `{favoritos: []}` |

### 4.4 Health Check

| Método | Endpoint | Descripción | Response |
|--------|----------|-------------|----------|
| GET | `/api/health` | Estado del servidor | `{status: "ok", timestamp, db: "connected"}` |

## 5. Registro de Decisiones Técnicas

- [2026-03-22] - **Arquitectura MVC para DevToolsHub MVP**: Separación clara de responsabilidades
  - **Motivación:** Requisito académico de AA2 Entornos + mantener código mantenible
  - **Alternativas consideradas:** Estructura flat (rechazada por mantenibilidad), NestJS (overkill para MVP)
  - **Impacto:** Estructura escalable que permite crecimiento futuro
  - **Estado:** Completada

- [2026-03-22] - **SQLite con better-sqlite3 sobre ORM**
  - **Motivación:** Requisito AA2 explícito + rendimiento superior en operaciones simples
  - **Alternativas consideradas:** Prisma/TypeORM (complejidad innecesaria), MongoDB (sobreingeniería)
  - **Impacto:** queries SQL directas, mejor performance, cero dependencias adicionales
  - **Estado:** Completada

- [2026-03-22] - **JavaScript Vanilla para Frontend**
  - **Motivación:** Requisito AA2 Lenguajes de Marcas - sin frameworks
  - **Alternativas consideradas:** React (viola requisito), Vue (viola requisito)
  - **Impacto:** Código más verboso pero mayor control y mejor aprendizaje
  - **Estado:** Completada

- [2026-03-22] - **Eliminación lógica (soft-delete)**
  - **Motivación:** Preservar integridad de datos, requisito de negocio
  - **Alternativas consideradas:** Eliminación física (rechazada por seguridad de datos)
  - **Impacto:** Campos `es_archivado` en herramientas y categorías
  - **Estado:** Completada

- [2026-03-22] - **Service Layer entre Controllers y Repository**
  - **Motivación:** Centralizar lógica de negocio, facilitar testing
  - **Alternativas consideradas:** Lógica en controllers (acoplado), Repository directo (sin lógica)
  - **Impacto:** Mejor separación de concerns, controllers limpios
  - **Estado:** Completada

- [2026-03-22] - **Relación muchos a muchos entre herramientas y categorías**
  - **Motivación:** Una herramienta puede pertenecer a múltiples categorías (ej: VS Code es tanto Editor como CLI Tool)
  - **Alternativas consideradas:** Categoría única (limitante), etiquetas/tags (para futura fase)
  - **Impacto:** Mayor flexibilidad en organización y búsqueda
  - **Estado:** Completada

- [2026-03-22] - **FTS5 para búsqueda full-text optimizada**
  - **Motivación:** Búsqueda eficiente en nombre y descripción como requisito clave
  - **Alternativas consideradas:** LIKE %...% (lento en datasets grandes), búsqueda externa (complejidad innecesaria)
  - **Impacto:** Búsqueda rápida y relevante desde el MVP
  - **Estado:** Completada

- [2026-03-23] - **Bootstrap 5 como Framework de UI**
  - **Motivación:** Los profes指定aron Bootstrap como referencia visual para el frontend
  - **Alternativas consideradas:** Tailwind CSS (no cubierto en clase), CSS puro (más trabajo)
  - **Impacto:** UI responsiva con componentes preconstruidos, consistencia visual
  - **Estado:** Completada

- [2026-03-23] - **Mejora Página de Detalle**
  - **Motivación:** La página detalle necesitaba mejor layout y UX
  - **Cambios:** Layout más espacioso, truncamiento de descripción con "Leer más", badges de categorías con gradiente, botones de acción (favorito/editar/eliminar/visitar)
  - **Impacto:** Mejor experiencia de usuario en la vista de detalle
  - **Estado:** Completada

## 6. Estructura de Archivos del Proyecto

```
DevToolsHub/
├── frontend/
│   ├── index.html              # Punto de entrada
│   ├── detalle.html            # Página de detalle de herramienta
│   ├── css/
│   │   └── styles.css          # Estilos principales
│   ├── js/
│   │   └── app.js              # Lógica de aplicación
│   └── assets/
│       └── icons/              # SVG icons
├── backend/
│   ├── src/
│   │   ├── app.js              # Configuración Express
│   │   ├── server.js           # Entry point
│   │   ├── config/
│   │   │   └── database.js     # Config SQLite
│   │   ├── routes/
│   │   │   ├── index.js        # Router principal
│   │   │   ├── tool.routes.js
│   │   │   └── category.routes.js
│   │   ├── controllers/
│   │   │   ├── tool.controller.js
│   │   │   └── category.controller.js
│   │   ├── services/
│   │   │   ├── tool.service.js
│   │   │   └── category.service.js
│   │   ├── repositories/
│   │   │   ├── base.repository.js
│   │   │   ├── tool.repository.js
│   │   │   └── category.repository.js
│   │   └── middleware/
│   │       ├── errorHandler.js
│   │       └── validate.js
│   ├── tests/
│   │   ├── tools.test.js
│   │   └── categories.test.js
│   └── package.json
├── database/
│   ├── schema.sql              # Script de inicialización
│   └── seed.sql                # Datos iniciales
├── docs/
│   └── README.md               # Documentación
├── package.json                 # Workspace root
├── Dockerfile
├── docker-compose.yml
└── .dockerignore
```
DevToolsHub/
├── frontend/
│   ├── index.html              # Punto de entrada
│   ├── css/
│   │   └── styles.css          # Estilos principales
│   ├── js/
│   │   ├── app.js              # Inicialización y routing
│   │   ├── api/
│   │   │   └── client.js       # Cliente API fetch
│   │   ├── components/
│   │   │   ├── toolList.js     # Componente lista de herramientas
│   │   │   ├── toolForm.js     # Componente formulario de herramienta
│   │   │   ├── toolCard.js     # Componente tarjeta de herramienta
│   │   │   ├── searchBar.js    # Componente barra de búsqueda
│   │   │   ├── categoryFilter.js # Componente filtro de categoría
│   │   │   └── toast.js        # Componente notificaciones toast
│   │   └── utils/
│   │       ├── dom.js          # Helpers DOM
│   │       └── validators.js   # Validación frontend
│   └── assets/
│       └── icons/              # SVG icons
├── backend/
│   ├── src/
│   │   ├── app.js              # Configuración Express
│   │   ├── server.js           # Entry point
│   │   ├── config/
│   │   │   └── database.js     # Config SQLite
│   │   ├── routes/
│   │   │   ├── index.js        # Router principal
│   │   │   ├── tools.routes.js
│   │   │   └── categories.routes.js
│   │   │   └── github.routes.js  # Futuro
│   │   ├── controllers/
│   │   │   ├── tools.controller.js
│   │   │   └── categories.controller.js
│   │   │   └── github.controller.js  # Futuro
│   │   ├── services/
│   │   │   ├── tools.service.js
│   │   │   ├── categories.service.js
│   │   │   └── github.service.js   # Futuro
│   │   ├── repositories/
│   │   │   ├── base.repository.js
│   │   │   ├── tools.repository.js
│   │   │   └── categories.repository.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   ├── validate.js
│   │   │   └── cors.js
│   │   └── utils/
│   │       └── cache.js        # Caché simple para APIs externas
│   ├── tests/
│   │   ├── tools.test.js
│   │   └── categories.test.js
│   └── package.json
├── database/
│   ├── schema.sql              # Script de inicialización
│   └── seed.sql                # Datos iniciales
├── docs/
│   └── README.md               # Documentación
├── package.json                 # Workspace root
├── Dockerfile
├── docker-compose.yml
└── .dockerignore
```

## 7. PROCESO DE ACTUALIZACIÓN DE ESTE DOCUMENTO

Este documento debe mantenerse como reflejo fiel de la arquitectura actual del proyecto. Actualízalo en estos casos:

- **Después de cada decisión arquitectónica significativa** (elección de librería, patrón de diseño, cambio en estructura de datos, etc.)
- **Antes de iniciar una nueva fase de desarrollo**, revisa y confirma que este documento refleja con precisión la arquitectura actual
- **Cuando identifiques deuda técnica** que requiera refactorización, documenta aquí tanto el problema como la solución propuesta

**Formato recomendado para nuevas entradas:**
- [FECHA] - [Decisión tomada]: [Breve descripción] 
  - **Motivación:** [¿Por qué se tomó esta decisión?]
  - **Alternativas consideradas:** [Qué otras opciones se evaluaron y por qué se rechazaron]
  - **Impacto:** [Cómo afecta esto al frontend, backend, base de datos, etc.]
  - **Estado:** [Pendiente de implementación / En curso / Completada]

**Regla de oro:** Si no queda claro en este documento cómo se implementa alguna parte del sistema, entonces el documento necesita ser actualizado.