/**
 * Router de notificaciones.
 * GET /api/notificaciones?usuario=email
 * POST /api/notificaciones/leer?usuario=email
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificacionesController');

router.get('/', ctrl.listarNotificaciones);
router.post('/leer', ctrl.marcarLeidas);

module.exports = router;
