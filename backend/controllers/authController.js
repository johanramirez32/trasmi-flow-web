/**
 * Controller de autenticacion.
 * POST /api/registro
 * POST /api/login
 *
 * Las contrasenas se guardan con bcrypt y las respuestas incluyen un token
 * firmado (HMAC) que el frontend envia en Authorization: Bearer.
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

async function registrarUsuario(req, res) {
  const nombre = texto(req.body.nombre, 100);
  const email = texto(req.body.email, 150).toLowerCase();
  const password = String(req.body.password || '');
  const rol = req.body.rol === 'operario' ? 'operario' : 'usuario';

  if (!nombre || !validoCorreo(email) || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: 'Datos invalidos: nombre, correo valido y contraseña de 8 a 128 caracteres.' });
  }

  try {
    const existe = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electronico ya esta registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const codigo = rol === 'operario' ? 'OP' + Math.floor(1000 + Math.random() * 9000) : null;

    const nuevo = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol, codigo_operador) VALUES ($1, $2, $3, $4, $5) ' +
      'RETURNING id, nombre, email, rol, codigo_operador',
      [nombre, email, hash, rol, codigo]
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
    const r = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
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

module.exports = { registrarUsuario, iniciarSesion };
