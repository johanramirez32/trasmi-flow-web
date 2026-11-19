#!/usr/bin/env node
/** Pruebas de vulnerabilidad en vivo contra la API (servidor debe estar corriendo) */
const { getPool } = require('../db');

const BASE = 'http://localhost:' + (process.env.PORT || 3000);
const results = [];

function res(nombre, ok, detalle) {
  results.push({ nombre, ok, detalle });
  console.log((ok ? '  [OK]   ' : '  [FALLO] ') + nombre + ' -> ' + detalle);
}

async function llamar(ruta, opciones) {
  const r = await fetch(BASE + ruta, opciones);
  let j = null;
  try { j = await r.json(); } catch (e) {}
  return { status: r.status, headers: r.headers, json: j };
}

(async () => {
  const pool = getPool();
  const email = 'seguridad.prueba@correo.com';

  // Usuario temporal
  await pool.query('DELETE FROM usuarios WHERE email = $1', [email]);
  const reg = await llamar('/api/registro', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Prueba seguridad', email, password: 'PruebaSegura123', rol: 'usuario' })
  });
  const token = reg.json && reg.json.token;
  res('Registro devuelve token firmado', reg.status === 201 && !!token, 'HTTP ' + reg.status);

  const auth = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };

  // 1. Endpoints protegidos sin token
  const sinToken = await llamar('/api/notificaciones');
  res('Notificaciones requieren autenticacion', sinToken.status === 401, 'HTTP ' + sinToken.status);

  const sinTokenDespacho = await llamar('/api/despacho', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estacion: 'Bosa', bus: 'B1' })
  });
  res('Despacho requiere autenticacion', sinTokenDespacho.status === 401, 'HTTP ' + sinTokenDespacho.status);

  // 2. Control por rol
  const comoUsuario = await llamar('/api/despacho', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ estacion: 'Bosa', bus: 'B1' })
  });
  res('Solo operario puede despachar', comoUsuario.status === 403, 'HTTP ' + comoUsuario.status);

  // 3. Token manipulado
  const manipulado = await llamar('/api/notificaciones', {
    headers: { Authorization: 'Bearer ' + (token ? token.slice(0, -3) + 'xxx' : 'x') }
  });
  res('Token alterado se rechaza', manipulado.status === 401, 'HTTP ' + manipulado.status);

  // 4. IDOR: el token manda, no el query string
  const idor = await llamar('/api/notificaciones?usuario=johansrsr32@gmail.com', { headers: auth });
  const ajenas = (idor.json && idor.json.notificaciones || []).filter(n => n.usuario === 'johansrsr32@gmail.com');
  res('Sin IDOR en notificaciones', idor.status === 200 && ajenas.length === 0,
    'HTTP ' + idor.status + ', notificaciones ajenas: ' + ajenas.length);

  // 5. Inyeccion SQL en busqueda
  const sqli = await llamar('/api/estaciones?buscar=' + encodeURIComponent("' OR 1=1--"));
  res('Inyeccion SQL bloqueada', sqli.status === 200 && Array.isArray(sqli.json),
    'HTTP ' + sqli.status + ', respuesta: ' + (Array.isArray(sqli.json) ? sqli.json.length + ' filas' : 'invalida'));

  // 6. XSS: se almacena como texto (el frontend lo escapa con escHtml)
  const xss = "<img src=x onerror=alert(1)>";
  const reporte = await llamar('/api/reportes', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ estacion: xss, ruta: xss, nivel: 'Alta' })
  });
  res('Reporte con payload XSS se acepta como texto', reporte.status === 201, 'HTTP ' + reporte.status);
  if (reporte.json && reporte.json.reporte) {
    await pool.query('DELETE FROM reportes WHERE id = $1', [reporte.json.reporte.id]);
  }

  // 7. CORS restringido
  const cors = await llamar('/api/health', { headers: { Origin: 'http://sitio-malicioso.example' } });
  const allow = cors.headers.get('access-control-allow-origin');
  res('CORS bloquea origenes desconocidos', cors.status === 403 || !allow,
    'HTTP ' + cors.status + ', allow-origin: ' + (allow || 'ninguno'));

  // 8. Cabeceras de seguridad
  const health = await llamar('/api/health');
  res('Cabeceras de seguridad presentes',
    health.headers.get('x-content-type-options') === 'nosniff' &&
    health.headers.get('x-frame-options') === 'SAMEORIGIN',
    'nosniff=' + health.headers.get('x-content-type-options') + ', frame=' + health.headers.get('x-frame-options'));

  // 9. Fuerza bruta: limite de intentos
  let ultimo = 200;
  for (let i = 0; i < 8; i++) {
    const r = await llamar('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'noexiste@correo.com', password: 'clave-erronea-' + i })
    });
    ultimo = r.status;
    if (r.status === 429) { break; }
  }
  res('Limite de intentos de login activo', ultimo === 429, 'estado final: HTTP ' + ultimo);

  // Limpieza
  await pool.query('DELETE FROM usuarios WHERE email = $1', [email]);
  await pool.end();

  const fallos = results.filter(r => !r.ok).length;
  console.log('\nResultado: ' + (fallos === 0 ? 'OK' : fallos + ' FALLOS') + ' (' + (results.length - fallos) + '/' + results.length + ')');
  process.exit(fallos > 0 ? 1 : 0);
})().catch(function (e) {
  console.error('Error en pruebas: ' + e.message);
  process.exit(2);
});
