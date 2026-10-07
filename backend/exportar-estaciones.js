/**
 * TransmiFlow - Exporta las estaciones de PostgreSQL a JSON.
 *
 * El JSON queda dentro del proyecto para que el servidor en la nube
 * pueda sembrar la base de datos sin depender del archivo CSV.
 *
 *   node exportar-estaciones.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { crearPool } = require('./db');

const pool = crearPool();

const SALIDA = path.join(__dirname, 'datos', 'estaciones.json');

(async () => {
  const r = await pool.query(
    'SELECT nombre, troncal, tipo, lat, lng, aglomeracion, capacidad ' +
    'FROM estaciones ORDER BY nombre'
  );

  const datos = r.rows.map(e => ({
    nombre: e.nombre,
    troncal: e.troncal,
    tipo: e.tipo,
    lat: Number(e.lat),
    lng: Number(e.lng),
    aglomeracion: e.aglomeracion,
    capacidad: e.capacidad,
  }));

  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, JSON.stringify(datos, null, 2), 'utf8');

  console.log('Exportadas ' + datos.length + ' estaciones a:');
  console.log('  ' + SALIDA);
  console.log('  ' + (fs.statSync(SALIDA).size / 1024).toFixed(1) + ' KB');

  await pool.end();
})().catch(async (e) => {
  console.error('ERROR: ' + e.message);
  try { await pool.end(); } catch (x) {}
  process.exit(1);
});
