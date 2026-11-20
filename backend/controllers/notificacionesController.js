/**
 * Controller de notificaciones.
 * Relacion: usuario_id -> usuarios (compatible con el texto de datos antiguos).
 */
const { getPool } = require('../db');

const pool = getPool();

async function listarNotificaciones(req, res) {
  const email = req.usuario ? req.usuario.email : '';
  try {
    const r = await pool.query(
      `SELECT id, usuario, mensaje, tipo, leido, creado_en, reporte_id
         FROM notificaciones
        WHERE usuario_id = (SELECT id FROM usuarios WHERE LOWER(email)=LOWER($1) LIMIT 1)
           OR (usuario_id IS NULL AND LOWER(usuario)=LOWER($1))
        ORDER BY creado_en DESC LIMIT 50`,
      [email]
    );
    res.json({ notificaciones: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las notificaciones.' });
  }
}

async function marcarLeidas(req, res) {
  const email = req.usuario ? req.usuario.email : '';
  try {
    const r = await pool.query(
      `UPDATE notificaciones SET leido = TRUE
        WHERE leido = FALSE
          AND (usuario_id = (SELECT id FROM usuarios WHERE LOWER(email)=LOWER($1) LIMIT 1)
            OR (usuario_id IS NULL AND LOWER(usuario)=LOWER($1)))
        RETURNING id`,
      [email]
    );
    res.json({ actualizadas: r.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron marcar las notificaciones.' });
  }
}

module.exports = { listarNotificaciones, marcarLeidas };
