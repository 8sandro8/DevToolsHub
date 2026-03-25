FROM node:20-bookworm-slim

WORKDIR /app

# Native dependency build tools for better-sqlite3
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies first for better layer caching
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy the full repository so backend can serve the frontend and read database/schema files
WORKDIR /app
COPY . .

# Production defaults for persistent Railway/Render volumes
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    DATA_DIR=/data \
    DB_PATH=/data/devtools.db \
    UPLOADS_DIR=/data/uploads

RUN mkdir -p /data/uploads

WORKDIR /app/backend
EXPOSE 4001

CMD ["npm", "start"]
