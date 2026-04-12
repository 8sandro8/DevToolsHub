# 🔧 Debug de Errores en Container Manager

## 📋 **Logs de Error del Build:**

Cuando Container Manager muestra "Build project 'devtoolshub' failed", necesitamos:

### **1. Ver Logs del Build Fallido:**
En Container Manager:
1. Ir al proyecto `devtoolshub`
2. Click en "Detalles" o "Logs"
3. Buscar mensajes de error específicos

### **2. Posibles Errores Comunes:**

#### **A. Error de Dependencias (`better-sqlite3`)**
```
Error: The module was compiled against a different Node.js version
```
**Solución:** Usar `node:22-alpine` o `node:22-slim` en Dockerfile

#### **B. Error de Permisos**
```
Permission denied: /data/devtools.db
```
**Solución:**
```bash
ssh admin@192.168.1.77
sudo chmod 777 /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data
```

#### **C. Error de Memoria/RAM**
```
Killed - proceso terminado por OOM (Out Of Memory)
```
**Solución:** Aumentar límite de RAM en Container Manager o usar build más ligero

#### **D. Error de Red**
```
Failed to connect to registry.npmjs.org
```
**Solución:** Verificar conexión a internet del NAS

#### **E. Error: "failed to mount local volume... no such file or directory"**
```
Error: failed to mount local volume:mount..........flags : 0x1000: no such file or directory
```
**Causa:** Los directorios de volumen no existen en el NAS

**Solución (ejecutar vía SSH en el NAS):**
```bash
# Conectar al NAS
ssh admin@192.168.1.77

# Crear directorios faltantes
sudo mkdir -p /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data
sudo mkdir -p /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/uploads

# Asignar permisos
sudo chmod 777 /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data
sudo chmod 777 /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/uploads

# Verificar
ls -la /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/
```

**Posterior al éxito:** Ajustar permisos a más restrictivos (e.g., 755 con usuario específico)

### **3. Pasos de Debug Manual:**

#### **Opción A: Build via SSH**
```bash
# Conectarse al NAS via SSH
ssh admin@192.168.1.77

# Navegar al proyecto
cd /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub

# Intentar build manual
docker build -t devtools-test -f Dockerfile .
```

#### **Opción B: Usar imagen pre-construida
```bash
# Cambiar a imagen más simple
docker build -t devtools-test -f Dockerfile.simple .
```

### **4. Configuración Alternativa para Container Manager:**

#### **Dockerfile Simplificado (copiar esto):**
```dockerfile
FROM node:22-slim
WORKDIR /app
COPY . .
RUN cd backend && npm ci --only=production
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4004
EXPOSE 4004
CMD ["node", "backend/src/server.js"]
```

#### **Variables Mínimas:**
```
NODE_ENV=production
HOST=0.0.0.0
PORT=4004
DB_PATH=/data/devtools.db
```

### **5. Solución Rápida:**

1. **En Container Manager:**
   - Eliminar proyecto `devtoolshub`
   - Crear nuevo proyecto
   - Nombre: `devtools-hub-simple`
   - Ruta: `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/`
   - Dockerfile: `Dockerfile.simple`

2. **Configuración:**
   - Puerto: `4004:4004`
   - Volumen: `/volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/data:/data`
   - Variables: Las mínimas listadas arriba

### **6. Verificar después del Build:**

```bash
# En terminal del NAS
docker ps
docker logs devtools-hub-simple
curl http://localhost:4004/health
```

## 🎯 **Si NADA funciona:**

### **Opción Nuclear:**
1. **Eliminar TODO:**
   ```bash
   docker stop $(docker ps -aq)
   docker rm $(docker ps -aq)
   docker rmi $(docker images -q)
   rm -rf /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/node_modules
   ```

2. **Comenzar de nuevo:**
   ```bash
   cd /volume1/docker/Proyectos/DevToolsHub/Dev_Tools_Hub/backend
   npm cache clean --force
   npm install
   ```

3. **Build ultra simple:**
   ```dockerfile
   FROM node:22
   COPY . /app
   WORKDIR /app/backend
   RUN npm install
   CMD ["node", "src/server.js"]
   ```

## 📞 **Para Más Ayuda:**

Proporciona los **logs exactos del error** de Container Manager y puedo darte una solución específica.

**Logs clave a buscar:**
- Línea que dice `ERROR` o `failed`
- Mensajes sobre `better-sqlite3`
- Errores de `npm install`
- Problemas de `permission denied`