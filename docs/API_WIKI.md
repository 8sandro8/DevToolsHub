# API Documentation - DevToolsHub

## Overview
REST API para la gestión de herramientas de desarrollo (DevToolsHub). Permite crear, leer, actualizar y eliminar herramientas, categorías y etiquetas, con autenticación JWT y validación dual (frontend + backend).

**URL Base:** `http://localhost:3000/api` (o URL de producción)

## Autenticación
La API utiliza autenticación JWT (JSON Web Token). Para acceder a endpoints protegidos, incluye el token en el header `Authorization`:

```
Authorization: Bearer <tu-token-jwt>
```

### Endpoints de Autenticación

#### Registrar nuevo usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseñaSegura123"
}
```

**Respuesta exitosa:**
```json
{
  "user": {
    "id": 1,
    "username": "usuario"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Iniciar sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseñaSegura123"
}
```

**Respuesta exitosa:**
```json
{
  "user": {
    "id": 1,
    "username": "usuario"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Herramientas (Tools)

### Listar todas las herramientas
```http
GET /api/tools
```

**Parámetros de consulta opcionales:**
- `search`: Filtrar por nombre o descripción
- `category`: Filtrar por ID de categoría
- `tag`: Filtrar por ID de etiqueta
- `favorites`: `true` para mostrar solo favoritos
- `page`: Número de página (paginación)
- `limit`: Elementos por página (default: 10)

**Ejemplo:**
```http
GET /api/tools?search=react&category=2&favorites=true&page=1&limit=5
```

**Respuesta:**
```json
{
  "tools": [
    {
      "id": 1,
      "nombre": "React",
      "descripcion": "Biblioteca JavaScript para interfaces de usuario",
      "url": "https://reactjs.org",
      "rating": 5,
      "es_favorito": true,
      "created_at": "2024-01-15T10:30:00.000Z",
      "categories": [
        {
          "id": 2,
          "nombre": "Frontend",
          "color": "#38bdf8"
        }
      ],
      "tags": [
        {
          "id": 1,
          "nombre": "JavaScript",
          "color": "#fbbf24"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "pages": 5
  }
}
```

### Obtener herramienta por ID
```http
GET /api/tools/:id
```

**Parámetros:**
- `id` (path): ID de la herramienta

**Ejemplo:**
```http
GET /api/tools/1
```

**Respuesta:**
```json
{
  "tool": {
    "id": 1,
    "nombre": "React",
    "descripcion": "Biblioteca JavaScript para interfaces de usuario",
    "url": "https://reactjs.org",
    "rating": 5,
    "es_favorito": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "categories": [...],
    "tags": [...]
  }
}
```

### Obtener estadísticas de GitHub
```http
GET /api/tools/:id/github-stats
```

**Descripción:** Obtiene estadísticas del repositorio de GitHub asociado a la herramienta.

**Ejemplo:**
```http
GET /api/tools/1/github-stats
```

**Respuesta:**
```json
{
  "stats": {
    "stars": 215000,
    "forks": 45000,
    "open_issues": 500,
    "last_updated": "2024-03-15T08:30:00.000Z"
  }
}
```

### Crear nueva herramienta
```http
POST /api/tools
Content-Type: application/json
Authorization: Bearer <token-jwt>

{
  "nombre": "Nueva Herramienta",
  "descripcion": "Descripción opcional",
  "url": "https://ejemplo.com",
  "rating": 4,
  "es_favorito": false,
  "categories": [1, 2],
  "tags": [3, 4]
}
```

**Campos:**
- `nombre` (required): Nombre de la herramienta
- `descripcion` (optional): Descripción
- `url` (optional): URL válida
- `rating` (optional): Entero 0-5
- `es_favorito` (optional): Boolean
- `categories` (optional): Array de IDs de categorías
- `tags` (optional): Array de IDs de etiquetas

**Validaciones:**
- `nombre`: Requerido, no vacío
- `url`: Formato URL válido (si se proporciona)
- `rating`: Entero entre 0 y 5 (si se proporciona)

### Actualizar herramienta
```http
PUT /api/tools/:id
Content-Type: application/json
Authorization: Bearer <token-jwt>

{
  "nombre": "Nombre actualizado",
  "rating": 5,
  "es_favorito": true
}
```

**Parámetros:**
- `id` (path): ID de la herramienta a actualizar

### Eliminar herramienta
```http
DELETE /api/tools/:id
Authorization: Bearer <token-jwt>
```

## Categorías

### Listar todas las categorías
```http
GET /api/categories
```

**Respuesta:**
```json
{
  "categories": [
    {
      "id": 1,
      "nombre": "Frontend",
      "color": "#38bdf8"
    },
    {
      "id": 2,
      "nombre": "Backend",
      "color": "#10b981"
    }
  ]
}
```

### Crear nueva categoría
```http
POST /api/categories
Content-Type: application/json
Authorization: Bearer <token-jwt>

{
  "nombre": "DevOps",
  "color": "#8b5cf6"
}
```

**Campos:**
- `nombre` (required): Nombre de la categoría
- `color` (optional): Color en formato hexadecimal (default: #6b7280)

### Eliminar categoría
```http
DELETE /api/categories/:id
Authorization: Bearer <token-jwt>
```

**Nota:** Solo se puede eliminar categorías que no estén asignadas a herramientas.

## Etiquetas (Tags)

### Listar todas las etiquetas
```http
GET /api/tags
```

**Respuesta:**
```json
{
  "tags": [
    {
      "id": 1,
      "nombre": "JavaScript",
      "color": "#fbbf24"
    },
    {
      "id": 2,
      "nombre": "TypeScript",
      "color": "#3178c6"
    }
  ]
}
```

### Obtener etiqueta por ID
```http
GET /api/tags/:id
```

### Crear nueva etiqueta
```http
POST /api/tags
Content-Type: application/json
Authorization: Bearer <token-jwt>

{
  "nombre": "Nueva Etiqueta",
  "color": "#ef4444"
}
```

### Actualizar etiqueta
```http
PUT /api/tags/:id
Content-Type: application/json
Authorization: Bearer <token-jwt>

{
  "nombre": "Nombre actualizado",
  "color": "#22c55e"
}
```

### Eliminar etiqueta
```http
DELETE /api/tags/:id
Authorization: Bearer <token-jwt>
```

### Obtener herramientas con una etiqueta
```http
GET /api/tags/:id/tools
```

### Asignar herramientas a etiqueta
```http
POST /api/tags/:id/tools
Content-Type: application/json
Authorization: Bearer <token-jwt>

{
  "toolId": 1
}
```

## Validación de Entrada

La API implementa validación dual:

### 1. Validación Backend (express-validator)
Todas las rutas POST y PUT incluyen validación estricta:
- Campos requeridos
- Tipos de datos (string, number, boolean, array)
- Formatos específicos (URL, email)
- Rangos numéricos (rating: 0-5)

### 2. Validación Frontend
Complementa la validación backend con:
- Validación en tiempo real en formularios
- Mensajes de error amigables
- Prevención de envíos inválidos

**Ejemplo de error de validación:**
```json
{
  "errors": [
    {
      "field": "nombre",
      "message": "El nombre es obligatorio"
    },
    {
      "field": "url",
      "message": "URL inválida"
    }
  ]
}
```

## Gestión de Imágenes

La API soporta carga de imágenes para herramientas:

### Subir imagen
```http
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token-jwt>

file: <archivo-imagen>
toolId: 1
```

**Respuesta:**
```json
{
  "message": "Imagen subida exitosamente",
  "filename": "react-logo-123456.jpg",
  "path": "/uploads/react-logo-123456.jpg"
}
```

### Acceder a imagen
```http
GET /uploads/:filename
```

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Validación fallida |
| 401 | Unauthorized - Token inválido o ausente |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

## Errores Comunes

```json
{
  "error": "Token no proporcionado o inválido"
}
```

```json
{
  "error": "Recurso no encontrado"
}
```

```json
{
  "error": "La categoría ya existe"
}
```

## Ejemplos de Uso

### Ejemplo 1: Crear herramienta con categorías y etiquetas
```javascript
fetch('/api/tools', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    nombre: 'Vue.js',
    descripcion: 'Framework progresivo para JavaScript',
    url: 'https://vuejs.org',
    rating: 5,
    es_favorito: true,
    categories: [1], // Frontend
    tags: [1, 5] // JavaScript, Framework
  })
});
```

### Ejemplo 2: Buscar herramientas con filtros
```javascript
fetch('/api/tools?search=javascript&category=1&favorites=true')
  .then(response => response.json())
  .then(data => console.log(data.tools));
```

## Base de Datos

La API utiliza SQLite3 con las siguientes tablas:
- `tool` - Herramientas de desarrollo
- `category` - Categorías de herramientas
- `tag` - Etiquetas
- `tool_category` - Relación muchos-a-muchos (tools ↔ categories)
- `tool_tag` - Relación muchos-a-muchos (tools ↔ tags)
- `user` - Usuarios para autenticación

## Consideraciones de Seguridad

1. **Autenticación JWT:** Todos los tokens expiran después de 24 horas
2. **Validación de entrada:** Prevención de inyección SQL y XSS
3. **CORS configurado:** Acceso controlado desde frontend
4. **Rate limiting:** Protección contra ataques DDoS
5. **Sanitización:** Limpieza de datos de entrada

## Postman Collection

Disponible en `docs/DevToolsHub.postman_collection.json` con ejemplos de todas las rutas y métodos.

---

*Última actualización: 12 de abril de 2025*
*Versión API: 1.0.0*