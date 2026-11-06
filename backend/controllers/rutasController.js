/**
 * Controller de rutas: consulta rutas y las estaciones que las sirven.
 * GET /api/rutas
 * GET /api/rutas/estacion/:nombre
 */
const { getPool } = require('../db');

const pool = getPool();

async function listarRutas(req, res) {
  try {
    const r = await pool.query('SELECT * FROM rutas ORDER BY codigo');
    const rutas = r.rows.map(function (ruta) {
      return Object.assign({}, ruta, { estaciones: [] });
    });

    if (rutas.length > 0) {
      const ids = rutas.map(function (x) { return x.id; });
      const e = await pool.query(
        'SELECT re.ruta_id, re.orden, e.id AS estacion_id, e.nombre AS estacion_nombre ' +
        'FROM ruta_estaciones re JOIN estaciones e ON e.id = re.estacion_id ' +
        'WHERE re.ruta_id = ANY($1::int[]) ORDER BY re.ruta_id, re.orden',
        [ids]
      );
      e.rows.forEach(function (row) {
        const ruta = rutas.find(function (x) { return x.id === row.ruta_id; });
        if (ruta) {
          ruta.estaciones.push({ id: row.estacion_id, nombre: row.estacion_nombre });
        }
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
      const r = await pool.query(
        'SELECT r.id, r.codigo, r.nombre, r.color_hex FROM rutas r ' +
        'JOIN ruta_estaciones re ON re.ruta_id = r.id ' +
        'WHERE re.estacion_id = $1 ORDER BY re.orden',
        [estacion.id]
      );
      rutas = r.rows;
    }

    res.json({ estacion: estacion ? estacion.nombre : nombre, rutas: rutas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las rutas de la estacion.' });
  }
}

module.exports = { listarRutas, listarRutasEstacion };
