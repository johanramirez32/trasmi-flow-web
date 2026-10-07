# Guia de despliegue - TransmiFlow

Publicar TransmiFlow en internet **gratis y sin tarjeta de credito**.

Usaremos dos servicios:

| Servicio | Para que sirve | Costo |
|----------|----------------|-------|
| **Neon** | La base de datos PostgreSQL | $0 permanente |
| **Render** | El servidor web (Node.js) | $0 |

---

## Como funciona

```
   Tu navegador
       |
       |  https://transmiflow.onrender.com
       v
   +--------------------+
   |  Render (servidor) |  <- corre server.js
   +--------------------+
       |
       |  DATABASE_URL (cifrado)
       v
   +--------------------+
   |  Neon (PostgreSQL) |  <- 153 estaciones + usuarios
   +--------------------+
```

Tu PostgreSQL local **no se sube**. Sigue en tu computador.
La nube crea una base de datos nueva y se llena sola al arrancar.

---

# PARTE 1 - Crear la base de datos en Neon

### 1. Abre Neon

Ve a <https://neon.com> y haz clic en **Sign up**.

Entra con Google o GitHub (lo que prefieras).

### 2. Crea un proyecto

1. Te preguntara el nombre del proyecto: escribe `transmiflow`
2. Region: elige **Oregon (US East)** o el mas cercano a Colombia
3. Clic en **Create project**

### 3. Copia la cadena de conexion

Veras un panel llamado **Connection string**.

1. En el selector de arriba elige **Node.js** (no el que dice "PSQL")
2. Pon el rol **`neondb_owner`** si esta disponible
3. Clic en el icono de copiar

Se vera algo asi:

```
postgresql://neondb_owner:AbCd1234@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Copia esa linea completa.** La vas a necesitar en la Parte 3.

> Si te aparece una ventana de "SQL Editor" o "Data Studio", cierrala.
> No necesitas escribir nada a mano.

---

# PARTE 2 - Subir el codigo a GitHub

Render necesita el codigo en un repositorio de GitHub.

### Opcion A: Arrastrar los archivos (mas facil)

1. En tu computador, abre la carpeta:
   ```
   C:\Users\User\OneDrive\Documents\subir-transmiflow
   ```
   (ya la prepare: tiene solo lo necesario, sin `node_modules`)

2. Ve a <https://github.com/new>

3. En **Repository name** escribe: `transmiflow`
   En **Description** escribe: `Sistema inteligente de transporte sobre TransMilenio`
   **NO** marques "Add a README file"

4. Clic en **Create repository**

5. Ahora estas en el repositorio vacio. Clic en el link:
   **uploading an existing file**

6. Abre esa pagina y **arrastra la carpeta `subir-transmiflow`**
   (arrastra la carpeta completa, no los archivos sueltos)

7. Espera a que suba. Debe aparecer `backend`, `public`, `.gitignore`

8. Abajo del todo, en el recuadro verde, escribe un comentario:
   `Subir proyecto` y clic en **Commit changes**

---

### Opcion B: GitHub Desktop

Si prefieres una aplicacion grafica:

1. Descarga GitHub Desktop de <https://desktop.github.com> e instalalo
2. Clic en **File > Create a new repository**
3. Elige la carpeta `C:\Users\User\OneDrive\Documents\transmiflow`
4. Clic en **Create repository**
5. Abajo a la izquierda pon tu usuario de GitHub y el repositorio `transmiflow`
6. Clic en **Publish repository**

---

# PARTE 3 - Crear el servidor en Render

### 1. Abre Render

Ve a <https://render.com> y haz clic en **Get Started**.

Entra con la misma cuenta de GitHub.

### 2. Crea el servicio

1. En el menu de arriba busca **New +**
2. Selecciona **Web Service**
3. Te aparecera la lista de repositorios:
   - Si ves `transmiflow`, seleccionalo
   - Si no aparece, haz clic en **Configure account** y dale permiso a Render
     sobre tus repositorios, luego vuelve

### 3. Configura el servicio

Completa estos campos:

| Campo | Valor |
|-------|-------|
| Name | `transmiflow` |
| Region | **Oregon (US West)** |
| Branch | `main` |
| **Root Directory** | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |

> **Ojo:** el campo **Root Directory** es el mas importante.
> Debe decir `backend`, no vacio.

### 4. Pega la base de datos

1. Baja hasta **Environment Variables**
2. Clic en **Add Environment Variable**
3. Llena:

   - **Key**: `DATABASE_URL`
   - **Value**: la linea que copiaste de Neon ( paso 1.3 )

4. Clic en **Add Environment Variable** otra vez para crear la segunda:

   - **Key**: `NODE_VERSION`
   - **Value**: `22`

### 5. Despliega

1. Baja hasta el boton azul **Create Web Service**
2. Espera. Render muestra los registros de la instalacion
3. Tarda entre 2 y 5 minutos la primera vez

Cuando termine veras algo como:

```
Deploy succeeded
```

---

# PARTE 4 - Comprobar que funciona

### 1. Abre la base de datos desde internet

En el navegador, cambia `localhost` por la direccion de Render:

```
http://localhost:3000/api/health
```

se convierte en:

```
https://transmiflow.onrender.com/api/health
```

Debes ver:

```json
{
  "status": "ok",
  "baseDeDatos": "conectada",
  "estaciones": 153,
  "timestamp": "2026-10-06T..."
}
```

Si dice `"estaciones": 153` **todo funciono**.

### 2. Abre la aplicacion

```
https://transmiflow.onrender.com
```

### 3. Crea tu primer usuario

Registrate desde la pagina web desplegada. Esa base de datos es nueva y esta vacia.

---

## Nota importante: el plan gratis

Render apaga el servidor cuando **15 minutos** no recibe visitas.
La primera visita despues de apagado tarda **hasta 1 minuto** en cargar.

Neon tambien apaga su base de datos a los **5 minutos** sin uso.

**Esto es normal, no es un error.**

Como evitarlo: pide a tus compañeros o al profesor que entren al menos
una vez cada 15 minutos. O usa Render con tarjeta (7 USD/mes) y no se apaga.

---

## Problemas frecuentes

### "Module not found" o "Cannot find module './db'"

El **Root Directory** no esta en `backend`. Corrigelo en:
Render > tu servicio > Settings > Root Directory.

### "The connection string is invalid"

La `DATABASE_URL` esta mal copiada. Vuelve a copiarla desde Neon
(Remember: elige **Node.js**, no PSQL).

### La pagina carga pero dice "No se pudieron cargar las estaciones"

Abre la consola del navegador (F12) y revisa. Si el error es de
conexion, la `DATABASE_URL` esta mal. Comprueba primero
`/api/health`: si responde `"baseDeDatos": "sin conexion"`, es eso.

### El mapa no carga

Verifica que puedas entrar a <https://www.openstreetmap.org>.
Si tu institucion bloquea ese sitio, el mapa se vera en blanco.

### Cambiaste el codigo y no se actualiza

Render solo actualiza cuando detecta cambios en GitHub.
Render > tu servicio > **Manual Deploy** > **Deploy latest commit**

---

# Volver a trabajar en local

Tu proyecto en tu computador **sigue igual**. Para seguir desarrollando:

```powershell
cd C:\Users\User\OneDrive\Documents\transmiflow\backend
npm start
```

Y abre `http://localhost:3000`.

El archivo `.env` de tu carpeta tiene la configuracion **local**.
Render usa la suya, guardada en el panel de Render.

Nunca copies el `.env` local a GitHub: contiene tu contrasena.
