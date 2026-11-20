/**
 * Controller de despachos: registro de buses despachados por el operario.
 * Relaciones: estacion_id, ruta_id, bus_id, conductor_id, operador_id.
 * POST /api/despacho
 * GET  /api/despachos
 * GET  /api/despachos/estadisticas
 */
const { getPool } = require('../db');

const pool = getPool();

async function notificarReportesAtendidos(pool, estacion, ruta, bus) {
  const r = await pool.query(
    `SELECT id, usuario, usuario_id FROM reportes
      WHERE LOWER(estacion) = LOWER($1) AND creado_en > NOW() - INTERVAL '24 hours'`,
    [estacion]
  );

  for (const row of r.rows) {
    if (!row.usuario) { continue; }
    await pool.query(
      'INSERT INTO notificaciones (usuario, usuario_id, mensaje, tipo, reporte_id) VALUES ($1,$2,$3,$4,$5)',
      [row.usuario, row.usuario_id, 'Tu reporte en ' + estacion + (ruta ? ' (ruta ' + ruta + ')' : '') +
        ' fue atendido. Bus ' + bus + ' en camino.', 'operador', row.id]
    );
  }
}

async function registrarDespacho(req, res) {
  const estacion = String(req.body.estacion || '').trim().slice(0, 120);
  const ruta = String(req.body.ruta || '').trim().slice(0, 20);
  const bus = String(req.body.bus || '').trim().slice(0, 20);
  const tipo = req.body.tipo_bus === 'Biarticulado' ? 'Biarticulado' : 'Bus normal';
  const conductor = String(req.body.conductor || '').trim().slice(0, 30);
  const operador = req.usuario ? req.usuario.email : '';

  if (!estacion || !ruta || !bus) {
    return res.status(400).json({ error: 'Estacion, ruta y numero de placa son obligatorios.' });
  }

  try {
    const est = await pool.query('SELECT id FROM estaciones WHERE LOWER(nombre)=LOWER($1) LIMIT 1', [estacion]);
    const rut = await pool.query('SELECT id FROM rutas WHERE codigo=$1 LIMIT 1', [ruta]);
    const busRow = await pool.query('SELECT id FROM buses WHERE placa=$1 LIMIT 1', [bus]);
    const cond = await pool.query('SELECT id FROM conductores WHERE cedula=$1 LIMIT 1', [conductor]);
    const op = await pool.query('SELECT id FROM usuarios WHERE LOWER(email)=LOWER($1) LIMIT 1', [operador]);

    const r = await pool.query(
      'INSERT INTO despachos (estacion, estacion_id, ruta, ruta_id, bus, bus_id, conductor, conductor_id, ' +
      'tipo_bus, operador, operador_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [estacion, est.rows[0] ? est.rows[0].id : null,
       ruta, rut.rows[0] ? rut.rows[0].id : null,
       bus, busRow.rows[0] ? busRow.rows[0].id : null,
       conductor, cond.rows[0] ? cond.rows[0].id : null,
       tipo, operador, op.rows[0] ? op.rows[0].id : null]
    );

    await notificarReportesAtendidos(pool, estacion, ruta, bus);

    res.status(201).json({ mensaje: 'Despacho registrado con exito', despacho: r.rows[0] });
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

/** Frecuencia de buses por estacion y ruta */
async function estadisticas(req, res) {
  try {
    const r = await pool.query(`
      WITH intervalos AS (
        SELECT estacion, ruta,
               EXTRACT(EPOCH FROM (
                 creado_en - LAG(creado_en) OVER (PARTITION BY estacion, ruta ORDER BY creado_en)
               )) / 60 AS minutos
          FROM despachos
         WHERE ruta IS NOT NULL AND ruta <> ''
      )
      SELECT d.estacion, d.ruta,
             COUNT(DISTINCT d.id)::int AS total,
             MAX(d.creado_en) AS ultimo_despacho,
             ROUND(EXTRACT(EPOCH FROM (NOW() - MAX(d.creado_en))) / 60)::int AS minutos_sin_bus,
             ROUND(AVG(i.minutos))::int AS intervalo_promedio_min
        FROM despachos d
        LEFT JOIN intervalos i ON i.estacion = d.estacion AND i.ruta = d.ruta AND i.minutos IS NOT NULL
       WHERE d.ruta IS NOT NULL AND d.ruta <> ''
       GROUP BY d.estacion, d.ruta
       ORDER BY d.estacion, d.ruta
    `);
    res.json({ estadisticas: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo calcular las estadisticas.' });
  }
}

module.exports = { registrarDespacho, listarDespachos, estadisticas };
