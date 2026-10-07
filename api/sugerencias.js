// POST /api/sugerencias — guarda una sugerencia del menú en Airtable o Google Sheets.
//
// Variables en Vercel (una de las dos opciones):
//   Airtable: AIRTABLE_TOKEN, AIRTABLE_BASE_ID y AIRTABLE_TABLE (por defecto "Sugerencias")
//   Sheets:   SHEETS_WEBHOOK_URL (URL de la Web App de Apps Script, ver docs/SUGERENCIAS.md)

const MAX_TEXT = 1000;

const clean = (value, max = 200) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const parseBody = (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body || '{}');
  } catch {
    return {};
  }
};

const saveToAirtable = async (row) => {
  const table = encodeURIComponent(process.env.AIRTABLE_TABLE || 'Sugerencias');
  const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${table}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ typecast: true, records: [{ fields: row }] }),
  });
  if (!response.ok) {
    throw new Error(`Airtable ${response.status}: ${await response.text()}`);
  }
};

const saveToSheets = async (row) => {
  const response = await fetch(process.env.SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(row),
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new Error(`Sheets ${response.status}: ${await response.text()}`);
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = parseBody(req);

  // Campo trampa: los bots lo completan, las personas no lo ven.
  if (clean(body.website)) {
    return res.status(200).json({ ok: true });
  }

  const comentario = clean(body.comentario, MAX_TEXT);
  if (!comentario) {
    return res.status(400).json({ ok: false, error: 'comentario_requerido' });
  }

  const puntaje = Number(body.puntaje);
  const row = {
    Fecha: new Date().toISOString(),
    Local: clean(body.local) || 'Sin local',
    Comentario: comentario,
    Puntaje: Number.isInteger(puntaje) && puntaje >= 1 && puntaje <= 5 ? puntaje : null,
    Nombre: clean(body.nombre),
    Contacto: clean(body.contacto),
    Mesa: clean(body.mesa, 50),
  };

  const useAirtable = process.env.AIRTABLE_TOKEN && process.env.AIRTABLE_BASE_ID;
  const useSheets = process.env.SHEETS_WEBHOOK_URL;
  if (!useAirtable && !useSheets) {
    return res.status(503).json({ ok: false, error: 'no_configurado' });
  }

  try {
    if (useAirtable) await saveToAirtable(row);
    else await saveToSheets(row);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error guardando sugerencia:', error);
    return res.status(502).json({ ok: false, error: 'no_se_pudo_guardar' });
  }
};
