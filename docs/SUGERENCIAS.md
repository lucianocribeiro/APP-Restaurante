# Sugerencias (Airtable o Google Sheets)

El menú tiene un botón "Déjanos tu sugerencia". Lo recibe la función `MenuApp-Frontend/api/sugerencias.js` de Vercel y lo guarda en Airtable **o** en Google Sheets, según las variables que estén cargadas en Vercel (Settings → Environment Variables). Después de cargarlas, hacer Redeploy.

Mientras no haya ninguna configurada, el formulario ofrece mandar la sugerencia por WhatsApp.

Cada sugerencia guarda: `Fecha`, `Local` (slug del restaurante), `Comentario`, `Puntaje` (1 a 5, opcional), `Nombre`, `Contacto` y `Mesa`.

## Opción A: Airtable

1. Crear una tabla `Sugerencias` con estas columnas (los nombres tienen que ser exactos):
   `Fecha` (fecha y hora), `Local` (texto), `Comentario` (texto largo), `Puntaje` (número), `Nombre` (texto), `Contacto` (texto), `Mesa` (texto).
2. Crear un token en https://airtable.com/create/tokens con el permiso `data.records:write` y acceso a esa base.
3. Variables en Vercel:

| Variable | Valor |
|----------|-------|
| `AIRTABLE_TOKEN` | El token (`pat...`) |
| `AIRTABLE_BASE_ID` | El ID de la base (`app...`, aparece en la URL de Airtable) |
| `AIRTABLE_TABLE` | Opcional, si la tabla no se llama `Sugerencias` |

## Opción B: Google Sheets

1. Crear una hoja con estos encabezados en la fila 1: `Fecha`, `Local`, `Comentario`, `Puntaje`, `Nombre`, `Contacto`, `Mesa`.
2. En la hoja: Extensiones → Apps Script, pegar este código y guardar:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.appendRow([data.Fecha, data.Local, data.Comentario, data.Puntaje, data.Nombre, data.Contacto, data.Mesa]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Implementar → Nueva implementación → Tipo: **Aplicación web**, Ejecutar como: **Yo**, Quién tiene acceso: **Cualquier usuario**. Copiar la URL que termina en `/exec`.
4. Variable en Vercel:

| Variable | Valor |
|----------|-------|
| `SHEETS_WEBHOOK_URL` | La URL `/exec` de la aplicación web |

Si están las dos opciones cargadas, se usa Airtable.
