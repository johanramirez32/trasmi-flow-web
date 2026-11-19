/**
 * Seguridad basica del aplicativo.
 * - Tokens HMAC firmados con una clave local (no se sube al repositorio)
 * - Middlewares de autenticacion y de rol
 * - Limite de intentos en memoria para evitar fuerza bruta
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ARCHIVO_SECRETO = path.join(__dirname, '.secret');

function secreto() {
  if (process.env.AUTH_SECRET) { return process.env.AUTH_SECRET; }
  try {
    if (fs.existsSync(ARCHIVO_SECRETO)) {
      return fs.readFileSync(ARCHIVO_SECRETO, 'utf8').trim();
    }
    const s = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(ARCHIVO_SECRETO, s, { mode: 0o600 });
    return s;
  } catch (e) {
    return crypto.randomBytes(32).toString('hex');
  }
}

/** Crea un token firmado para el usuario */
function firmar(usuario) {
  const payload = Buffer.from(JSON.stringify({
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol || 'usuario',
    iat: Date.now()
  })).toString('base64url');
  const firma = crypto.createHmac('sha256', secreto()).update(payload).digest('base64url');
  return payload + '.' + firma;
}

/** Verifica la firma y devuelve los datos del usuario, o null */
function verificar(token) {
  if (!token || typeof token !== 'string') { return null; }
  const partes = token.split('.');
  if (partes.length !== 2) { return null; }
  const esperada = crypto.createHmac('sha256', secreto()).update(partes[0]).digest('base64url');
  if (partes[1].length !== esperada.length) { return null; }
  if (!crypto.timingSafeEqual(Buffer.from(partes[1]), Buffer.from(esperada))) { return null; }
  try {
    const datos = JSON.parse(Buffer.from(partes[0], 'base64url').toString('utf8'));
    if (!datos.email || !datos.rol) { return null; }
    // Caducidad: 12 horas
    if (datos.iat && Date.now() - datos.iat > 12 * 60 * 60 * 1000) { return null; }
    return datos;
  } catch (e) {
    return null;
  }
}

function tokenDe(req) {
  const h = req.headers.authorization || '';
  if (h.indexOf('Bearer ') === 0) { return h.slice(7).trim(); }
  return null;
}

function requerirAuth(req, res, next) {
  const datos = verificar(tokenDe(req));
  if (!datos) {
    return res.status(401).json({ error: 'Debes iniciar sesión para realizar esta acción.' });
  }
  req.usuario = datos;
  next();
}

function requerirOperario(req, res, next) {
  const datos = verificar(tokenDe(req));
  if (!datos) {
    return res.status(401).json({ error: 'Debes iniciar sesión.' });
  }
  if (datos.rol !== 'operario') {
    return res.status(403).json({ error: 'Acceso restringido al panel operativo.' });
  }
  req.usuario = datos;
  next();
}

/** Limite de peticiones por IP + correo (en memoria, se reinicia con el servidor) */
function limiteIntentos(max, ventanaMs) {
  const registro = new Map();
  return function (req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'desconocida';
    const email = String((req.body && req.body.email) || '').toLowerCase().trim();
    const clave = ip + '|' + email;
    const ahora = Date.now();
    const entrada = registro.get(clave);
    if (entrada && ahora - entrada.inicio < ventanaMs) {
      if (entrada.conteo >= max) {
        return res.status(429).json({ error: 'Demasiados intentos con este correo. Espera un momento e inténtalo de nuevo.' });
      }
      entrada.conteo++;
    } else {
      registro.set(clave, { inicio: ahora, conteo: 1 });
    }
    if (registro.size > 5000) { registro.clear(); }
    next();
  };
}

module.exports = {
  secreto, firmar, verificar, requerirAuth, requerirOperario, limiteIntentos
};
