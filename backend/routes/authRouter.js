/**
 * Router de autenticacion.
 * POST /api/registro
 * POST /api/login
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

router.post('/registro', ctrl.registrarUsuario);
router.post('/login', ctrl.iniciarSesion);

module.exports = router;
