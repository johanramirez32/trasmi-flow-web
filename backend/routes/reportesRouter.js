/**
 * Router de reportes.
 * POST /api/reportes
 * GET  /api/reportes
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportesController');

router.post('/', ctrl.crearReporte);
router.get('/', ctrl.listarReportes);

module.exports = router;
