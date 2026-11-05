require('dotenv').config();
const { crearPool } = require('./db');
const pool = crearPool();
(async () => {
  const r = await pool.query("DELETE FROM usuarios WHERE email LIKE '%@test.com'");
  console.log('Eliminados: ' + r.rowCount);
  const r2 = await pool.query("SELECT id, nombre, email, rol FROM usuarios ORDER BY id");
  console.log(JSON.stringify(r2.rows));
  await pool.end();
  process.exit(0);
})().catch(async (err) => { console.error('ERROR: ' + err.message); try { await pool.end(); } catch (x) {} process.exit(1); });
