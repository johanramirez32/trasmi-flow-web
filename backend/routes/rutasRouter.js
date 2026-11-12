/**
 * Router de rutas: rutas del sistema y rutas oficiales de Transmilenio.
 * GET /api/rutas
 * GET /api/rutas/estacion/:nombre
 * GET /api/rutas/oficiales
 * GET /api/rutas/oficiales/estaciones
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rutasController');
const ctrlOficial = require('../controllers/rutasOficialesController');

router.get('/', ctrl.listarRutas);
router.get('/estacion/:nombre', ctrl.listarRutasEstacion);
router.get('/oficiales', ctrlOficial.listarRutasOficiales);
router.get('/oficiales/estaciones', ctrlOficial.listarEstacionesOficiales);

module.exports = router;
