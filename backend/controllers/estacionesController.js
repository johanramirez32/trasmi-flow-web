/**
 * Controller de estaciones: consulta el catalogo oficial.
 * GET /api/estaciones
 * GET /api/estaciones?buscar=nombre
 */
const { getPool } = require('../db');

const pool = getPool();

async function listarEstaciones(req, res) {
  try {
    const buscar = (req.query.buscar || '').toString().trim();

    if (buscar) {
      const r = await pool.query(
        `SELECT id, nombre, troncal, lat, lng, aglomeracion
           FROM estaciones
          WHERE nombre ILIKE $1 OR troncal ILIKE $1
          ORDER BY nombre`,
        [`%${buscar}%`]
      );
      return res.json(r.rows);
    }

    const r = await pool.query(
      `SELECT id, nombre, troncal, lat, lng, aglomeracion
         FROM estaciones
        ORDER BY nombre`
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las estaciones.' });
  }
}

module.exports = { listarEstaciones };
