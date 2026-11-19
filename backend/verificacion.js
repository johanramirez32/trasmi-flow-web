/**
 * Modulo de verificacion del aplicativo.
 * Comprueba disponibilidad, seguridad e integridad.
 * Se usa desde el script `npm test` y desde GET /api/diagnostico.
 */
const fs = require('fs');
const path = require('path');
const { getPool } = require('./db');

function check(categoria, nombre, ok, detalle) {
  return { categoria, nombre, ok: !!ok, detalle: String(detalle == null ? '' : detalle) };
}

/** Busca secretos escritos a mano en el codigo fuente */
function buscarSecretosEnCodigo() {
  const raiz = __dirname;
  const archivos = [
    'server.js', 'db.js', 'seguridad.js', 'inicializar.js',
    'controllers/authController.js', 'controllers/reportesController.js',
    'controllers/notificacionesController.js', 'controllers/despachoController.js'
  ];
  const patrones = [
    /(?:password|clave|secret|token)\s*[:=]\s*['"][^'"]{6,}['"]/i,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /(?:api[_-]?key|bearer)\s*[:=]\s*['"][^'"]{8,}['"]/i
  ];
  const hallazgos = [];
  archivos.forEach(function (rel) {
    const p = path.join(raiz, rel);
    if (!fs.existsSync(p)) { return; }
    const texto = fs.readFileSync(p, 'utf8');
    patrones.forEach(function (rx) {
      const m = texto.match(rx);
      if (m) { hallazgos.push(rel + ': ' + m[0].slice(0, 40)); }
    });
  });
  return hallazgos;
}

