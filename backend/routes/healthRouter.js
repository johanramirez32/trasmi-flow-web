/**
 * Router de health.
 * GET /api/health
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/healthController');

router.get('/', ctrl.health);

module.exports = router;
