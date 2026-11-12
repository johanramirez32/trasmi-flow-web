/**
 * Controller de rutas: consulta rutas y sus estaciones (inicio, fin, paradas).
 * GET /api/rutas
 * GET /api/rutas/estacion/:nombre
 */
const { getPool } = require('../db');

const pool = getPool();

async function listarRutas(req, res) {
  try {
    const r = await pool.query('SELECT * FROM rutas ORDER BY codigo');
    const rutas = [];

    for (const ruta of r.rows) {
      const est = await pool.query(
        'SELECT re.orden, e.id AS estacion_id, e.nombre AS estacion_nombre, e.lat AS estacion_lat, e.lng AS estacion_lng ' +
        'FROM ruta_estaciones re JOIN estaciones e ON e.id = re.estacion_id ' +
        'WHERE re.ruta_id = $1 ORDER BY re.orden',
        [ruta.id]
      );
      rutas.push({
        id: ruta.id,
        codigo: ruta.codigo,
        nombre: ruta.nombre,
        color_hex: ruta.color_hex,
        estaciones: est.rows.map(function (x) {
          return {
            id: x.estacion_id,
            nombre: x.estacion_nombre,
            lat: x.estacion_lat != null ? parseFloat(x.estacion_lat) : null,
            lng: x.estacion_lng != null ? parseFloat(x.estacion_lng) : null,
            orden: x.orden
          };
        })
      });
    }

    res.json({ rutas: rutas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las rutas.' });
  }
}

async function listarRutasEstacion(req, res) {
  const nombre = req.params.nombre;

  try {
    const est = await pool.query('SELECT * FROM estaciones WHERE LOWER(nombre) = LOWER($1) LIMIT 1', [nombre]);
    const estacion = est.rows[0];
    let rutas = [];

    if (estacion) {
      const rr = await pool.query(
        'SELECT r.id, r.codigo, r.nombre, r.color_hex FROM rutas r ' +
        'JOIN ruta_estaciones re ON re.ruta_id = r.id ' +
        'WHERE re.estacion_id = $1 ORDER BY r.codigo',
        [estacion.id]
      );

      for (const ruta of rr.rows) {
        const est2 = await pool.query(
          'SELECT re.orden, e.id AS estacion_id, e.nombre AS estacion_nombre, e.lat AS estacion_lat, e.lng AS estacion_lng ' +
          'FROM ruta_estaciones re JOIN estaciones e ON e.id = re.estacion_id ' +
          'WHERE re.ruta_id = $1 ORDER BY re.orden',
          [ruta.id]
        );
        rutas.push({
          id: ruta.id,
          codigo: ruta.codigo,
          nombre: ruta.nombre,
          color_hex: ruta.color_hex,
          estaciones: est2.rows.map(function (x) {
            return {
              id: x.estacion_id,
              nombre: x.estacion_nombre,
              lat: x.estacion_lat != null ? parseFloat(x.estacion_lat) : null,
              lng: x.estacion_lng != null ? parseFloat(x.estacion_lng) : null,
              orden: x.orden
            };
          })
        });
      }
    }

    res.json({ estacion: estacion ? estacion.nombre : nombre, rutas: rutas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las rutas de la estacion.' });
  }
}

module.exports = { listarRutas, listarRutasEstacion };