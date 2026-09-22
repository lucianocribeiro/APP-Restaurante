# Deploy en Vercel (solo frontend)

Guía corta para conectar **este repo** a una cuenta Vercel propia.

El backend (`MenuApp-Backend`) no se despliega en Vercel. Hay que hostearlo aparte y apuntar el front con `VITE_BACKEND_URL`.

## Settings recomendados en Vercel

| Setting | Valor |
|---------|--------|
| Root Directory | `MenuApp-Frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

## Environment variables

| Variable | Ejemplo |
|----------|---------|
| `VITE_BACKEND_URL` | `https://tu-api.ejemplo.com` |

Debe ser el origen del backend **sin** path `/api` y **sin** barra final.

## Backend CORS

En el servidor API:

```env
FRONTEND_URL=https://tu-app.vercel.app
```

Si usás dominio custom en Vercel, agregalo también (el backend actual acepta un string; si necesitás varios orígenes, usá el valor que configure el deploy del API).

## SPA

`MenuApp-Frontend/vercel.json` ya reescribe rutas a `index.html` para React Router.

Ver también el [README raíz](../README.md).
