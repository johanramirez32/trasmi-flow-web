/**
 * Controller de autenticacion: registro y login de usuarios.
 * POST /api/registro
 * POST /api/login
 */
const bcrypt = require('bcryptjs');
const { getPool } = require('../db');

const pool = getPool();

async function registrarUsuario(req, res) {
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
}

async function iniciarSesion(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Ingresa correo y contrasena.' });
  }

  try {
    const r = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = r.rows[0];

    if (!usuario) {
      return res.status(400).json({ error: 'El correo electronico no esta registrado.' });
    }

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) {
      return res.status(400).json({ error: 'Contrasena incorrecta.' });
    }

    res.json({
      mensaje: 'Inicio de sesion exitoso',
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor al iniciar sesion.' });
  }
}

module.exports = { registrarUsuario, iniciarSesion };
