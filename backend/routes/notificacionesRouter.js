/**
 * Router de notificaciones.
 * GET /api/notificaciones?usuario=email
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificacionesController');

router.get('/', ctrl.listarNotificaciones);

module.exports = router;
