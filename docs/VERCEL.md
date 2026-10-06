# Deploy en Vercel (solo frontend)

Este repo tiene solo el frontend (`MenuApp-Frontend`). El backend se deploya aparte.

## Pasos

1. **Importar el repo** en Vercel y hacer deploy. No hace falta cambiar nada: la configuración está en `vercel.json`. También funciona eligiendo `MenuApp-Frontend` como Root Directory.

Sin backend se ven las pantallas, pero el menú, los pedidos y el login no cargan datos.

## Cuando esté el backend

En Settings → Environment Variables agregar:

| Variable | Ejemplo |
|----------|---------|
| `VITE_BACKEND_URL` | `https://tu-api.ejemplo.com` |

Es la dirección del backend **sin** `/api` y **sin** barra final. Después hacer Redeploy.
