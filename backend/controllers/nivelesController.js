/**
 * Controller de niveles: reporte mas reciente por estacion.
 * GET /api/niveles
 */
const { getPool } = require('../db');

const pool = getPool();

async function obtenerNiveles(req, res) {
  try {
    const horas = Math.min(parseInt(req.query.horas, 10) || 24, 24 * 30);

    const r = await pool.query(
      `SELECT DISTINCT ON (estacion)
              estacion, nivel, usuario, creado_en
         FROM reportes
        WHERE creado_en > NOW() - ($1 || ' hours')::interval
        ORDER BY estacion, creado_en DESC, id DESC`,
      [horas]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar los niveles.' });
  }
}

module.exports = { obtenerNiveles };
