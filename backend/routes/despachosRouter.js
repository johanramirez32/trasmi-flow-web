/**
 * Router de despachos.
 * POST /api/despacho   -> solo operario
 * GET  /api/despachos  -> usuarios autenticados
 * GET  /api/despachos/estadisticas
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/despachoController');
const seg = require('../seguridad');

router.post('/', seg.requerirOperario, ctrl.registrarDespacho);
router.get('/estadisticas', seg.requerirAuth, ctrl.estadisticas);
router.get('/', seg.requerirAuth, ctrl.listarDespachos);

module.exports = router;
