/**
 * Controller de autenticacion: registro y login de usuarios.
 * POST /api/registro
 * POST /api/login
 */
const bcrypt = require('bcryptjs');
const { getPool } = require('../db');

const pool = getPool();

async function registrarUsuario(req, res) {
  const { nombre, email, password, rol, codigo_operador } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const existe = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electronico ya esta registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const rolFinal = rol || 'usuario';
    const codigoFinal = rolFinal === 'operario' ? (codigo_operador || ('OP' + Math.floor(1000 + Math.random() * 9000))) : null;
    const nuevo = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol, codigo_operador) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, email, rol, codigo_operador',
      [nombre, email, hash, rolFinal, codigoFinal]
    );

    res.status(201).json({ mensaje: 'Usuario registrado con exito', usuario: nuevo.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor al registrar.' });
  }
}

async function iniciarSesion(req, res) {
  const { email, password, codigo } = req.body;

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

    const rol = usuario.rol || 'usuario';

    // El operario requiere un codigo de autenticacion
    if (rol === 'operario') {
      if (!codigo || !usuario.codigo_operador || codigo !== usuario.codigo_operador) {
        return res.status(401).json({ error: 'Codigo de autenticacion incorrecto.' });
      }
    }

    res.json({
      mensaje: 'Inicio de sesion exito',
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: rol, codigo_operador: usuario.codigo_operador },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor al iniciar sesion.' });
  }
}

module.exports = { registrarUsuario, iniciarSesion };
