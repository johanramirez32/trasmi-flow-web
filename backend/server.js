require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const { crearPool } = require('./db');
const { inicializar } = require('./inicializar');

const app = express();
app.use(express.json());
app.use(cors());

// Servir el frontend (archivos estaticos)
app.use(express.static(path.join(__dirname, 'public')));

// Conexion a PostgreSQL: la nube usa DATABASE_URL, tu PC usa DB_*
const pool = crearPool();

// ---------------------------------------------------------------
// API: Estaciones (datos de referencia, lectura publica)
// ---------------------------------------------------------------
app.get('/api/estaciones', async (req, res) => {
  try {
    const buscar = (req.query.buscar || '').toString().trim();
    if (buscar) {
      const r = await pool.query(
        `SELECT id, nombre, troncal, lat, lng, aglomeracion
         FROM estaciones
         WHERE nombre ILIKE $1 OR troncal ILIKE $1
         ORDER BY nombre`,
        [`%${buscar}%`]
      );
      return res.json(r.rows);
    }
    const r = await pool.query(
      `SELECT id, nombre, troncal, lat, lng, aglomeracion
       FROM estaciones ORDER BY nombre`
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las estaciones.' });
  }
});

// ---------------------------------------------------------------
// Reportes de ocupacion
// ---------------------------------------------------------------
app.post('/api/reportes', async (req, res) => {
  const { estacion, nivel, usuario } = req.body;
  if (!estacion || !nivel) {
    return res.status(400).json({ error: 'Faltan datos del reporte.' });
  }
  try {
    await pool.query(
      'INSERT INTO reportes (estacion, nivel, usuario) VALUES ($1, $2, $3)',
      [estacion, nivel, usuario || 'anonimo']
    );
    res.status(201).json({ mensaje: 'Reporte recibido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo guardar el reporte.' });
  }
});

// Health check: confirma que la app responde Y que la base de datos esta viva
app.get('/api/health', async (req, res) => {
  try {
    const r = await pool.query('SELECT COUNT(*) AS n FROM estaciones');
    res.json({
      status: 'ok',
      baseDeDatos: 'conectada',
      estaciones: parseInt(r.rows[0].n, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      baseDeDatos: 'sin conexion',
      mensaje: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ---------------------------------------------------------------
// Autenticacion
// ---------------------------------------------------------------
app.post('/api/registro', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const existe = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electronico ya esta registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const nuevo = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email',
      [nombre, email, hash]
    );

    res.status(201).json({ mensaje: 'Usuario registrado con exito', usuario: nuevo.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor al registrar.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Ingresa correo y contrasena.' });
  }

  try {
    const r = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (r.rows.length === 0) {
      return res.status(400).json({ error: 'El correo no esta registrado.' });
    }

    const usuario = r.rows[0];
    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) {
      return res.status(400).json({ error: 'Contrasena incorrecta.' });
    }

    res.json({
      mensaje: 'Inicio de sesion exitoso',
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor al iniciar sesion.' });
  }
});

const PORT = process.env.PORT || 3000;

// Prepara el esquema y espera a que la base de datos responda
inicializar(pool)
  .then(() => console.log('   Base de datos lista'))
  .catch(err => console.error('   Error preparando la base de datos: ' + err.message));

app.listen(PORT, () => {
  console.log('');
  console.log('  ============================================');
  console.log('   TransmiFlow corriendo');
  console.log('   Frontend: http://localhost:' + PORT);
  console.log('   API:      http://localhost:' + PORT + '/api/health');
  console.log('  ============================================');
  console.log('');
});