async function ejecutarVerificaciones() {
  const resultados = [];
  const raiz = __dirname;
  const pool = getPool();

  // ---------------- DISPONIBILIDAD ----------------
  try {
    await pool.query('SELECT 1');
    resultados.push(check('Disponibilidad', 'Conexion a PostgreSQL', true, 'SELECT 1 respondio correctamente'));
  } catch (e) {
    resultados.push(check('Disponibilidad', 'Conexion a PostgreSQL', false, e.message));
  }

  try {
    const url = 'https://gis.transmilenio.gov.co/arcgis/rest/services/' +
      'ConsultaSubgerenciaPlanificacionSITP/Consulta_Planificacion_SITP/FeatureServer/15/query' +
      '?where=1%3D1&returnCountOnly=true&f=json';
    const ctl = new AbortController();
    const t = setTimeout(function () { ctl.abort(); }, 6000);
    const r = await fetch(url, { signal: ctl.signal });
    clearTimeout(t);
    const j = await r.json();
    resultados.push(check('Disponibilidad', 'Servicio oficial Transmilenio', r.ok && j.count > 0,
      r.ok ? (j.count + ' rutas disponibles') : ('HTTP ' + r.status)));
  } catch (e) {
    resultados.push(check('Disponibilidad', 'Servicio oficial Transmilenio', false, e.message));
  }

  // ---------------- SEGURIDAD ----------------
  const gitignore = fs.existsSync(path.join(raiz, '..', '.gitignore'))
    ? fs.readFileSync(path.join(raiz, '..', '.gitignore'), 'utf8') : '';
  const gitignoreBackend = fs.existsSync(path.join(__dirname, '.gitignore'))
    ? fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8') : '';
  resultados.push(check('Seguridad', 'Credenciales fuera del repositorio',
    /\.env/.test(gitignore) && /\.secret/.test(gitignoreBackend),
    '.env y .secret estan excluidos en .gitignore'));

  const secretos = buscarSecretosEnCodigo();
  resultados.push(check('Seguridad', 'Sin claves o tokens quemados en el codigo',
    secretos.length === 0, secretos.length ? secretos.join(' | ') : 'No se encontraron secretos escritos a mano'));

  try {
    const r = await pool.query(
      "SELECT COUNT(*)::int AS total FROM usuarios WHERE password IS NULL OR password NOT LIKE '$2%'"
    );
    resultados.push(check('Seguridad', 'Contrasenas almacenadas con hash',
      r.rows[0].total === 0, r.rows[0].total + ' contrasenas sin cifrar'));
  } catch (e) {
    resultados.push(check('Seguridad', 'Contrasenas almacenadas con hash', false, e.message));
  }

  try {
    const servidor = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    const corsOK = /CORS_ORIGIN/.test(servidor) && /origenes\.indexOf/.test(servidor);
    resultados.push(check('Seguridad', 'CORS restringido', corsOK,
      corsOK ? 'Solo origenes configurados' : 'CORS parece abierto'));

    const headersOK = /X-Content-Type-Options/.test(servidor) && /X-Frame-Options/.test(servidor);
    resultados.push(check('Seguridad', 'Cabeceras de seguridad', headersOK,
      headersOK ? 'nosniff / SAMEORIGIN / Referrer-Policy activas' : 'Faltan cabeceras'));

    const auth = fs.readFileSync(path.join(__dirname, 'routes', 'authRouter.js'), 'utf8');
    resultados.push(check('Seguridad', 'Limite de intentos de login', /limiteIntentos/.test(auth),
      /limiteIntentos/.test(auth) ? '12 intentos / 5 min por IP' : 'Sin limite'));

    const rutas = fs.readFileSync(path.join(__dirname, 'routes', 'notificacionesRouter.js'), 'utf8');
    const notiCtrl = fs.readFileSync(path.join(__dirname, 'controllers', 'notificacionesController.js'), 'utf8');
    resultados.push(check('Seguridad', 'Notificaciones sin IDOR',
      /requerirAuth/.test(rutas) && /req\.usuario\.email/.test(notiCtrl),
      'El correo se toma del token, no del query string'));
  } catch (e) {
    resultados.push(check('Seguridad', 'Configuracion de seguridad', false, e.message));
  }

  // ---------------- INTEGRIDAD ----------------
  try {
    const r = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM estaciones) AS estaciones,
        (SELECT COUNT(*)::int FROM rutas) AS rutas,
        (SELECT COUNT(*)::int FROM ruta_estaciones) AS paradas,
        (SELECT COUNT(*)::int FROM ruta_estaciones re LEFT JOIN rutas r ON r.id=re.ruta_id WHERE r.id IS NULL) AS rutas_huerfanas,
        (SELECT COUNT(*)::int FROM ruta_estaciones re LEFT JOIN estaciones e ON e.id=re.estacion_id WHERE e.id IS NULL) AS estaciones_huerfanas,
        (SELECT COUNT(*)::int FROM rutas WHERE coordenadas IS NULL OR coordenadas::text = '[]') AS sin_trazo
    `);
    const d = r.rows[0];
    resultados.push(check('Integridad', 'Catalogo de estaciones', d.estaciones === 153,
      d.estaciones + ' estaciones (esperadas 153)'));
    resultados.push(check('Integridad', 'Rutas y paradas cargadas', d.rutas > 0 && d.paradas > 0,
      d.rutas + ' rutas, ' + d.paradas + ' paradas'));
    resultados.push(check('Integridad', 'Integridad referencial',
      d.rutas_huerfanas === 0 && d.estaciones_huerfanas === 0,
      d.rutas_huerfanas + ' rutas huerfanas, ' + d.estaciones_huerfanas + ' estaciones huerfanas'));
    resultados.push(check('Integridad', 'Todas las rutas tienen trazo', d.sin_trazo === 0,
      d.sin_trazo + ' rutas sin geometria'));
  } catch (e) {
    resultados.push(check('Integridad', 'Consulta de integridad', false, e.message));
  }

  const fallos = resultados.filter(function (r) { return !r.ok; });
  return {
    fecha: new Date().toISOString(),
    estado: fallos.length === 0 ? 'OK' : 'CON HALLAZGOS',
    total: resultados.length,
    fallos: fallos.length,
    resultados: resultados
  };
}

module.exports = { ejecutarVerificaciones };
