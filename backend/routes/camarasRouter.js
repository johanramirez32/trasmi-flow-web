/**
 * Router de camaras.
 * GET /api/camaras
 * GET /api/camaras/estacion/:nombre
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/camarasController');

router.get('/', ctrl.listarCamaras);
router.get('/estacion/:nombre', ctrl.listarCamarasEstacion);

module.exports = router;
