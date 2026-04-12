# 🚀 Deploy en Synology DS723+ NAS

## 📦 Archivos Configurados para Container Manager:

### **1. Dockerfile** (`/Dockerfile`)
- Puerto: 4004
- Variables de entorno preconfiguradas
- Incluye `.env.production`
- Optimizado para Synology ARM/x64

### **2. docker-compose.yml** (`/docker-compose.yml`)
- Configuración lista para Container Manager
- Volúmenes persistentes configurados
- Health check incluido
- Auto-reinicio habilitado

### **3. Configuración específica** (`/synology-container-config.md`)
- Guía paso a paso para Container Manager
- Configuración de puertos, volúmenes, variables
- Solución de problemas

## 🔧 **Pasos para Rebuild en Container Manager:**

### **Opción A: Usando Docker Compose (recomendado)**
1. En Container Manager → "Proyecto" → "Crear"
2. Nombre: `devtools-hub`
3. Ruta del proyecto: `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/`
4. Archivo: `docker-compose.yml`
5. Crear y ejecutar

### **Opción B: Contenedor manual**
1. **Imagen:** Construir desde Dockerfile
2. **Contexto:** `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/`
3. **Puerto:** `4004:4004`
4. **Volúmenes:**
   - `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data:/data`
   - `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/uploads:/data/uploads`
5. **Variables de entorno:** (ver abajo)

## ⚙️ **Variables de Entorno CRÍTICAS:**

```bash
NODE_ENV=production
HOST=0.0.0.0        # IMPORTANTE: Aceptar conexiones externas
PORT=4004           # Puerto interno del contenedor
DB_PATH=/data/devtools.db
JWT_SECRET=TU_SECRETO_FUERTE_AQUI  # ¡CAMBIAR OBLIGATORIO!
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://192.168.1.77:4004
```

## 🎯 **URLs de Acceso después del Deploy:**

- **Frontend:** `http://192.168.1.77:4004`
- **API:** `http://192.168.1.77:4004/api`
- **Health:** `http://192.168.1.77:4004/health`
- **Documentación API:** `http://192.168.1.77:4004/api-docs` (si está habilitada)

## 🔍 **Verificación Post-Deploy:**

```bash
# Ejecutar script de verificación
chmod +x check-container.sh
./check-container.sh

# O verificar manualmente:
curl http://192.168.1.77:4004/health
# Debe responder: {"status":"ok","timestamp":"..."}
```

## 🐛 **Problemas Comunes y Soluciones:**

### **1. "Puerto ya en uso"**
- Verificar que no haya otro contenedor usando puerto 4004
- Cambiar puerto en Container Manager si es necesario

### **2. "Permiso denegado" en volúmenes**
```bash
# En terminal del NAS (SSH)
sudo chmod 777 /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data
sudo chmod 777 /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/uploads
```

### **3. "better-sqlite3" errors**
- Rebuild completo del contenedor
- Verificar que Node.js 22+ esté en la imagen

### **4. No se puede acceder desde red**
- Verificar `HOST=0.0.0.0` en variables
- Verificar firewall del NAS
- Verificar configuración de red del contenedor (bridge)

## 📊 **Monitoreo:**

### **En Container Manager:**
- Ver logs en tiempo real
- Monitorear uso de CPU/RAM
- Verificar estado de health check

### **Scripts útiles:**
- `check-container.sh` - Verificación completa
- Ver logs: `docker logs -f devtools-hub-nas`
- Reiniciar: `docker restart devtools-hub-nas`

## 🔒 **Seguridad para Producción:**

1. **¡CAMBIAR JWT_SECRET!** - Usar secreto fuerte
2. **Configurar CORS específico** si usas dominio
3. **Considerar HTTPS** con reverse proxy
4. **Backups automáticos** de `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data/`
5. **Actualizar regularmente** la imagen

---

**✅ Estado:** Todos los archivos están configurados y listos para rebuild en Container Manager.
**🔗 URL objetivo:** `http://192.168.1.77:4004`