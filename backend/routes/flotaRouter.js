/** Flota: buses (por placa) y conductores (por cedula) disponibles para despacho */
const { getPool } = require('../db');
const seg = require('../seguridad');
const express = require('express');

const pool = getPool();
const router = express.Router();

async function buses(req, res) {
  try {
    const r = await pool.query('SELECT id, placa, tipo FROM buses WHERE activo = TRUE ORDER BY placa');
    res.json({ buses: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo cargar la flota de buses.' });
  }
}

async function conductores(req, res) {
  try {
    const r = await pool.query('SELECT id, nombre, cedula, telefono FROM conductores WHERE activo = TRUE ORDER BY nombre');
    res.json({ conductores: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo cargar los conductores.' });
  }
}

router.get('/buses', seg.requerirAuth, buses);
router.get('/conductores', seg.requerirAuth, conductores);

module.exports = router;
