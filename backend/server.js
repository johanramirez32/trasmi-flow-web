/**
 * TransmiFlow - Servidor Express principal
 *
 * Arquitectura modular:
 *   server.js      -> crea la app y monta los routers
 *   routes/        -> definen los caminos de las URLs
 *   controllers/   -> ejecutan la logica y responden
 *   seguridad.js   -> tokens HMAC, roles y limite de intentos
 *   verificacion.js-> pruebas de disponibilidad, seguridad e integridad
 *   db.js          -> conexion a PostgreSQL
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { getPool } = require('./db');
const { inicializar } = require('./inicializar');
const seg = require('./seguridad');

const app = express();

// Cuerpo limitado: evita peticiones gigantes
app.use(express.json({ limit: '32kb' }));

// CORS: solo orígenes conocidos (configurable con CORS_ORIGIN)
const origenes = (process.env.CORS_ORIGIN ||
  'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3010,http://127.0.0.1:3010')
  .split(',').map(function (s) { return s.trim(); }).filter(Boolean);

app.use(cors({
  origin: function (origin, cb) {
    if (!origin) { return cb(null, true); }
    if (origenes.indexOf(origin) !== -1) { return cb(null, true); }
    return cb(new Error('CORS: origen no permitido'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600
}));

// Cabeceras de seguridad
app.use(function (req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
  res.removeHeader('X-Powered-By');
  next();
});

// Servir el frontend (archivos estaticos)
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------
// Montaje de los routers (API modular)
// ---------------------------------------------------------------
app.use('/api/health',     require('./routes/healthRouter'));
app.use('/api/estaciones', require('./routes/estacionesRouter'));
app.use('/api/niveles',    require('./routes/nivelesRouter'));
app.use('/api/reportes',   require('./routes/reportesRouter'));
app.use('/api',            require('./routes/authRouter'));

// Ambos caminos: el frontend usa /api/despacho y el listado /api/despachos
app.use('/api/despacho',  require('./routes/despachosRouter'));
app.use('/api/despachos', require('./routes/despachosRouter'));
app.use('/api/rutas',     require('./routes/rutasRouter'));
app.use('/api/camaras',   require('./routes/camarasRouter'));
app.use('/api/notificaciones', require('./routes/notificacionesRouter'));

// Panel de verificacion: solo operario autenticado
app.get('/api/diagnostico', seg.requerirOperario, function (req, res) {
  require('./verificacion').ejecutarVerificaciones()
    .then(function (r) { res.json(r); })
    .catch(function (err) { res.status(500).json({ error: err.message }); });
});

// Errores: nunca exponer stack traces al cliente
app.use(function (err, req, res, next) {
  console.error('ERROR_HTTP: ' + err.message);
  const estado = err.status || (err.message && err.message.indexOf('CORS') !== -1 ? 403 : 500);
  res.status(estado).json({ error: estado === 403 ? 'Peticion no permitida.' : 'Error interno del servidor.' });
});

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
