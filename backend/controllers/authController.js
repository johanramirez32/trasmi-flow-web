/**
 * Controller de autenticacion.
 * POST /api/registro
 * POST /api/login
 *
 * Contrasenas con bcrypt y token HMAC. Las cuentas nuevas siempre son
 * de tipo 'usuario'; los operarios se crean desde la base de datos.
 */
const bcrypt = require('bcryptjs');
const { getPool } = require('../db');
const seg = require('../seguridad');

const pool = getPool();

function texto(valor, max) {
  return String(valor == null ? '' : valor).trim().slice(0, max);
}

function validoCorreo(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 150;
}

/** Reglas: 8+ caracteres, 4+ letras, 1 mayuscula, 1 numero y 1 especial */
function validarPassword(password) {
  const errores = [];
  if (password.length < 8) { errores.push('Al menos 8 caracteres'); }
  if ((password.match(/[A-Za-z]/g) || []).length < 4) { errores.push('Al menos 4 letras'); }
  if (!/[A-Z]/.test(password)) { errores.push('Al menos 1 mayuscula'); }
  if (!/[0-9]/.test(password)) { errores.push('Al menos 1 numero'); }
  if (!/[^A-Za-z0-9]/.test(password)) { errores.push('Al menos 1 caracter especial'); }
  return { ok: errores.length === 0, errores: errores };
}

async function registrarUsuario(req, res) {
  const nombre = texto(req.body.nombre, 100);
  const email = texto(req.body.email, 150).toLowerCase();
  const password = String(req.body.password || '');

  if (!nombre || !validoCorreo(email)) {
    return res.status(400).json({ error: 'Indica tu nombre y un correo valido.' });
  }

  const pass = validarPassword(password);
  if (!pass.ok) {
    return res.status(400).json({ error: 'Contrasena debil: ' + pass.errores.join(', ') + '.', errores: pass.errores });
  }

  try {
    const existe = await pool.query('SELECT 1 FROM usuarios WHERE LOWER(email) = LOWER($1)', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electronico ya esta registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const nuevo = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol, codigo_operador) VALUES ($1, $2, $3, $4, $5) ' +
      'RETURNING id, nombre, email, rol, codigo_operador',
      [nombre, email, hash, 'usuario', null]
    );

    const usuario = nuevo.rows[0];
    res.status(201).json({
      mensaje: 'Usuario registrado con exito',
      usuario: usuario,
      token: seg.firmar(usuario)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor al registrar.' });
  }
}

async function iniciarSesion(req, res) {
  const email = texto(req.body.email, 150).toLowerCase();
  const password = String(req.body.password || '');
  const codigo = texto(req.body.codigo, 20);

  if (!email || !password) {
    return res.status(400).json({ error: 'Ingresa correo y contrasena.' });
  }

  try {
    const r = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)', [email]);
    const usuario = r.rows[0];

    // Mensaje generico para no revelar si el correo existe
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const rol = usuario.rol || 'usuario';
    if (rol === 'operario') {
      if (!codigo || !usuario.codigo_operador || codigo !== usuario.codigo_operador) {
        return res.status(401).json({ error: 'Codigo de autenticacion incorrecto.' });
      }
    }

    const datos = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: rol };
    res.json({
      mensaje: 'Inicio de sesion exito',
      usuario: datos,
      token: seg.firmar(datos)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor al iniciar sesion.' });
  }
}

module.exports = { registrarUsuario, iniciarSesion, validarPassword };
