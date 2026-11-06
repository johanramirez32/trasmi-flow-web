/**
 * Router de despachos.
 * POST /api/despacho
 * GET  /api/despachos
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/despachoController');

router.post('/', ctrl.registrarDespacho);
router.get('/', ctrl.listarDespachos);

module.exports = router;
