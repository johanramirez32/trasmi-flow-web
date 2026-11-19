/**
 * Router de autenticacion.
 * POST /api/registro
 * POST /api/login
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const seg = require('../seguridad');

// Evita fuerza bruta: 12 intentos por IP en 5 minutos
const limite = seg.limiteIntentos(12, 5 * 60 * 1000);

router.post('/registro', limite, ctrl.registrarUsuario);
router.post('/login', limite, ctrl.iniciarSesion);

module.exports = router;
