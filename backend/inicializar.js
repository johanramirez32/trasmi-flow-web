/**
 * TransmiFlow - Prepara la base de datos automaticamente.
 *
 * Se ejecuta al arrancar el servidor. Es idempotente: se puede
 * ejecutar las veces que quieras sin romper nada.
 *
 * Hace tres cosas:
 *   1. Crea las tablas que faltan (no toca las que ya existen)
 *   2. Crea los indices
 *   3. Si la tabla de estaciones esta vacia, carga las 153 del JSON
 *
 * Asi el proyecto funciona igual en tu PC (con pgAdmin) y en la nube,
 * donde no hay pgAdmin.
 */
const fs = require('fs');
const path = require('path');

const ARCHIVO_ESTACIONES = path.join(__dirname, 'datos', 'estaciones.json');

// ---------------------------------------------------------------
// Esquema
// ---------------------------------------------------------------
const ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS usuarios (
     id         SERIAL PRIMARY KEY,
     nombre     VARCHAR(100) NOT NULL,
     email      VARCHAR(150) UNIQUE NOT NULL,
     password   VARCHAR(255) NOT NULL,
     creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,

  // tipo / latitud / longitud se conservan por compatibilidad
  // con el esquema previo del proyecto
  `CREATE TABLE IF NOT EXISTS estaciones (
     id           SERIAL PRIMARY KEY,
     nombre       VARCHAR(120) NOT NULL,
     tipo         VARCHAR(60)  NOT NULL,
     latitud      NUMERIC(10,7) NOT NULL,
     longitud     NUMERIC(10,7) NOT NULL,
     troncal      VARCHAR(60),
     aglomeracion VARCHAR(20) DEFAULT 'Media',
     capacidad    INTEGER     DEFAULT 0,
     lat          NUMERIC(10,7),
     lng          NUMERIC(10,7)
   )`,

  `CREATE TABLE IF NOT EXISTS reportes (
     id         SERIAL PRIMARY KEY,
     estacion   VARCHAR(120) NOT NULL,
     nivel      VARCHAR(20)  NOT NULL,
     usuario    VARCHAR(150),
     creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,

  // Columnas extra por si la tabla ya existia con otra forma
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS tipo         VARCHAR(60)`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS latitud      NUMERIC(10,7)`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS longitud     NUMERIC(10,7)`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS troncal      VARCHAR(60)`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS aglomeracion VARCHAR(20) DEFAULT 'Media'`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS capacidad    INTEGER DEFAULT 0`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS lat          NUMERIC(10,7)`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS lng          NUMERIC(10,7)`,

  // Indices
  `CREATE INDEX IF NOT EXISTS idx_usuarios_email       ON usuarios(email)`,
  `CREATE INDEX IF NOT EXISTS idx_estaciones_nombre     ON estaciones(nombre)`,
  `CREATE INDEX IF NOT EXISTS idx_estaciones_troncal    ON estaciones(troncal)`,
  `CREATE INDEX IF NOT EXISTS idx_reportes_estacion    ON reportes(estacion)`,
];

// ---------------------------------------------------------------
// Siembra
// ---------------------------------------------------------------
async function sembrarSiEstaVacia(pool) {
  const actual = await pool.query('SELECT COUNT(*) AS n FROM estaciones');
  if (parseInt(actual.rows[0].n, 10) > 0) {
    console.log('   Estaciones ya cargadas: ' + actual.rows[0].n);
    return;
  }

  if (!fs.existsSync(ARCHIVO_ESTACIONES)) {
    console.warn('   No se encontro datos/estaciones.json: la tabla queda vacia.');
    return;
  }

  const datos = JSON.parse(fs.readFileSync(ARCHIVO_ESTACIONES, 'utf8'));
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');
    for (const e of datos) {
      await cliente.query(
        `INSERT INTO estaciones
           (nombre, tipo, latitud, longitud, lat, lng, troncal, aglomeracion, capacidad)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [e.nombre, e.tipo || 'troncal', e.lat, e.lng, e.lat, e.lng,
         e.troncal, e.aglomeracion, e.capacidad || 0]
      );
    }
    await cliente.query('COMMIT');
    console.log('   Cargadas ' + datos.length + ' estaciones desde datos/estaciones.json');
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
}

// ---------------------------------------------------------------
// Proceso completo
// ---------------------------------------------------------------
async function inicializar(pool, intentos = 5) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await pool.query('SELECT 1');
      break;
    } catch (err) {
      if (i === intentos) throw err;
      const espera = i * 2000;
      console.log('   Base de datos no disponible, reintento en ' + espera / 1000 + 's...');
      await new Promise(r => setTimeout(r, espera));
    }
  }

  for (const sql of ESQUEMA) {
    await pool.query(sql);
  }
  await sembrarSiEstaVacia(pool);
}

module.exports = { inicializar };
