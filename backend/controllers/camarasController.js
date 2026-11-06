/**
 * Controller de camaras: consulta camaras de seguridad por estacion.
 * GET /api/camaras
 * GET /api/camaras/estacion/:nombre
 */
const { getPool } = require('../db');

const pool = getPool();

async function listarCamaras(req, res) {
  try {
    const r = await pool.query('SELECT * FROM camaras ORDER BY estacion');
    res.json({ camaras: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las camaras.' });
  }
}

async function listarCamarasEstacion(req, res) {
  const nombre = req.params.nombre;

  try {
    const r = await pool.query(
      'SELECT * FROM camaras WHERE LOWER(estacion) = LOWER($1) ORDER BY nombre',
      [nombre]
    );
    res.json({ estacion: nombre, camaras: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las camaras de la estacion.' });
  }
}

module.exports = { listarCamaras, listarCamarasEstacion };
