/**
 * Router de estaciones.
 * GET /api/estaciones
 * GET /api/estaciones?buscar=nombre
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/estacionesController');

router.get('/', ctrl.listarEstaciones);

module.exports = router;
