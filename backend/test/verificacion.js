#!/usr/bin/env node
/**
 * Tester de TransmiFlow: disponibilidad, seguridad e integridad.
 * Uso: npm test
 */
const { ejecutarVerificaciones } = require('../verificacion');

(async () => {
  const r = await ejecutarVerificaciones();
  let categoria = '';
  r.resultados.forEach(function (x) {
    if (x.categoria !== categoria) {
      categoria = x.categoria;
      console.log('\n[' + categoria + ']');
    }
    console.log((x.ok ? '  [OK]   ' : '  [FALLO] ') + x.nombre + ' -> ' + x.detalle);
  });
  console.log('\nResultado: ' + r.estado + ' (' + (r.total - r.fallos) + '/' + r.total + ' pruebas superadas)');
  process.exit(r.fallos > 0 ? 1 : 0);
})().catch(function (e) {
  console.error('No se pudieron ejecutar las pruebas: ' + e.message);
  process.exit(2);
});
