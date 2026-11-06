/**
 * Router de rutas.
 * GET /api/rutas
 * GET /api/rutas/estacion/:nombre
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rutasController');

router.get('/', ctrl.listarRutas);
router.get('/estacion/:nombre', ctrl.listarRutasEstacion);

module.exports = router;
