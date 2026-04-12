#!/bin/bash
# Script de build para Synology Container Manager
# Ejecutar en el NAS vía SSH o terminal

echo "🔨 Build de DevToolsHub para Synology NAS"
echo "=========================================="

# Variables
PROJECT_DIR="/docker/devtools-hub"
CONTAINER_NAME="devtools-hub-nas"
IMAGE_NAME="devtools-hub:synology"

echo "1. Limpiando build anterior..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true
docker rmi $IMAGE_NAME 2>/dev/null || true

echo "2. Construyendo imagen..."
cd $PROJECT_DIR
docker build -t $IMAGE_NAME -f Dockerfile .

if [ $? -eq 0 ]; then
    echo "   ✅ Build exitoso!"
else
    echo "   ❌ Build falló. Intentando con Dockerfile simple..."
    docker build -t $IMAGE_NAME -f Dockerfile.simple .
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Build con Dockerfile.simple exitoso!"
    else
        echo "   ❌ Build falló completamente."
        exit 1
    fi
fi

echo ""
echo "3. Creando contenedor..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p 4004:4004 \
  -v /docker/devtools-hub/data:/data \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=4004 \
  -e DB_PATH=/data/devtools.db \
  -e JWT_SECRET=production_synology_nas_change_me \
  -e JWT_EXPIRES_IN=24h \
  -e CORS_ORIGIN=http://192.168.1.77:4004 \
  $IMAGE_NAME

echo ""
echo "4. Verificando contenedor..."
sleep 5
docker ps | grep $CONTAINER_NAME

echo ""
echo "5. Verificando logs (últimas 10 líneas)..."
docker logs --tail 10 $CONTAINER_NAME

echo ""
echo "6. Verificando salud..."
sleep 3
curl -s http://localhost:4004/health || echo "   ⚠️ Health check no disponible aún"

echo ""
echo "=========================================="
echo "✅ Build completado!"
echo "🔗 Accede en: http://192.168.1.77:4004"
echo "📋 Ver logs: docker logs -f $CONTAINER_NAME"
echo "=========================================="