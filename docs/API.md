# API Reference — MenuApp

Base URL en producción: `http://179.41.8.247/api`  
Base URL en desarrollo: `http://localhost:3001/api`

El cliente frontend usa `baseURL: '/api'` (relativa) para que funcione en cualquier entorno sin recompilar.

---

## Autenticación

Las rutas protegidas requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene con `POST /auth/login` y tiene vigencia de **1 día**.

---

## Rutas públicas

### Autenticación

---

#### `POST /api/auth/login`

Autentica un usuario y devuelve un JWT.

**Body:**
```json
{
  "email": "admin@menuapp.com",
  "password": "admin123"
}
```

**Respuesta exitosa `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@menuapp.com",
    "rol": "owner",
    "local": {
      "id": 1,
      "nombre": "Chilli Garden",
      "slug": "chilligarden"
    }
  }
}
```

**Errores:**
| Código | Motivo |
|--------|--------|
| `401` | Credenciales incorrectas |
| `500` | Error del servidor o JWT_SECRET no configurado |

---

### Menú público

---

#### `GET /api/menu/:slug`

Devuelve el menú completo de un local, con sus categorías, productos activos y mesas.

**Params:** `slug` — identificador único del local (ej: `chilligarden`)

**Respuesta exitosa `200`:**
```json
{
  "id": 1,
  "nombre": "Chilli Garden",
  "logo": "https://...",
  "slug": "chilligarden",
  "cbuAlias": "CHILLI.GARDEN.PAY",
  "mercadoPagoLink": "https://link.mercadopago.com.ar/chilligarden",
  "horarioApertura": "18:00",
  "horarioCierre": "00:00",
  "categorias": [
    {
      "id": 1,
      "nombre": "Hamburguesas",
      "orden": 1,
      "productos": [
        {
          "id": 1,
          "nombre": "Chilli Burger",
          "descripcion": "...",
          "precio": 8000,
          "imagen": "/images/chilligarden/img1.jpeg",
          "activo": true,
          "stock": 10
        }
      ]
    }
  ],
  "mesas": [
    { "id": 1, "numero": "1", "localId": 1 }
  ]
}
```

**Errores:**
| Código | Motivo |
|--------|--------|
| `404` | Local no encontrado para ese slug |
| `500` | Error interno del servidor |

---

### Pedidos

---

#### `POST /api/orders`

Crea un nuevo pedido. Emite el evento `newOrder` por Socket.io al admin y mozos.

**Body:**
```json
{
  "localId": 1,
  "mesa": "3",
  "metodoPago": "Efectivo",
  "total": 16000,
  "tipoOrden": "salon",
  "items": [
    {
      "productId": 1,
      "cantidad": 2,
      "precioUnitario": 8000,
      "aclaracion": "sin cebolla"
    }
  ]
}
```

Cuando `tipoOrden` es `"retirar"`, el frontend envía `mesa: "Retirar"`.

`codigo` es el número de pedido que ve el cliente: `S{mesa}-NNN` para salón (ej. `S1-001`), `R-NNN` para retirar y `D-NNN` para delivery. La secuencia es por prefijo. Si el backend no lo devuelve, el frontend muestra el `id`.

**Respuesta exitosa `201`:**
```json
{
  "id": 42,
  "codigo": "S3-001",
  "localId": 1,
  "mesa": "3",
  "estado": "Recibido",
  "total": 16000,
  "metodoPago": "Efectivo",
  "tipoOrden": "salon",
  "pagoConfirmado": false,
  "createdAt": "2026-05-09T17:00:00.000Z",
  "items": [
    {
      "id": 1,
      "orderId": 42,
      "productId": 1,
      "cantidad": 2,
      "precioUnitario": 8000,
      "aclaracion": "sin cebolla",
      "producto": { "id": 1, "nombre": "Chilli Burger", ... }
    }
  ]
}
```

**Errores:**
| Código | Motivo |
|--------|--------|
| `400` | `localId` o `productId` no encontrado |
| `500` | Error al crear el pedido |

---

#### `GET /api/orders/:id`

Devuelve el estado de un pedido por ID. Usado por la página de tracking del cliente.

**Params:** `id` — ID numérico del pedido

