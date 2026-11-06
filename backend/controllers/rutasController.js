/**
 * Controller de rutas: consulta rutas por troncal o por estacion.
 * GET /api/rutas
 * GET /api/rutas/estacion/:nombre
 */
const { getPool } = require('../db');

const pool = getPool();

async function listarRutas(req, res) {
  try {
    const r = await pool.query('SELECT * FROM rutas ORDER BY troncal, numero');
    res.json({ rutas: r.rows });
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
    const troncal = estacion ? estacion.troncal : null;

    let rutas = [];
    if (troncal) {
      const r = await pool.query('SELECT * FROM rutas WHERE LOWER(troncal) = LOWER($1) ORDER BY numero', [troncal]);
      rutas = r.rows;
    }

    res.json({
      estacion: estacion ? estacion.nombre : nombre,
      troncal: troncal || 'Sin asignar',
      rutas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las rutas de la estacion.' });
  }
}

module.exports = { listarRutas, listarRutasEstacion };
