/** Controller de estaciones: compatible con BD actualizada o anterior */
const { getPool } = require('../db');

const pool = getPool();

async function columnas() {
  const r = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='estaciones'");
  return r.rows.map(function (x) { return x.column_name; });
}

async function listarEstaciones(req, res) {
  try {
    const cols = await columnas();
    const extras = (cols.indexOf('portal') !== -1 ? ', portal' : '') +
                   (cols.indexOf('direccion') !== -1 ? ', direccion' : '');
    const base = 'SELECT id, nombre, troncal, lat, lng, aglomeracion' + extras + ' FROM estaciones';
    const buscar = (req.query.buscar || '').toString().trim();

    const sql = buscar
      ? base + ' WHERE nombre ILIKE $1 OR troncal ILIKE $1 ORDER BY nombre'
      : base + ' ORDER BY nombre';

    const r = await pool.query(sql, buscar ? ['%' + buscar + '%'] : []);
    res.json(r.rows);
  } catch (err) {
    console.error('ERROR_ESTACIONES: ' + err.message);
    // Ultimo recurso: columnas basicas que siempre existen
    try {
      const r = await pool.query('SELECT id, nombre, troncal, lat, lng, aglomeracion FROM estaciones ORDER BY nombre');
      res.json(r.rows);
    } catch (e2) {
      res.status(500).json({ error: 'No se pudieron cargar las estaciones: ' + e2.message });
    }
  }
}

module.exports = { listarEstaciones };
