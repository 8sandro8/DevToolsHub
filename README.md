# 🚀 DevToolsHub

Un catálogo web de herramientas para desarrolladores donde puedes descubrir, buscar y guardar tus herramientas favoritas. Lo he creado para la evaluación de Lenguajes de Marcas y Entornos de Desarrollo de 1º de DAM.

## ¿Qué es?

DevToolsHub es una aplicación web completa que te permite:

- **Explorar** un catálogo de herramientas developer (IDEs, APIs, databases, etc.)
- **Buscar** por nombre o filtrar por categorías
- **Ver detalles** de cada herramienta con información enriquecida
- **Crear, editar y eliminar** herramientas (CRUD completo)
- **Guardar favoritos** para acceder rápido a las que más usas
- **Iniciar sesión** con usuario y contraseña
- **Modo oscuro** porque... ¡es más molón!

## 🛠️ Tecnologías que he usado

| Categoría | Tecnología |
|-----------|------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla + Vue 3 por CDN) |
| Backend | Node.js + Express |
| Base de datos | SQLite |
| Autenticación | JWT (JSON Web Tokens) |
| Contenedores | Docker + Docker Compose |
| APIs externas | Wikipedia REST API |

## ✨ Funcionalidades

- **Catálogo dinámico** - Las herramientas se cargan desde la API
- **Búsqueda en tiempo real** - Encuentra herramientas al instante
- **Filtros por categoría** - API Testing, Code Editors, Version Control, etc.
- **Vista detalle** - Información completa de cada herramienta
- **Sistema de favoritos** - Guarda tus herramientas preferidas
- **CRUD completo** - Crea, lee, actualiza y borra herramientas
- **Autenticación** - Registro y login con JWT
- **Modo oscuro** - Toggle para cambiar el tema
- **Enriquecimiento con Wikipedia** - Información adicional de cada herramienta

## 🚀 Cómo levantarlo

### Opción 1: Con Docker (la más fácil)

```bash
# Clona el proyecto y entra en la carpeta
cd DevToolsHub

# Levanta el proyecto
docker compose up --build

# Abre en tu navegador
http://localhost:4002
```

### Opción 2: Sin Docker

```bash
# Entra en el backend
cd backend

# Instala dependencias
npm install

# Arranca el servidor
npm run dev

# Abre en tu navegador
http://localhost:4001
```

## 📂 Estructura del proyecto

```
DevToolsHub/
├── backend/              # Servidor Node.js + Express
│   ├── src/
│   │   ├── controllers/ # Endpoints de la API
│   │   ├── services/    # Lógica de negocio
│   │   ├── repositories/# Acceso a SQLite
│   │   └── middleware/  # Autenticación JWT
│   └── database/        # Esquema y datos iniciales
├── frontend/            # Interfaz web
│   ├── js/             # JavaScript y Vue
│   └── css/            # Estilos
├── data/               # Base de datos SQLite
└── docker-compose.yml  # Configuración Docker
```

## 🔐 Credenciales de prueba

Si quieres probar el panel de admin:

- **Usuario:** `Sandro`
- **Contraseña:** `Sandro`

## 📝 Lo que he aprendido

Este proyecto me ha servido para practicar:
- Consumo de APIs REST
- Manipulación del DOM y Vue.js
- SQLite y consultas SQL
- Autenticación con JWT
- Docker y contenedores
- Git flow con ramas y Pull Requests

## 📚 Documentación Técnica

Para desarrolladores que quieran entender o extender el proyecto:

- **📖 Wiki de la API:** [wiki/](wiki/) - Documentación completa de endpoints
- **🔄 Colección Postman:** [docs/DevToolsHub.postman_collection.json](docs/DevToolsHub.postman_collection.json)
- **🔌 Colección Hoppscotch:** [docs/DevToolsHub.hoppscotch.json](docs/DevToolsHub.hoppscotch.json)

## 🛡️ Validación y Seguridad

El proyecto implementa **validación en dos capas**:

1. **Frontend:** Validación visual con Bootstrap 5 + JavaScript
2. **Backend:** Validación estricta con `express-validator` + sanitización

Ejemplo de validación backend:
```javascript
body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
body('url').optional().isURL().withMessage('URL inválida')
```

## 👥 Colaboración y Git Flow

Seguimos **GitFlow** para desarrollo colaborativo:

1. `main` → Rama estable (solo recibe PRs aprobadas)
2. `feature/*` → Nuevas funcionalidades
3. `fix/*` → Corrección de bugs

**Reglas:**
- Todos los cambios pasan por Pull Request
- Commits descriptivos en español
- Code review antes de merge

---

Hecho con 💻 por un estudiante de 1º de DAM. ¡Espero que te sirva!
