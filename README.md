# APP-Restaurante (MenuApp)

Menú digital con QR, pedidos en tiempo real, panel admin y mozo.

Repositorio: [lucianocribeiro/APP-Restaurante](https://github.com/lucianocribeiro/APP-Restaurante)

```
MenuApp-Frontend/   → React + Vite (esto va a Vercel)
MenuApp-Backend/    → Express + Prisma + Socket.IO (API aparte)
docs/               → Documentación
```

---

## Conectar Vercel (compañero)

El frontend se despliega en **tu** cuenta de Vercel. El backend no corre en Vercel (necesita Node + DB); desplegalo aparte (Render, Railway, VPS, etc.) y enlazalo con una variable de entorno.

### 1. Importar el repo en Vercel

1. Entrá a [vercel.com](https://vercel.com) → **Add New Project**
2. Importá `lucianocribeiro/APP-Restaurante` (pedí acceso al repo si es privado)
3. Configuración del proyecto:

| Campo | Valor |
|--------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `MenuApp-Frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 2. Variable de entorno en Vercel

En **Project → Settings → Environment Variables**:

| Name | Value | Environments |
|------|--------|----------------|
| `VITE_BACKEND_URL` | URL pública de tu API, sin `/` final (ej. `https://tu-api.onrender.com`) | Production, Preview |

Sin esta variable, el front llama a `/api` en el mismo dominio de Vercel y va a fallar.

### 3. CORS en el backend

En el `.env` del backend poné el dominio de Vercel:

```env
FRONTEND_URL=https://tu-proyecto.vercel.app
```

(Podés sumar el dominio custom si lo hay.)

### 4. Redeploy

Después de guardar `VITE_BACKEND_URL`, hacé **Redeploy** (las `VITE_*` se inyectan en el build).

---

## Backend (referencia rápida)

```bash
cd MenuApp-Backend
cp .env.example .env   # completar JWT_SECRET, etc.
npm install
npx prisma migrate deploy
npx prisma db seed     # solo si querés datos demo
npm run build
npm start
```

Detalle: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) · API: [`docs/API.md`](docs/API.md)

---

## Desarrollo local

```bash
# Terminal 1
cd MenuApp-Backend && npm install && npm run dev

# Terminal 2
cd MenuApp-Frontend && npm install && npm run dev
```

Frontend: `http://localhost:5173` (proxy a la API en `:3001`).
