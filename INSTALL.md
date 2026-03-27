# DevToolsHub - INSTALL

Guia corta para ejecutar el proyecto sin problemas.

## Requisitos

- Node.js 20+ y npm
- Git
- Docker y Docker Compose (solo si quieres usar el despliegue local tipo contenedor)

## Instalacion local

1. Entra en la carpeta `backend/`.
2. Instala dependencias con `npm install`.
3. Crea un archivo `.env` a partir de `backend/.env.example`.
4. Arranca el servidor con `npm run dev` o `npm start`.

No hace falta levantar un frontend aparte: Express sirve la interfaz web.

## Variables de entorno

Configura al menos estas variables si usas `.env`:

- `JWT_SECRET` - obligatoria para autenticacion JWT
- `JWT_EXPIRES_IN` - opcional, por defecto `24h`
- `GITHUB_TOKEN` - opcional, mejora el limite de la API de GitHub
- `CORS_ORIGIN` - opcional, por defecto `*`
- `PORT` - opcional, por defecto `4001` en local y `4002` en Docker/NAS
- `HOST` - opcional, por defecto `0.0.0.0`
- `DATA_DIR` - opcional, carpeta de datos
- `DB_PATH` - opcional, ruta del archivo SQLite
- `UPLOADS_DIR` - opcional, carpeta para imagenes subidas

## Base de datos y migraciones

- La base SQLite se crea sola al arrancar la app.
- El esquema y los datos iniciales se cargan desde `database/schema.sql` y `database/seed.sql`.
- Si la base ya existia, aplica la migracion `database/migrations/add_image_url.sql` para agregar `image_url` a `tool`.
- Si necesitas reiniciar desde cero, detén la app y borra el archivo SQLite de `data/`.

## Backend y frontend

- Backend/API local: `http://localhost:4001/api`
- Frontend local: `http://localhost:4001/`
- Login: `http://localhost:4001/login`

## Despliegue en NAS

URL publicada: `http://192.168.1.77:4002/`

## Arranque con Docker

1. Desde la raiz del proyecto, ejecuta `docker compose up --build`.
2. Abre `http://localhost:4002/`.
