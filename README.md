# DevToolsHub

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-orange)](https://github.com/WiseLibs/better-sqlite3)
[![JWT](https://img.shields.io/badge/JWT-auth-yellow)](https://jwt.io/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple)](https://getbootstrap.com/)
[![Jest](https://img.shields.io/badge/Jest-testing-red)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](LICENSE)

DevToolsHub es una aplicación web para gestionar y organizar un catálogo de herramientas de desarrollo. Permite a los usuarios registrar herramientas, categorizarlas, añadirles tags, y visualizar información relevante como estadísticas de GitHub.

## Stack Tecnológico

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Node.js | 20.x | Entorno de ejecución JavaScript |
| Express | 4.x | Framework web para API REST |
| better-sqlite3 | 12.x | Driver SQLite para base de datos |
| JWT | 9.x | Autenticación basada en tokens |
| Multer | 2.x | Middleware para upload de archivos |
| express-validator | 7.x | Validación de datos |
| Bootstrap 5 | 5.x | Framework CSS para el frontend |
| Jest | 29.x | Framework de testing |

## Funcionalidades Principales

- **CRUD de Herramientas** — Crear, leer, actualizar y archivar herramientas de desarrollo
- **Gestión de Categorías** — Organización de herramientas por categorías con colores personalizados
- **Sistema de Tags** — Etiquetado flexible de herramientas con relaciones muchos a muchos
- **Autenticación JWT** — Registro y login con tokens JWT seguros
- **Upload de Imágenes** — Subida de logos e imágenes (límite 5MB)
- **PWA** — Aplicación web progresiva instalable (Service Worker + Manifest)
- **Integración GitHub** — Visualización de estrellas, forks y último commit de repositorios
- **Ordenamiento** — Ordenar por nombre, categoría o fecha (ascendente/descendente)
- **Validación Backend** — Validación de datos con express-validator
- **Tests Automatizados** — 51 tests con Jest + Supertest

## Requisitos Previos

- Node.js 18.x o superior
- npm 9.x o superior
- Git

## Instalación y Puesta en Marcha

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/8sandro8/DevToolsHub.git
   cd DevToolsHub
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Luego edita el archivo `.env` y establece `JWT_SECRET` con una clave segura.

4. **Iniciar el servidor**
   ```bash
   npm start
   ```
   El servidor arrancará en `http://localhost:4001`

5. **Acceder al frontend**
   - Abre `http://localhost:4001` en tu navegador
   - O usa la extensión "Live Server" de VS Code con el archivo `frontend/index.html`

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `4001` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `tu-clave-secreta-aqui` |
| `CORS_ORIGIN` | Origen permitido para CORS | `*` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `UPLOAD_DIR` | Directorio para archivos subidos | `uploads` |
| `MAX_FILE_SIZE` | Tamaño máximo de archivo (bytes) | `5242880` |

## Estructura del Proyecto

```
DevToolsHub/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración de base de datos
│   │   ├── controllers/    # Controladores (auth, tools, tags, github)
│   │   ├── middleware/     # Auth, upload, validación, errores
│   │   ├── repositories/   # Acceso a datos (SQL)
│   │   ├── routes/         # Definición de endpoints
│   │   ├── services/       # Lógica de negocio
│   │   ├── app.js          # Configuración Express
│   │   └── server.js       # Entry point
│   ├── tests/              # Tests Jest
│   ├── uploads/            # Archivos subidos
│   ├── .env.example        # Variables de ejemplo
│   └── package.json
├── frontend/
│   ├── index.html          # Vista principal
│   ├── login.html          # Login/Registro
│   ├── detalle.html        # Detalle de herramienta
│   ├── css/                # Estilos
│   ├── js/                 # JavaScript cliente
│   ├── icons/              # Iconos
│   ├── assets/             # Recursos estáticos
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker
├── database/
│   ├── schema.sql          # Schema de la base de datos
│   ├── seed.sql            # Datos iniciales
│   └── migrations/         # Migraciones
├── docs/                   # Documentación
└── README.md               # Este archivo
```

## API Endpoints

### Autenticación (Públicas)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión y obtener JWT |

### Herramientas (GET pública, Mutaciones protegidas)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/tools` | No | Listar todas las herramientas |
| GET | `/api/tools/:id` | No | Obtener herramienta por ID |
| POST | `/api/tools` | Sí | Crear nueva herramienta |
| PUT | `/api/tools/:id` | Sí | Actualizar herramienta |
| DELETE | `/api/tools/:id` | Sí | Archivar herramienta |
| PATCH | `/api/tools/:id/favorito` | Sí | Toggle favorito |
| GET | `/api/tools/:id/github-stats` | No | Obtener stats de GitHub |

### Categorías (GET pública, Mutaciones protegidas)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/categories` | No | Listar todas las categorías |
| POST | `/api/categories` | Sí | Crear nueva categoría |
| PUT | `/api/categories/:id` | Sí | Actualizar categoría |
| DELETE | `/api/categories/:id` | Sí | Eliminar categoría |

### Tags (GET pública, Mutaciones protegidas)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/tags` | No | Listar todos los tags |
| GET | `/api/tags/:id` | No | Obtener tag por ID |
| POST | `/api/tags` | Sí | Crear nuevo tag |
| PUT | `/api/tags/:id` | Sí | Actualizar tag |
| DELETE | `/api/tags/:id` | Sí | Eliminar tag |
| GET | `/api/tags/:id/tools` | No | Obtener herramientas con este tag |
| POST | `/api/tags/:id/tools` | Sí | Asignar herramientas al tag |
| PUT | `/api/tags/:id/tools` | Sí | Actualizar todas las herramientas del tag |
| DELETE | `/api/tags/:id/tools/:toolId` | Sí | Desasignar herramienta del tag |

### Endpoints Generales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Servir frontend |
| GET | `/login` | Página de login |
| GET | `/detalle` | Página de detalle |
| GET | `/health` | Health check |
| GET | `/api` | Info de la API |
| GET | `/uploads/*` | Archivos subidos |

## Tests

Ejecutar todos los tests:
```bash
cd backend
npm test
```

Ejecutar tests en modo watch:
```bash
npm run test:watch
```

Cobertura actual: **51 tests** con Jest + Supertest cubriendo controladores, middleware y validación.

## Capturas de Pantalla

<!-- TODO: añadir capturas -->

## Licencia

MIT License — Consulta el archivo [LICENSE](LICENSE) para más detalles.