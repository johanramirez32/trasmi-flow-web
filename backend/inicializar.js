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
 *      Si las tablas de rutas / camaras estan vacias, cargan sus datos
 */
const fs = require('fs');
const path = require('path');

const ARCHIVO_ESTACIONES = path.join(__dirname, 'datos', 'estaciones.json');
const ARCHIVO_RUTAS = path.join(__dirname, 'datos', 'rutas.json');
const ARCHIVO_CAMARAS = path.join(__dirname, 'datos', 'camaras.json');

// ---------------------------------------------------------------
// Esquema
// ---------------------------------------------------------------
const ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS usuarios (
     id         SERIAL PRIMARY KEY,
     nombre     VARCHAR(100) NOT NULL,
     email      VARCHAR(150) UNIQUE NOT NULL,
     password   VARCHAR(255) NOT NULL,
     rol        VARCHAR(20) DEFAULT 'usuario',
     codigo_operador VARCHAR(20),
     creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,

  `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'usuario'`,
  `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_operador VARCHAR(20)`,

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

  // Modulo Operario: despachos de buses
  `CREATE TABLE IF NOT EXISTS despachos (
     id         SERIAL PRIMARY KEY,
     estacion  VARCHAR(120) NOT NULL,
     bus        VARCHAR(20) NOT NULL,
     operador  VARCHAR(150) NOT NULL,
     creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE INDEX IF NOT EXISTS idx_despachos_estacion ON despachos(estacion)`,

  // Modulo Operario: rutas del sistema (linea + estaciones que la sirven)
  `CREATE TABLE IF NOT EXISTS rutas (
     id         SERIAL PRIMARY KEY,
     codigo     VARCHAR(20) NOT NULL,
     nombre     VARCHAR(160) NOT NULL,
     color_hex  VARCHAR(10)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_rutas_codigo ON rutas(codigo)`,
  `CREATE TABLE IF NOT EXISTS ruta_estaciones (
     id         SERIAL PRIMARY KEY,
     ruta_id    INTEGER NOT NULL,
     estacion_id INTEGER NOT NULL,
     orden      INTEGER DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS idx_ruta_estaciones_ruta ON ruta_estaciones(ruta_id)`,
  `CREATE INDEX IF NOT EXISTS idx_ruta_estaciones_estacion ON ruta_estaciones(estacion_id)`,

  // Modulo Operario: camaras de seguridad
  `CREATE TABLE IF NOT EXISTS camaras (
     id         SERIAL PRIMARY KEY,
     estacion  VARCHAR(120) NOT NULL,
     nombre    VARCHAR(160) NOT NULL,
     latitud   NUMERIC(10,7),
     longitud NUMERIC(10,7),
     creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE INDEX IF NOT EXISTS idx_camaras_estacion ON camaras(estacion)`,

  // Notificaciones: operario atendio un reporte
  `CREATE TABLE IF NOT EXISTS notificaciones (
     id         SERIAL PRIMARY KEY,
     usuario   VARCHAR(150) NOT NULL,
     mensaje   VARCHAR(255) NOT NULL,
     tipo       VARCHAR(30) DEFAULT 'operador',
     creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario)`,

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

async function sembrarRutas(pool) {
  const actual = await pool.query('SELECT COUNT(*) AS n FROM rutas');
  if (parseInt(actual.rows[0].n, 10) > 0) {
    console.log('   Rutas ya cargadas: ' + actual.rows[0].n);
    return;
  }

  if (!fs.existsSync(ARCHIVO_RUTAS)) {
    console.warn('   No se encontro datos/rutas.json: la tabla rutas queda vacia.');
    return;
  }

  const datos = JSON.parse(fs.readFileSync(ARCHIVO_RUTAS, 'utf8'));
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');
    for (const r of datos) {
      const ex = await cliente.query('SELECT id FROM rutas WHERE codigo = $1', [r.codigo]);
      if (ex.rows.length > 0) continue;
      await cliente.query(
        'INSERT INTO rutas (codigo, nombre, color_hex) VALUES ($1, $2, $3)',
        [r.codigo, r.nombre, r.color_hex || '#3b82f6']
      );
    }
    await cliente.query('COMMIT');
    console.log('   Cargadas ' + datos.length + ' rutas desde datos/rutas.json');
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
}

async function sembrarCamaras(pool) {
  const actual = await pool.query('SELECT COUNT(*) AS n FROM camaras');
  if (parseInt(actual.rows[0].n, 10) > 0) {
    console.log('   Camaras ya cargadas: ' + actual.rows[0].n);
    return;
  }

  if (!fs.existsSync(ARCHIVO_CAMARAS)) {
    console.warn('   No se encontro datos/camaras.json: la tabla camaras queda vacia.');
    return;
  }

  const datos = JSON.parse(fs.readFileSync(ARCHIVO_CAMARAS, 'utf8'));
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');
    for (const c of datos) {
      await cliente.query(
        'INSERT INTO camaras (estacion, nombre) VALUES ($1, $2)',
        [c.estacion, c.nombre]
      );
    }
    await cliente.query('COMMIT');
    console.log('   Cargadas ' + datos.length + ' camaras desde datos/camaras.json');
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
      console.log('   No se pudo conectar (' + err.message + ')');
      console.log('   Reintento ' + i + ' de ' + intentos + ' en ' + espera / 1000 + 's...');
      await new Promise(r => setTimeout(r, espera));
    }
  }

  for (const sql of ESQUEMA) {
    await pool.query(sql);
  }
  await sembrarSiEstaVacia(pool);
  await sembrarRutas(pool);
  await sembrarCamaras(pool);
}

module.exports = { inicializar };
