# Guía de Deployment — MenuApp

Esta guía cubre el deploy completo de MenuApp en el entorno de producción actual:  
**WSL2 (Ubuntu) + Apache 2.4 (Windows host) + PM2**.

---

## Arquitectura del servidor

```
Internet
    │
    ▼
Windows Host : 179.41.8.247
┌──────────────────────────────────────┐
│  Apache 2.4  (puerto :80)            │
│  C:\Apache24\                        │
│  Actúa como reverse proxy            │
└───────────────┬──────────────────────┘
                │ ProxyPass → localhost:3001
                ▼
WSL2 (Ubuntu) : 172.x.x.x (IP dinámica)
┌──────────────────────────────────────┐
│  Node.js / Express  (puerto :3001)   │
│  PM2 process manager                 │
│  Sirve API + Frontend compilado      │
└───────────────┬──────────────────────┘
                │
                ▼
         SQLite dev.db
```

Apache resuelve la IP dinámica de WSL2 usando `localhost` (Windows mapea automáticamente `localhost` al WSL2 activo).

---

## Requisitos

### En WSL2 (Ubuntu)
- Node.js 18 o superior
- npm 9 o superior
- PM2 instalado globalmente: `npm install -g pm2`
- Git

### En Windows host
- Apache 2.4 instalado en `C:\Apache24\`
- Módulos Apache habilitados: `mod_proxy`, `mod_proxy_http`, `mod_proxy_wstunnel`, `mod_rewrite`

---

## Paso 1 — Clonar el repositorio

```bash
# En WSL2
cd ~
git clone https://github.com/lucianocribeiro/APP-Restaurante.git
cd APP-Restaurante
```

---

## Paso 2 — Instalar dependencias

```bash
# Backend
cd MenuApp-Backend
npm install

# Frontend
cd ../MenuApp-Frontend
npm install
```

---

## Paso 3 — Configurar variables de entorno

```bash
# En MenuApp-Backend/
nano .env
```

Contenido del `.env`:

```env
PORT=3001
JWT_SECRET=tu-secreto-muy-largo-y-seguro-aqui
MP_ACCESS_TOKEN=APP_USR-tu-token-de-mercadopago
BASE_URL=http://179.41.8.247
FRONTEND_URL=*
```

| Variable | Descripción |
|---------|-------------|
| `PORT` | Puerto del servidor Node.js (default 3001) |
| `JWT_SECRET` | Secreto para firmar y verificar tokens JWT. **Nunca commitear.** |
| `MP_ACCESS_TOKEN` | Token de producción de Mercado Pago. Opcional si no se usa MP. |
| `BASE_URL` | URL pública de la app. Usada para `back_urls` de Mercado Pago. |
| `FRONTEND_URL` | Orígenes permitidos por CORS. En producción con proxy puede ser `*`. |

> El archivo `.env` está en `.gitignore` y **nunca debe subirse al repositorio**.

---

## Paso 4 — Inicializar la base de datos

```bash
cd MenuApp-Backend

# Aplicar el schema de Prisma
npx prisma migrate dev

# Poblar con datos iniciales (Chilli Garden)
npx prisma db seed
```

Esto crea:
- `prisma/dev.db` — base de datos SQLite
- Usuario admin: `admin@menuapp.com` / `admin123`
- Local Chilli Garden con menú completo

---

## Paso 5 — Compilar la aplicación

```bash
# Frontend (genera MenuApp-Frontend/dist/)
cd MenuApp-Frontend
npm run build

# Backend (genera MenuApp-Backend/dist/)
cd ../MenuApp-Backend
npm run build
```

El backend en producción sirve el `dist/` del frontend como archivos estáticos.

---

## Paso 6 — Iniciar con PM2

```bash
cd MenuApp-Backend

pm2 start dist/index.js \
  --name menuapp-backend \
  --cwd /home/mugg_server_1/appmenu/MenuApp-Backend

pm2 save
```

El `--cwd` es importante: permite que PM2 encuentre y cargue el archivo `.env`.

### Comandos PM2 útiles

```bash
pm2 status                          # Ver estado del proceso
pm2 logs menuapp-backend            # Ver logs en tiempo real
pm2 logs menuapp-backend --lines 50 # Últimas 50 líneas
pm2 restart menuapp-backend         # Reiniciar
pm2 stop menuapp-backend            # Detener
pm2 delete menuapp-backend          # Eliminar del registro
pm2 startup                         # Configurar autostart al reiniciar
```

---

## Paso 7 — Configurar Apache en Windows

Archivo a editar: `C:\Apache24\conf\httpd.conf`

### 7.1 Verificar módulos habilitados

Asegurarse de que estas líneas estén **sin** el `#` al inicio:

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
LoadModule rewrite_module modules/mod_rewrite.so
```

### 7.2 Configurar el VirtualHost para MenuApp

Agregar o reemplazar el bloque `VirtualHost *:80` destinado a la IP del modem:

```apache
<VirtualHost *:80>
    ServerName 179.41.8.247
    ServerAlias 179.41.8.247

    ProxyPreserveHost On

    # WebSocket forwarding para Socket.io
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule ^/socket\.io/(.*)$ ws://localhost:3001/socket.io/$1 [P,L]

    # Proxy de socket.io HTTP polling
    ProxyPass        /socket.io/ http://localhost:3001/socket.io/
    ProxyPassReverse /socket.io/ http://localhost:3001/socket.io/

    # Proxy del resto de la aplicación
    ProxyPass        / http://localhost:3001/
    ProxyPassReverse / http://localhost:3001/

    <Proxy *>
        Require all granted
    </Proxy>

    ErrorLog  "C:/Apache24/logs/menuapp_error.log"
    CustomLog "C:/Apache24/logs/menuapp_access.log" combined
