# DevToolsHub

Colección de herramientas de desarrollo para programadores.

## Colección de API

Para probar los endpoints del backend, puedes importar las siguientes colecciones en tu cliente REST favorito:

| Archivo | Descripción |
|---------|-------------|
| `DevToolsHub.postman_collection.json` | Colección para Postman (v2.1) |
| `DevToolsHub.hopp_collection.json` | Colección para HoppScotch |

### Endpoints incluidos

**Health**
- `GET /api/health` - Verifica el estado de la API

**Tools**
- `GET /api/tools` - Lista todas las herramientas (soporta filtros: buscar, categoria, favorito, page, limit)
- `GET /api/tools/:id` - Obtiene una herramienta por ID
- `POST /api/tools` - Crea una nueva herramienta
- `PUT /api/tools/:id` - Actualiza una herramienta
- `DELETE /api/tools/:id` - Archiva una herramienta
- `PATCH /api/tools/:id/favorito` - Alterna el estado de favorito

**Categories**
- `GET /api/categories` - Lista todas las categorías
- `GET /api/categories/:id` - Obtiene una categoría por ID
- `POST /api/categories` - Crea una nueva categoría
- `PUT /api/categories/:id` - Actualiza una categoría
- `DELETE /api/categories/:id` - Elimina una categoría

### Importar en Postman

1. Abre Postman
2. Click en "Import" > "File"
3. Selecciona `DevToolsHub.postman_collection.json`
4. La colección se importará con la variable `baseUrl` configurada como `http://localhost:4001/api`

### Importar en HoppScotch

1. Abre HoppScotch
2. Click en "Import" > "File"
3. Selecciona `DevToolsHub.hopp_collection.json`
4. La colección se importará con la variable `baseUrl` configurada como `http://localhost:4001/api`

---

*Más información en el repositorio: https://github.com/8sandro8/DevToolsHub*