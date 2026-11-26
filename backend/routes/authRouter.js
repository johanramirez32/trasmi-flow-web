/**
 * Router de autenticacion.
 * POST /api/registro
 * POST /api/login
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const seg = require('../seguridad');

// Evita fuerza bruta: 5 intentos por correo en 5 minutos
const limite = seg.limiteIntentos(5, 5 * 60 * 1000);

router.post('/registro', limite, ctrl.registrarUsuario);
router.post('/login', limite, ctrl.iniciarSesion);
router.post('/google', limite, ctrl.autenticarGoogle);

// Configuracion publica (solo el Client ID, nunca secretos)
router.get('/config', ctrl.configuracionPublica);

module.exports = router;
