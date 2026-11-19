/**
 * Controller de reportes: crea y lista los reportes de ocupacion.
 * Cada reporte indica estacion, RUTA y nivel de aglomeracion.
 * POST /api/reportes
 * GET  /api/reportes
 * GET  /api/reportes/rutas   -> rutas reportadas por estacion (panel operativo)
 */
const { getPool } = require('../db');

const pool = getPool();

function texto(valor, max) {
  return String(valor == null ? '' : valor).trim().slice(0, max);
}

async function crearReporte(req, res) {
  const estacion = texto(req.body.estacion, 120);
  const ruta = texto(req.body.ruta, 20);
  const nivel = ['Baja', 'Media', 'Alta'].indexOf(req.body.nivel) !== -1 ? req.body.nivel : '';
  const usuario = req.usuario ? req.usuario.email : 'anonimo';

  if (!estacion || !ruta || !nivel) {
    return res.status(400).json({ error: 'Indica la estacion, la ruta y el nivel de ocupacion.' });
  }

  try {
    const resultado = await pool.query(
      'INSERT INTO reportes (estacion, ruta, nivel, usuario) VALUES ($1, $2, $3, $4) RETURNING id',
      [estacion, ruta, nivel, usuario]
    );

    const nuevo = await pool.query(
      'SELECT id, estacion, ruta, nivel, usuario, creado_en FROM reportes WHERE id = $1',
      [resultado.rows[0].id]
    );

    res.status(201).json({ mensaje: 'Reporte recibido', reporte: nuevo.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo guardar el reporte.' });
  }
}

/** Lista reportes con su ruta y si ya fueron atendidos (notificacion generada por despacho) */
async function listarReportes(req, res) {
  try {
    const limite = Math.min(parseInt(req.query.limite, 10) || 25, 100);

    const r = await pool.query(
      `SELECT r.id, r.estacion, COALESCE(r.ruta, '') AS ruta, r.nivel, r.usuario, r.creado_en,
              EXISTS (
                SELECT 1 FROM notificaciones n
                WHERE n.usuario = r.usuario
                  AND n.mensaje LIKE '%' || r.estacion || '%'
                  AND n.creado_en >= r.creado_en
              ) AS atendido
         FROM reportes r
        ORDER BY r.creado_en DESC, r.id DESC
        LIMIT $1`,
      [limite]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar los reportes.' });
  }
}

/** Reportes agrupados por estacion y ruta: que ruta hay que liberar y su estado */
async function rutasReportadas(req, res) {
  try {
    const r = await pool.query(
      `SELECT r.estacion, COALESCE(r.ruta, 'SIN RUTA') AS ruta,
              r.nivel, r.usuario, r.creado_en,
              EXISTS (
                SELECT 1 FROM notificaciones n
                WHERE n.usuario = r.usuario
                  AND n.mensaje LIKE '%' || r.estacion || '%'
                  AND n.creado_en >= r.creado_en
              ) AS atendido
         FROM reportes r
        ORDER BY r.creado_en DESC
        LIMIT 100`
    );

    // Agrupar por estacion + ruta, quedandonos con el reporte mas reciente
    const grupos = {};
    r.rows.forEach(function (x) {
      const k = x.estacion + '|' + x.ruta;
      if (!grupos[k]) {
        grupos[k] = {
          estacion: x.estacion, ruta: x.ruta, nivel: x.nivel,
          atendido: x.atendido, creado_en: x.creado_en, usuarios: [], total: 0
        };
      }
      grupos[k].total++;
      if (grupos[k].usuarios.indexOf(x.usuario) === -1) {
        grupos[k].usuarios.push(x.usuario);
      }
    });

    const lista = Object.keys(grupos).map(function (k) { return grupos[k]; });
    res.json({ rutas: lista });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las rutas reportadas.' });
  }
}

module.exports = { crearReporte, listarReportes, rutasReportadas };
