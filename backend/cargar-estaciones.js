/**
 * TransmiFlow - Cargador de estaciones desde el CSV oficial
 *
 * Uso:
 *   node cargar-estaciones.js
 *   node cargar-estaciones.js "C:/ruta/al/archivo.csv"
 *
 * - Compatible con la tabla estaciones existente (no la destruye)
 * - Idempotente: puedes ejecutarlo las veces que quieras
 */
require('dotenv').config();
const fs = require('fs');
const { crearPool } = require('./db');

// ---------------------------------------------------------------
// Configuracion
// ---------------------------------------------------------------
const CSV_POR_DEFECTO = 'C:/Users/User/Downloads/Estaciones_Troncales_de_TRANSMILENIO.csv';

const TRONCALES = {
  TZ001: ['A', 'Caracas'],
  TZ002: ['B', 'Autopista Norte'],
  TZ003: ['C', 'Suba'],
  TZ005: ['D', 'Calle 80'],
  TZ008: ['E', 'NQS Central'],
  TZ009: ['F', 'Americas'],
  TZ010: ['G', 'NQS Sur'],
  TZ012: ['H', 'Caracas Sur'],
  TZ015: ['J', 'Eje Ambiental'],
  TZ016: ['K', 'Calle 26'],
  TZ018: ['L', 'Carrera Decima'],
  TZ019: ['M', 'Carrera Septima'],
  // Tramos secundarios (el CSV no trae el nombre oficial del tramo)
  TZ007: ['G', 'NQS Sur (ramal)'],
  TZ011: ['', 'Zona Leon XIII'],
  TZ013: ['', 'Portal Usme'],
  TZ014: ['', 'Portal Tunal'],
  TZ022: ['', 'Zona Tibanica'],
};

// ---------------------------------------------------------------
// Conexion
// ---------------------------------------------------------------
const pool = crearPool();

