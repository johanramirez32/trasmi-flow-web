/**
 * Router de niveles de ocupacion.
 * GET /api/niveles
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/nivelesController');

router.get('/', ctrl.obtenerNiveles);

module.exports = router;
