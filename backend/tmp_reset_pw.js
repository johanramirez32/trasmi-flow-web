require('dotenv').config();
const bcrypt = require('bcryptjs');
const { crearPool } = require('./db');
const pool = crearPool();
(async () => {
  const nuevoHash = await bcrypt.hash('Transmiflow2026', 10);
  const upd = await pool.query('UPDATE usuarios SET password = $1 WHERE id = $2', [nuevoHash, 10]);
  console.log('CONTRASENA_RESETEADA: ' + upd.rowCount);
  await pool.end();
  process.exit(0);
})().catch(async (e) => { console.error('ERROR: ' + e.message); try { await pool.end(); } catch (x) {} process.exit(1); });
