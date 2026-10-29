/**
 * TransmiFlow - Servidor Express principal
 *
 * Arquitectura modular:
 *   server.js      -> crea la app y monta los routers
 *   routes/        -> definen los caminos de las URLs
 *   controllers/   -> ejecutan la logica y responden
 *   db.js          -> conexion a PostgreSQL
 *
 * Endpoints:
 *   GET  /api/health
 *   GET  /api/estaciones
 *   GET  /api/estaciones?buscar=nombre
 *   GET  /api/niveles
 *   GET  /api/reportes
 *   POST /api/reportes
 *   POST /api/registro
 *   POST /api/login
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { getPool } = require('./db');
const { inicializar } = require('./inicializar');

const app = express();
app.use(express.json());
app.use(cors());

// Servir el frontend (archivos estaticos)
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------
// Montaje de los routers (API modular)
// ---------------------------------------------------------------
app.use('/api/health',     require('./routes/healthRouter'));
app.use('/api/estaciones', require('./routes/estacionesRouter'));
app.use('/api/niveles',    require('./routes/nivelesRouter'));
app.use('/api/reportes',   require('./routes/reportesRouter'));
app.use('/api/auth',       require('./routes/authRouter'));

const pool = getPool();

// ---------------------------------------------------------------
// Arrancar: esperar BD + inicializar esquema
// ---------------------------------------------------------------
inicializar(pool)
  .then(() => console.log('   Base de datos lista'))
  .catch(err => console.error('   Error preparando la base de datos: ' + err.message));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('  ============================================');
  console.log('   TransmiFlow corriendo');
  console.log('   Frontend: http://localhost:' + PORT);
  console.log('   API:      http://localhost:' + PORT + '/api/health');
  console.log('  ============================================');
  console.log('');
});

module.exports = app;
