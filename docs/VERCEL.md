# Deploy en Vercel (todo en un solo proyecto)

Frontend, API y base de datos corren en Vercel. No hace falta otro servidor.

- El frontend (`MenuApp-Frontend`) se publica como sitio estático.
- La API (`MenuApp-Backend`) corre como función en `/api` (`api/index.ts`).
- La base es Postgres (Neon, desde Vercel Storage).
- Los pedidos se actualizan solos cada 5 segundos (en Vercel no hay Socket.IO).

## Pasos

1. **Importar el repo** en Vercel. No cambiar nada: Root Directory vacío, la configuración está en `vercel.json`. El deploy funciona sin base de datos: se ven las pantallas, pero el menú, los pedidos y el login no cargan datos hasta conectar la base.

## Cuando se conecte la base

1. **Crear la base:** en el proyecto, Storage → Create Database → Neon (Postgres) → conectarla al proyecto. Esto crea solas `DATABASE_URL` y `DATABASE_URL_UNPOOLED`. Con otro Postgres alcanza con cargar `DATABASE_URL`.
2. **Agregar la variable** `JWT_SECRET` en Settings → Environment Variables (un texto largo al azar, 32+ caracteres).
3. **Redeploy.**

En cada deploy con base se aplican las migraciones. La primera vez, con la base vacía, se carga el menú de Entrepanes, las mesas y el usuario admin `admin@menuapp.com` / `admin123`. En los deploys siguientes no se toca lo que ya hay.

## Rutas

- Menú: `/m/entrepanes`
- Admin y mozo: `/admin/login`
- Chequeo de la API: `/api/health`

## Volver a cargar el menú desde cero

Borra todos los datos (pedidos incluidos). Con las variables de la base en `MenuApp-Backend/.env`:

```bash
cd MenuApp-Backend
npm run seed
```
