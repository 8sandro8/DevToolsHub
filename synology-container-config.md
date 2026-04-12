# Configuración para Synology DS723+ Container Manager

## 📋 Pasos para Configurar en Container Manager:

### 1. **Preparar el proyecto**
- Asegúrate de que todos los archivos estén en tu NAS
- Ruta recomendada: `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/`

### 2. **Crear volúmenes persistentes** (PASO CRÍTICO - HACER ANTES DE CONFIGURAR CONTENEDOR)
```bash
# Conectar al NAS vía SSH:
ssh admin@192.168.1.77

# Crear directorios para datos persistentes
sudo mkdir -p /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data
sudo mkdir -p /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/uploads

# IMPORTANTE: Asignar permisos 777 temporalmente (ajustar después de testing)
sudo chmod 777 /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data
sudo chmod 777 /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/uploads

# Verificar que se crearon
ls -la /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/
```

**⚠️ ERROR COMÚN:** "failed to mount local volume... no such file or directory"
- Significa que los directorios NO existen en el NAS
- Error ocurre en paso 16/16 cuando Container Manager intenta montar volumen
- **SOLUCIÓN:** Ejecutar los comandos SSH de arriba ANTES de configurar el contenedor

### 3. **Configurar en Container Manager**

#### **General:**
- **Nombre del contenedor:** `devtools-hub-nas`
- **Auto-reinicio:** Habilitado

#### **Fuente:**
- **Fuente de imagen:** `Dockerfile`
- **Ruta del Dockerfile:** `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/Dockerfile`
- **Contexto de build:** `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/`

#### **Puerto:**
- **Puerto local:** `4004`
- **Puerto contenedor:** `4004`
- **Tipo:** `TCP`

#### **Volúmenes:**
1. **Volumen de datos DB:**
   - **Ruta de montaje:** `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data`
   - **Ruta de montaje en contenedor:** `/data`
   - **Tipo:** `read/write`

2. **Volumen de uploads:**
   - **Ruta de montaje:** `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/uploads`
   - **Ruta de montaje en contenedor:** `/data/uploads`
   - **Tipo:** `read/write`

#### **Variables de entorno:**
```
NODE_ENV=production
HOST=0.0.0.0
PORT=4004
DB_PATH=/data/devtools.db
UPLOADS_DIR=/data/uploads
JWT_SECRET=tu_secreto_produccion_aqui  # ¡CAMBIAR ESTO!
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://192.168.1.77:4004
```

### 4. **Reconstruir/Recrear contenedor**
1. Detener contenedor existente (si hay)
2. Eliminar contenedor (conservar volúmenes)
3. Crear nuevo contenedor con configuración anterior
4. Iniciar contenedor

## 🔍 Verificación después del deploy:

### **Comandos de verificación:**
```bash
# Ver logs del contenedor
docker logs devtools-hub-nas

# Verificar salud
curl http://192.168.1.77:4004/health

# Verificar API
curl http://192.168.1.77:4004/api/tools
```

### **Acceso web:**
- **Frontend:** `http://192.168.1.77:4004`
- **API:** `http://192.168.1.77:4004/api`
- **Health check:** `http://192.168.1.77:4004/health`

## 🐛 Solución de problemas comunes:

### **1. Puerto en uso:**
```bash
# Verificar qué proceso usa el puerto 4004
netstat -tulpn | grep :4004
```

### **2. Permisos de volumen:**
```bash
# Dar permisos al contenedor
chmod 777 /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data
chmod 777 /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/uploads
```

### **3. Rebuild necesario:**
```bash
# Forzar rebuild en Container Manager
# Opción: "Recrear" o "Reconstruir imagen"
```

### **4. Logs de error:**
- Revisar logs en Container Manager → Contenedor → "Detalles" → "Log"
- Buscar errores de `better-sqlite3` (reinstalar dependencias)

## 🔒 Seguridad recomendada:
1. **Cambiar JWT_SECRET** por uno fuerte y único
2. **Configurar CORS_ORIGIN** específico si accedes desde dominio
3. **Considerar HTTPS** con reverse proxy (nginx en NAS)
4. **Backups automáticos** de `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data/`

---

**📅 Última actualización:** 12/04/2026  
**✅ Estado:** Configuración lista para Synology Container Manager