# TransmiFlow

Sistema web para reportar aglomeración en Transmilenio, planificar rutas entre
estaciones y consultar el panel operativo. Desplegado en
`https://trasmi-flow-web.onrender.com`.

## Organización del proyecto

La explicación completa de carpetas y archivos está en
[`docs/ESTRUCTURA_PROYECTO.md`](docs/ESTRUCTURA_PROYECTO.md).

Resumen:

- `backend/` → servidor Node.js + Express + PostgreSQL.
  - `controllers/`, `routes/`, `services/`, `modules/`, `datos/`, `test/`, `public/`.
- `docs/` → documentación, diagramas, modelos y dump de la base de datos.
- `transmiflow.code-workspace` → ábrelo en VS Code para ver las carpetas agrupadas.

## Arranque local

```powershell
cd backend
npm install
node server.js
```

## Pruebas

```powershell
cd backend
npm test
npm run test:vuln
```
