/**
 * Controller de despachos: registro de buses despachados por el operario.
 * POST /api/despacho
 * GET  /api/despachos
 */
const { getPool } = require('../db');

const pool = getPool();

async function notificarReportesAtendidos(pool, estacion, bus) {
  const r = await pool.query(
    `SELECT DISTINCT usuario FROM reportes WHERE LOWER(estacion) = LOWER($1) AND creado_en > NOW() - INTERVAL '24 hours'`,
    [estacion]
  );

  for (const row of r.rows) {
    if (!row.usuario) continue;
    await pool.query(
      'INSERT INTO notificaciones (usuario, mensaje, tipo) VALUES ($1, $2, $3)',
      [row.usuario, 'Tu reporte en ' + estacion + ' fue atendido por el operario (bus ' + bus + ').', 'operador']
    );
  }
}

async function registrarDespacho(req, res) {
  const estacion = String(req.body.estacion || '').trim().slice(0, 120);
  const bus = String(req.body.bus || '').trim().slice(0, 20);
  // El operador se toma del token: no se puede suplantar
  const operador = req.usuario ? req.usuario.email : '';

  if (!estacion || !bus) {
    return res.status(400).json({ error: 'Estacion y bus son obligatorios.' });
  }

  try {
    const r = await pool.query(
      'INSERT INTO despachos (estacion, bus, operador) VALUES ($1, $2, $3) RETURNING *',
      [estacion, bus, operador]
    );

    // Al despachar un bus, notificamos a los usuarios que reportaron esa estacion
    await notificarReportesAtendidos(pool, estacion, bus);

    res.status(201).json({ mensaje: 'Despacho de bus registrado con exito', despacho: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor al registrar el despacho.' });
  }
}

async function listarDespachos(req, res) {
  try {
    const r = await pool.query('SELECT * FROM despachos ORDER BY creado_en DESC LIMIT 50');
    res.json({ despachos: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar los despachos.' });
  }
}

module.exports = { registrarDespacho, listarDespachos };
