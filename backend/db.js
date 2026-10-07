/**
 * TransmiFlow - Configuracion de la base de datos
 *
 * Funciona en los dos entornos sin cambiar el codigo:
 *
 *   LOCAL (tu PC)  -> variables DB_USER, DB_HOST, ...
 *   NUBE  (Neon)   -> una sola variable DATABASE_URL
 */
require('dotenv').config();
const { Pool } = require('pg');

/**
 * Neon (y otros proveedores) agregan parametros que node-postgres
 * no entiende. Este es un problema muy comun al desplegar.
 */
function limpiarUrl(url) {
  const u = new URL(url);
  // node-postgres no implementa channel_binding
  u.searchParams.delete('channel_binding');
  return u.toString();
}

function configuracion() {
  // --- Nube: el proveedor entrega una URL completa ---
  if (process.env.DATABASE_URL) {
    const url = limpiarUrl(process.env.DATABASE_URL);

    // Neon y Render exigen cifrado en transito
    const ssl = /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false };

    return { connectionString: url, ssl };
  }

  // --- Local: tu PostgreSQL de siempre ---
  return {
    user:     process.env.DB_USER || 'postgres',
    host:     process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'transmiflow_db',
    password: process.env.DB_PASSWORD,
    port:     parseInt(process.env.DB_PORT || '5432'),
  };
}

/** Crea el pool de conexiones. */
function crearPool() {
  return new Pool({
    ...configuracion(),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

module.exports = { crearPool, configuracion };