**Respuesta exitosa `200`:**
```json
{
  "id": 42,
  "mesa": "3",
  "estado": "En preparación",
  "pagoConfirmado": false,
  "total": 16000,
  "metodoPago": "Efectivo",
  "createdAt": "2026-05-09T17:00:00.000Z",
  "items": [
    {
      "cantidad": 2,
      "nombre": "Chilli Burger",
      "precioUnitario": 8000
    }
  ]
}
```

**Errores:**
| Código | Motivo |
|--------|--------|
| `400` | ID no es un número válido |
| `404` | Pedido no encontrado |
| `500` | Error interno |

---

### Pagos (Mercado Pago)

---

#### `POST /api/payment/create-preference`

Crea una preferencia de pago en Mercado Pago y devuelve el link de pago.

**Body:**
```json
{
  "items": [
    {
      "nombre": "Chilli Burger",
      "precioUnitario": 8000,
      "cantidad": 2
    }
  ],
  "localId": 1,
  "orderId": 42
}
```

**Respuesta exitosa `200`:**
```json
{
  "preferenceId": "123456789-abc...",
  "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
}
```

**Errores:**
| Código | Motivo |
|--------|--------|
| `500` | `MP_ACCESS_TOKEN` no configurado |
| `404` | Local no encontrado |
| `500` | Error de la API de Mercado Pago |

---

#### `POST /api/payment/webhook`

Endpoint para notificaciones de Mercado Pago (IPN). Actualiza el estado del pedido a `pagoConfirmado: true` cuando el pago es aprobado.

**Body (enviado por Mercado Pago):**
```json
{
  "type": "payment",
  "data": { "id": "123456" }
}
```

**Respuesta exitosa `200`:**
```json
{ "status": "ok" }
```

Este endpoint debe estar configurado como URL de webhook en el panel de Mercado Pago.

---

## Rutas protegidas (requieren JWT)

Todas las rutas bajo `/api/admin/*` requieren `Authorization: Bearer <token>`.

---

### Pedidos (Admin)

---

#### `GET /api/admin/orders`

Devuelve todos los pedidos del local del usuario autenticado, ordenados del más reciente al más antiguo.

**Respuesta `200`:** Array de pedidos con `items` e información del `producto` en cada item.

---

#### `PUT /api/admin/orders/:id/status`

Actualiza el estado de un pedido. Emite `orderStatusUpdated` por Socket.io.

**Body:**
```json
{ "estado": "En preparación" }
```

**Estados posibles:** `Recibido`, `En preparación`, `Listo`, `Entregado`, `Cobrado`

**Respuesta `200`:** Pedido actualizado completo.

---

#### `PUT /api/admin/orders/:id/payment`

Marca el pago de un pedido como confirmado o no. Emite `orderPaymentUpdated` por Socket.io.

**Body:**
```json
{ "pagoConfirmado": true }
```

**Respuesta `200`:** Pedido actualizado completo.

---

### Productos y Categorías (Admin)

---

#### `GET /api/admin/categories`

Lista las categorías del local del usuario autenticado, ordenadas por `orden`.

**Respuesta `200`:** Array de `{ id, nombre, orden, localId }`.

---

#### `GET /api/admin/products`

Lista todos los productos del local (incluyendo inactivos), con su categoría y cocina asignada.

**Respuesta `200`:** Array de productos con `categoria` y `kitchen` incluidos.

---

#### `POST /api/admin/products`

Crea un nuevo producto.

**Body:**
```json
{
  "categoryId": 1,
  "nombre": "Mega Burger",
  "descripcion": "Descripción opcional",
  "precio": 9500,
  "imagen": "/images/chilligarden/img20.jpeg",
  "stock": 15,
  "kitchenId": 1
}
```

**Respuesta `200`:** Producto creado.

---

#### `PUT /api/admin/products/:id/stock`

Actualiza el stock de un producto.

**Body:**
```json
{ "stock": 8 }
```

**Respuesta `200`:** Producto actualizado.

---

### Cocinas (Admin)

---

#### `GET /api/admin/kitchens`

Lista las cocinas del local.

**Respuesta `200`:** Array de `{ id, nombre, localId }`.

---

#### `POST /api/admin/kitchens`

Crea una nueva cocina.

**Body:**
```json
{ "nombre": "Parrilla" }
```

**Respuesta `200`:** Cocina creada.

---

