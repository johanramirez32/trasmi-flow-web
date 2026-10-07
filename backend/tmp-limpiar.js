require('dotenv').config();
const { crearPool } = require('./db');
const pool = crearPool();
pool.query("DELETE FROM usuarios WHERE email = 't@t.com'")
  .then(r => { console.log('Usuario de prueba borrado: ' + r.rowCount); return pool.end(); })
  .then(() => process.exit(0))
  .catch(e => { console.log(e.message); process.exit(1); });
