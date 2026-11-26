# Backend de TransmiFlow

Servidor Node.js + Express + PostgreSQL. Detalle completo de cada archivo en
[`docs/ESTRUCTURA_PROYECTO.md`](../docs/ESTRUCTURA_PROYECTO.md).

## Arranque

```powershell
cd backend
npm install
node server.js          # o: npm start
```

## Scripts

| Comando | Para qué sirve |
|---|---|
| `npm test` | 15 comprobaciones de disponibilidad, seguridad e integridad. |
| `npm run test:vuln` | 11 pruebas de vulnerabilidad contra el servidor en marcha. |
| `node cargar-estaciones.js` | Importa estaciones desde CSV. |
| `node exportar-estaciones.js` | Exporta estaciones a `datos/estaciones.json`. |

## Mapa rápido de carpetas

- `controllers/` → lógica de cada endpoint.
- `routes/` → URLs `/api/...`.
- `services/` → cálculo de aglomeración.
- `modules/` → módulo independiente de monitoreo por cámaras (IA).
- `datos/` → JSON de semilla.
- `test/` → pruebas.
- `public/` → frontend.

## Variables de entorno

Copia `.env.example` a `.env`. Nunca subas `.env` ni `.secret` a Git: ya están
excluidos en `.gitignore`. En Render se configuran las mismas variables desde el
panel de/service settings.
