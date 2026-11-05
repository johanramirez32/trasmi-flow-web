require('dotenv').config();
const { crearPool } = require('./db');
const pool = crearPool();
(async () => {
  await pool.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'usuario'");
  const r = await pool.query(
    "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name='usuarios' ORDER BY ordinal_position"
  );
  console.log('USUARIOS:', JSON.stringify(r.rows));
  const e = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='estaciones' ORDER BY ordinal_position"
  );
  console.log('ESTACIONES:', JSON.stringify(e.rows));
  await pool.end();
  process.exit(0);
})().catch(async (err) => { console.error('ERROR: ' + err.message); try { await pool.end(); } catch (x) {} process.exit(1); });
