/**
 * Controller de reportes: crea y lista los reportes de ocupacion.
 * POST /api/reportes
 * GET  /api/reportes
 */
const { getPool } = require('../db');

const pool = getPool();

async function crearReporte(req, res) {
  const { estacion, nivel, usuario } = req.body;

  if (!estacion || !nivel) {
    return res.status(400).json({ error: 'Faltan datos del reporte.' });
  }

  try {
    const resultado = await pool.query(
      'INSERT INTO reportes (estacion, nivel, usuario) VALUES ($1, $2, $3) RETURNING id',
      [estacion, nivel, usuario || 'anonimo']
    );

    const nuevo = await pool.query(
      'SELECT id, estacion, nivel, usuario, creado_en FROM reportes WHERE id = $1',
      [resultado.rows[0].id]
    );

    res.status(201).json({ mensaje: 'Reporte recibido', reporte: nuevo.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo guardar el reporte.' });
  }
}

async function listarReportes(req, res) {
  try {
    const limite = Math.min(parseInt(req.query.limite, 10) || 25, 100);

    const r = await pool.query(
      `SELECT id, estacion, nivel, usuario, creado_en
         FROM reportes
        ORDER BY creado_en DESC, id DESC
        LIMIT $1`,
      [limite]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar los reportes.' });
  }
}

module.exports = { crearReporte, listarReportes };
