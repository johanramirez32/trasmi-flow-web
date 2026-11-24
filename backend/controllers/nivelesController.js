/**
 * Controller de niveles: aglomeracion calculada desde los reportes.
 * GET /api/niveles -> array de estaciones (compatible con el panel actual)
 */
const { calcular } = require('../services/aglomeracion');

async function obtenerNiveles(req, res) {
  try {
    const datos = await calcular(req.query.horas);
    // El panel actual espera un array con { estacion, nivel, creado_en }
    res.json(datos.estaciones.map(function (e) {
      return {
        estacion: e.estacion,
        portal: e.portal,
        ruta: e.rutas[0] || '',
        nivel: e.nivel,
        porcentaje: e.porcentaje,
        reportes: e.reportes,
        creado_en: e.ultimo
      };
    }));
  } catch (err) {
    console.error('ERROR_NIVELES: ' + err.message);
    res.json([]);
  }
}

module.exports = { obtenerNiveles };