// ---------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------
function splitCSV(linea) {
  const out = [];
  let actual = '';
  let enComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"') {
      if (enComillas && linea[i + 1] === '"') { actual += '"'; i++; }
      else enComillas = !enComillas;
    } else if (c === ',' && !enComillas) {
      out.push(actual); actual = '';
    } else {
      actual += c;
    }
  }
  out.push(actual);
  return out.map(s => s.trim());
}

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// ---------------------------------------------------------------
// Proceso principal
// ---------------------------------------------------------------
(async () => {
  const csvPath = process.argv[2] || CSV_POR_DEFECTO;

  console.log('\n  TransmiFlow - Cargador de estaciones');
  console.log('  ' + '-'.repeat(52));
  console.log('  CSV: ' + csvPath);

  if (!fs.existsSync(csvPath)) {
    console.error('\n  ERROR: no se encontro el CSV.');
    console.error('  Colocalo en: ' + CSV_POR_DEFECTO + '\n');
    process.exit(1);
  }

  // --- Leer CSV ---
  let crudo = fs.readFileSync(csvPath, 'utf8');
  // Quita el BOM UTF-8 si lo tiene (contamina el primer encabezado)
  if (crudo.charCodeAt(0) === 0xFEFF) crudo = crudo.slice(1);
  if (crudo.includes('\u00C3')) {
    crudo = Buffer.from(crudo, 'latin1').toString('utf8');
    console.log('  Encoding: corregido (UTF-8)');
  }

  const lineas = crudo.split(/\r?\n/).filter(l => l.trim());
  const encabezados = splitCSV(lineas[0]);
  const col = {};
  encabezados.forEach((h, i) => { col[normalizar(h)] = i; });

  const falta = ['nom_est', 'id_trazado', 'latitud', 'longitud'].filter(k => !(k in col));
  if (falta.length) {
    console.error('\n  ERROR: faltan columnas: ' + falta.join(', ') + '\n');
    process.exit(1);
  }

  const capA = 'cap_art' in col ? col.cap_art : -1;
  const capB = 'cap_biart' in col ? col.cap_biart : -1;

  // --- Parsear filas ---
  const filas = [];
  const vistas = new Set();

  for (let i = 1; i < lineas.length; i++) {
    const c = splitCSV(lineas[i]);
    const nombre = c[col.nom_est];
    const lat = parseFloat(c[col.latitud]);
    const lng = parseFloat(c[col.longitud]);
    const traz = c[col.id_trazado];

    if (!nombre || !isFinite(lat) || !isFinite(lng)) continue;

    const t = TRONCALES[traz] || ['', 'Sin asignar'];
    const troncal = (t[0] ? t[0] + ' - ' : '') + t[1];

    const clave = nombre + '|' + troncal;
    if (vistas.has(clave)) continue;
    vistas.add(clave);

    const capacidad = (capA >= 0 ? parseInt(c[capA]) || 0 : 0) +
                      (capB >= 0 ? parseInt(c[capB]) || 0 : 0);

    // Tu tabla exige tipo NOT NULL: los portales son un caso especial
    const tipo = /portal/i.test(nombre) ? 'portal' : 'troncal';

    filas.push({ nombre, tipo, troncal, lat, lng, capacidad });
  }

  console.log('  Filas validas: ' + filas.length);

  // --- Aglomeracion por capacidad (terciles) ---
  const caps = filas.map(f => f.capacidad).sort((a, b) => a - b);
  const p33 = caps[Math.floor(caps.length * 0.33)];
  const p67 = caps[Math.floor(caps.length * 0.67)];
  filas.forEach(f => {
    f.aglomeracion = f.capacidad >= p67 ? 'Alta'
                   : f.capacidad >= p33 ? 'Media' : 'Baja';
  });

  const conteo = { Alta: 0, Media: 0, Baja: 0 };
  filas.forEach(f => conteo[f.aglomeracion]++);
  console.log('  Aglomeracion: Alta ' + conteo.Alta +
              ' | Media ' + conteo.Media + ' | Baja ' + conteo.Baja);

  // --- Conectar ---
  console.log('\n  Conectando a PostgreSQL...');

  // --- Asegurar esquema (no destruye tablas existentes) ---
  await pool.query(
    'CREATE TABLE IF NOT EXISTS estaciones ('
    + 'id SERIAL PRIMARY KEY,'
    + 'nombre VARCHAR(120) NOT NULL,'
    + 'tipo VARCHAR(60),'
    + 'latitud NUMERIC(10,7),'
    + 'longitud NUMERIC(10,7),'
    + 'troncal VARCHAR(60),'
    + "aglomeracion VARCHAR(20) DEFAULT 'Media',"
    + 'capacidad INTEGER DEFAULT 0)'
  );

  const agregadas = [
    ['troncal', 'VARCHAR(60)'],
    ['aglomeracion', "VARCHAR(20) DEFAULT 'Media'"],
    ['capacidad', 'INTEGER DEFAULT 0'],
    ['lat', 'NUMERIC(10,7)'],
    ['lng', 'NUMERIC(10,7)'],
    ['tipo', 'VARCHAR(60)'],
    ['latitud', 'NUMERIC(10,7)'],
    ['longitud', 'NUMERIC(10,7)'],
  ];
  for (const [col2, tipo] of agregadas) {
    await pool.query('ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS ' + col2 + ' ' + tipo);
  }
  console.log('  Esquema listo.');

  // --- Tabla de reportes (la usa la API) ---
  await pool.query(
    'CREATE TABLE IF NOT EXISTS reportes ('
    + 'id SERIAL PRIMARY KEY,'
    + 'estacion VARCHAR(120) NOT NULL,'
    + 'nivel VARCHAR(20) NOT NULL,'
    + 'usuario VARCHAR(150),'
    + 'creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_reportes_estacion ON reportes(estacion)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_estaciones_nombre ON estaciones(nombre)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_estaciones_troncal ON estaciones(troncal)'
  );

  // --- Limpiar (DELETE, no TRUNCATE: hay llave foranea) ---
  await pool.query('DELETE FROM estaciones');

  // --- Insertar (una sola transaccion, todo o nada) ---
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    for (const f of filas) {
      await cliente.query(
        'INSERT INTO estaciones '
        + '(nombre, tipo, latitud, longitud, lat, lng, troncal, aglomeracion, capacidad) '
        + 'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [f.nombre, f.tipo, f.lat, f.lng, f.lat, f.lng,
         f.troncal, f.aglomeracion, f.capacidad]
      );
    }
    await cliente.query('COMMIT');
    console.log('  Insertadas ' + filas.length + ' filas.');
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }

  const total = await pool.query('SELECT COUNT(*) FROM estaciones');
  console.log('\n  INSERTadas: ' + total.rows[0].count + ' estaciones\n');

  const porTroncal = await pool.query(
    'SELECT troncal, COUNT(*) AS n FROM estaciones GROUP BY troncal ORDER BY troncal');
  console.log('  Distribucion por troncal:');
  porTroncal.rows.forEach(r => {
    console.log('    ' + r.troncal.padEnd(24) + r.n);
  });

  const top = await pool.query(
    'SELECT nombre, troncal, aglomeracion, capacidad FROM estaciones '
    + 'ORDER BY capacidad DESC LIMIT 5');
  console.log('\n  Mayor demanda:');
  top.rows.forEach(r => {
    console.log('    ' + r.nombre + ' (' + r.troncal + ') - ' + r.aglomeracion +
                ' - ' + r.capacidad);
  });

  console.log('\n  Listo. Reinicia el servidor con: npm start\n');

  await pool.end();
  process.exit(0);
})().catch(async (err) => {
  console.error('\n  ERROR: ' + err.message + '\n');
  try { await pool.end(); } catch (e) {}
  process.exit(1);
});
