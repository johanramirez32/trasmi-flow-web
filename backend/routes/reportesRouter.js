/**
 * Router de reportes.
 * POST /api/reportes
 * GET  /api/reportes
 * GET  /api/reportes/rutas
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportesController');
const seg = require('../seguridad');

router.post('/', seg.requerirAuth, ctrl.crearReporte);
router.get('/rutas', ctrl.rutasReportadas);
router.get('/', ctrl.listarReportes);

module.exports = router;
