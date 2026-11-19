/**
 * Router de notificaciones.
 * GET  /api/notificaciones      -> solo las del usuario autenticado
 * POST /api/notificaciones/leer -> solo las del usuario autenticado
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificacionesController');
const seg = require('../seguridad');

router.get('/', seg.requerirAuth, ctrl.listarNotificaciones);
router.post('/leer', seg.requerirAuth, ctrl.marcarLeidas);

module.exports = router;
