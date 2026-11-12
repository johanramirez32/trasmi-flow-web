/**
 * Controller de notificaciones: reportes atendidos por el operario.
 * GET /api/notificaciones?usuario=email
 * POST /api/notificaciones/leer?usuario=email
 */
const { getPool } = require('../db');

const pool = getPool();

async function listarNotificaciones(req, res) {
  const usuario = req.query.usuario;

  try {
    const r = await pool.query(
      'SELECT * FROM notificaciones WHERE usuario = $1 ORDER BY creado_en DESC LIMIT 50',
      [usuario || '']
    );
    res.json({ notificaciones: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las notificaciones.' });
  }
}

async function marcarLeidas(req, res) {
  const usuario = req.query.usuario;

  try {
    const r = await pool.query(
      'UPDATE notificaciones SET leido = TRUE WHERE usuario = $1 AND leido = FALSE RETURNING id',
      [usuario || '']
    );
    res.json({ actualizadas: r.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo actualizar las notificaciones.' });
  }
}

module.exports = { listarNotificaciones, marcarLeidas };