#### `DELETE /api/admin/kitchens/:id`

Elimina una cocina.

**Respuesta `200`:** `{ "message": "Kitchen deleted" }`

---

### Mesas (Admin)

---

#### `GET /api/admin/tables`

Lista las mesas del local, ordenadas por número.

**Respuesta `200`:** Array de `{ id, numero, localId }`.

---

#### `POST /api/admin/tables`

Crea una nueva mesa.

**Body:**
```json
{ "numero": "12" }
```

**Respuesta `200`:** Mesa creada.

---

#### `DELETE /api/admin/tables/:id`

Elimina una mesa.

**Respuesta `200`:** `{ "message": "Table deleted successfully" }`

---

### Usuarios (Admin)

Solo para usuarios con rol `owner` (Caja). Nunca se devuelve la contraseña.

---

#### `GET /api/admin/users`

Lista los usuarios del local.

**Respuesta `200`:** Array de `{ id, nombre, email, rol, localId }`.

---

#### `POST /api/admin/users`

Crea un usuario para el local del usuario autenticado. `rol` es `owner` (Caja) o `mozo`.

**Body:**
```json
{ "nombre": "Ana", "email": "ana@entrepanes.com", "password": "secreto", "rol": "mozo" }
```

**Respuesta `201`:** Usuario creado (sin `password`). `409` si el email ya existe.

---

#### `DELETE /api/admin/users/:id`

Elimina un usuario. Devuelve `400` si es el último usuario `owner` del local.

**Respuesta `200`:** `{ "ok": true }`

---

### Configuración del local (Admin)

---

#### `GET /api/admin/local`

Devuelve la configuración actual del local del usuario autenticado.

**Respuesta `200`:**
```json
{
  "nombre": "Chilli Garden",
  "logo": "https://...",
  "slug": "chilligarden",
  "cbuAlias": "CHILLI.GARDEN.PAY",
  "mercadoPagoLink": "https://link.mercadopago.com.ar/chilligarden"
}
```

---

#### `PUT /api/admin/local`

Actualiza la configuración del local.

**Body:**
```json
{
  "nombre": "Chilli Garden",
  "logo": "https://nueva-imagen.com/logo.jpg",
  "cbuAlias": "NUEVO.ALIAS",
  "mercadoPagoLink": "https://link.mercadopago.com.ar/nuevo"
}
```

**Respuesta `200`:** Local actualizado completo.

---

## Tabla resumen de rutas

| Método | Path | Auth | Descripción |
|--------|------|:----:|-------------|
| POST | `/api/auth/login` | No | Login con email/password |
| GET | `/api/menu/:slug` | No | Menú público de un local |
| POST | `/api/orders` | No | Crear pedido |
| GET | `/api/orders/:id` | No | Estado de un pedido |
| POST | `/api/payment/create-preference` | No | Crear preferencia MP |
| POST | `/api/payment/webhook` | No | Webhook de MP |
| GET | `/api/admin/orders` | Sí | Listar pedidos del local |
| PUT | `/api/admin/orders/:id/status` | Sí | Actualizar estado del pedido |
| PUT | `/api/admin/orders/:id/payment` | Sí | Marcar pago del pedido |
| GET | `/api/admin/categories` | Sí | Listar categorías |
| GET | `/api/admin/products` | Sí | Listar productos |
| POST | `/api/admin/products` | Sí | Crear producto |
| PUT | `/api/admin/products/:id/stock` | Sí | Actualizar stock |
| GET | `/api/admin/kitchens` | Sí | Listar cocinas |
| POST | `/api/admin/kitchens` | Sí | Crear cocina |
| DELETE | `/api/admin/kitchens/:id` | Sí | Eliminar cocina |
| GET | `/api/admin/tables` | Sí | Listar mesas |
| POST | `/api/admin/tables` | Sí | Crear mesa |
| DELETE | `/api/admin/tables/:id` | Sí | Eliminar mesa |
| GET | `/api/admin/users` | Sí | Listar usuarios del local |
| POST | `/api/admin/users` | Sí | Crear usuario (Caja o Mozo) |
| DELETE | `/api/admin/users/:id` | Sí | Eliminar usuario |
| GET | `/api/admin/local` | Sí | Ver config del local |
| PUT | `/api/admin/local` | Sí | Actualizar config del local |