</VirtualHost>
```

### 7.3 Reiniciar Apache

Desde una terminal de Windows con permisos de administrador:

```cmd
C:\Apache24\bin\httpd.exe -k restart
```

O usando el servicio de Windows:

```cmd
net stop Apache2.4
net start Apache2.4
```

---

## Script de inicio `app.sh`

El archivo `app.sh` en la raíz del proyecto automatiza el inicio de la app en WSL2:

```bash
#!/bin/bash
# Inicia o reinicia el servidor de MenuApp en WSL2
cd /home/mugg_server_1/appmenu/MenuApp-Backend

if pm2 list | grep -q "menuapp-backend"; then
  echo "Reiniciando menuapp-backend..."
  pm2 restart menuapp-backend
else
  echo "Iniciando menuapp-backend..."
  pm2 start dist/index.js \
    --name menuapp-backend \
    --cwd /home/mugg_server_1/appmenu/MenuApp-Backend
fi

pm2 save

echo ""
echo "MenuApp corriendo en:"
echo "  http://179.41.8.247/                    → Landing"
echo "  http://179.41.8.247/m/chilligarden      → Menú Chilli Garden"
echo "  http://179.41.8.247/admin/login         → Admin login"
```

Ejecutar:

```bash
chmod +x app.sh
./app.sh
```

---

## Flujo de actualización

Cuando hay cambios en el repositorio:

```bash
cd /home/mugg_server_1/appmenu

# 1. Obtener cambios
git pull origin main

# 2. Instalar nuevas dependencias (si las hay)
cd MenuApp-Backend && npm install
cd ../MenuApp-Frontend && npm install

# 3. Aplicar migraciones de DB (si las hay)
cd ../MenuApp-Backend
npx prisma migrate deploy

# 4. Recompilar
cd ../MenuApp-Frontend && npm run build
cd ../MenuApp-Backend && npm run build

# 5. Reiniciar
pm2 restart menuapp-backend
```

---

## Verificar que todo funciona

```bash
# 1. PM2 corriendo
pm2 status

# 2. Puerto 3001 escuchando
curl http://localhost:3001/api/menu/chilligarden | head -c 200

# 3. App accesible desde afuera
curl http://179.41.8.247/api/menu/chilligarden | head -c 200
```

---

## Solución de problemas comunes

### PM2 no carga el `.env`

**Síntoma:** `Error: JWT_SECRET environment variable is required`  
**Causa:** PM2 no tiene el CWD correcto.  
**Solución:**
```bash
pm2 delete menuapp-backend
pm2 start dist/index.js --name menuapp-backend --cwd /home/mugg_server_1/appmenu/MenuApp-Backend
```

---

### Apache muestra 502 Bad Gateway

**Causa:** Node.js no está corriendo o está en otro puerto.  
**Solución:**
```bash
pm2 status
# Si no está online:
./app.sh
```

---

### WebSocket / Socket.io no conecta

**Síntoma:** El admin/mozo no recibe pedidos en tiempo real.  
**Causa:** `mod_proxy_wstunnel` no está habilitado en Apache.  
**Solución:** Verificar que esta línea esté descomentada en `httpd.conf`:
```apache
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
```
Luego reiniciar Apache.

---

### La base de datos se pierde al re-seedear

El comando `npx prisma db seed` **borra todos los datos** antes de insertar. No ejecutar en producción a menos que se quiera resetear todo el menú y pedidos.  
Para solo aplicar migraciones de schema sin borrar datos:
```bash
npx prisma migrate deploy
```

---

## Variables de entorno — referencia rápida

| Variable | Requerida | Default | Descripción |
|---------|:---------:|---------|-------------|
| `PORT` | No | `3001` | Puerto del servidor Express |
| `JWT_SECRET` | **Sí** | — | Secreto JWT. Mínimo 32 caracteres. |
| `MP_ACCESS_TOKEN` | No | — | Token de Mercado Pago (para pagos online) |
| `BASE_URL` | No | `http://localhost:5173` | URL pública para back_urls de MP |
| `FRONTEND_URL` | No | `*` | Origen(es) permitidos por CORS |
