# Frontend de TransmiFlow

Todo lo que se ve en el navegador está en esta carpeta. Detalle completo en
[`../../docs/ESTRUCTURA_PROYECTO.md`](../../docs/ESTRUCTURA_PROYECTO.md).

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Pantalla de acceso (usuario y operador), mapa, alertas, reportes y panel operativo. |
| `operador.html` | Acceso operativo alternativo. |
| `js/estado.js` | Variables globales y token adjunto a cada petición. |
| `js/api.js` | Búsqueda de estaciones. |
| `js/app.js` | Navegación, sesión, Google, roles, reportes y notificaciones. |
| `js/mapa.js` | Mapa, trazo de ruta estación por estación y alternativas. |
| `js/operador.js` | Reportes, rutas, despachos y cámaras del operario. |
| `vendor/` | Tailwind, Lucide y Leaflet locales. |

## Orden de carga de los scripts

Los scripts se cargan desde `index.html` en este orden: `estado.js`, `mapa.js`,
`api.js`, `app.js`, `operador.js`. No cambies ese orden: las funciones se comparten
entre archivos.
