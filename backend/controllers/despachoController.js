/**
 * Controller de despachos: registro de buses despachados por el operario.
 * POST /api/despacho
 * GET  /api/despachos
 * GET  /api/despachos/estadisticas -> frecuencia por estacion/ruta
 */
const { getPool } = require('../db');

const pool = getPool();

async function notificarReportesAtendidos(pool, estacion, ruta, bus) {
  const r = await pool.query(
    `SELECT DISTINCT usuario FROM reportes
      WHERE LOWER(estacion) = LOWER($1) AND creado_en > NOW() - INTERVAL '24 hours'`
    , [estacion]
  );

  for (const row of r.rows) {
    if (!row.usuario) { continue; }
    await pool.query(
      'INSERT INTO notificaciones (usuario, mensaje, tipo) VALUES ($1, $2, $3)',
      [row.usuario, 'Tu reporte en ' + estacion + (ruta ? ' (ruta ' + ruta + ')' : '') +
        ' fue atendido. Bus ' + bus + ' en camino.', 'operador']
    );
  }
}

async function registrarDespacho(req, res) {
  const estacion = String(req.body.estacion || '').trim().slice(0, 120);
  const ruta = String(req.body.ruta || '').trim().slice(0, 20);
  const bus = String(req.body.bus || '').trim().slice(0, 20);
  const tipo = req.body.tipo_bus === 'Biarticulado' ? 'Biarticulado' : 'Bus normal';
  const operador = req.usuario ? req.usuario.email : '';

  if (!estacion || !ruta || !bus) {
    return res.status(400).json({ error: 'Estacion, ruta y numero de placa son obligatorios.' });
  }

  try {
    const r = await pool.query(
      'INSERT INTO despachos (estacion, ruta, bus, tipo_bus, operador) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [estacion, ruta, bus, tipo, operador]
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

/** Frecuencia de buses por estacion y ruta: ultimo bus e intervalo promedio */
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
    res.status(500).json({ error: 'No se pudieron calcular las estadisticas.' });
  }
}

module.exports = { registrarDespacho, listarDespachos, estadisticas };
