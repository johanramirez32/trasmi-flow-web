/**
 * Controller de health: permite al servidor reportar su estado.
 * GET /api/health
 */
const { getPool } = require('../db');

const pool = getPool();

async function health(req, res) {
  try {
    const r = await pool.query('SELECT COUNT(*) AS n FROM estaciones');
    res.json({
      status: 'ok',
      baseDeDatos: 'conectada',
      estaciones: parseInt(r.rows[0].n, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      baseDeDatos: 'sin conexion',
      mensaje: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = { health };
