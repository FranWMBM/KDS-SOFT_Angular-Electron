# KDSSR

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.3.

## Arquitectura

La app tiene tres partes:

- `src/` — el frontend Angular (comandas, configuración de pantalla). No
  depende de Electron: habla con el backend por un único WebSocket
  (`BackendService`), tanto para pedir datos (monitores, registros) como
  para recibir los pedidos nuevos en vivo. Ya no configura la conexión a
  SQL Server — eso se declara directamente en el backend (ver más abajo).
- `backend/` — un servidor Node/Express en **TypeScript** (`backend/src/`,
  compila a `backend/dist/`) que se conecta a SQL Server y atiende todo por
  WebSocket: el cliente manda `{ id, accion, datos }` y el backend responde
  `{ id, evento, datos }` con el mismo `id`. Los nuevos registros se
  transmiten a todas las pantallas conectadas sin que nadie los pida
  (`nuevos-registros`). También sirve el build de Angular como archivos
  estáticos, y expone además una API REST equivalente
  (`backend/src/routes/config.ts`) que el frontend no usa hoy, mantenida
  por si hace falta acceso por HTTP en el futuro (otra integración,
  debugging). Las credenciales de SQL Server se declaran en
  `backend/.env` (`DB_SERVIDOR`, `DB_BASE_DATOS`, `DB_USUARIO`,
  `DB_CONTRASENA`) y el backend las cifra y guarda en
  `backend/data/bd.config` al arrancar — nunca se piden desde la app.
- `electron/` — un shell delgado opcional para empaquetar una pantalla KDS
  como app de escritorio; solo abre una ventana apuntando a la URL del
  backend (`electron/host.config.json` o la variable `KDS_BACKEND_URL`).

Solo hace falta **una instancia** del backend en la red del restaurante
(en la misma LAN que el SQL Server). Cada pantalla KDS, sea un navegador o
el shell de Electron, se conecta a esa misma URL.

## Primeros pasos (clonar en una PC nueva, sin nada instalado)

### 1. Instalar lo necesario primero

- **[Node.js](https://nodejs.org)** (incluye `npm`) — instala la versión
  LTS. Este proyecto se desarrolló con Node 24 / npm 11, pero cualquier LTS
  reciente (20+) debería funcionar bien con Angular 22.
- **[Git](https://git-scm.com)** (opcional, solo si vas a clonar por git en
  vez de copiar la carpeta).

No hace falta instalar Angular CLI global ni nada más aparte — el resto se
instala vía `npm install` dentro del proyecto.

### 2. Clonar y obtener el proyecto

```bash
git clone <url-del-repositorio> KDS-SOFT_Angular-Electron
cd KDS-SOFT_Angular-Electron
```

(O copia la carpeta completa si no vas a usar Git.)

### 3. Instalar dependencias — frontend y backend por separado

Son dos `package.json` distintos (`/package.json` para Angular,
`/backend/package.json` para el backend), hay que instalar en ambos:

```bash
npm install                # dependencias de Angular, en la raíz
cd backend
npm install                # dependencias del backend (Express, ws, mssql, TypeScript...)
cd ..
```

### 4. Configurar el backend (una sola vez)

```bash
cd backend
cp .env.example .env
cd ..
```

Edita `backend/.env` y define:

- `CONFIG_SECRET` — una frase propia, larga (mínimo 32 caracteres). Cifra
  las credenciales de SQL Server al guardarlas.
- `DB_SERVIDOR`, `DB_BASE_DATOS`, `DB_USUARIO`, `DB_CONTRASENA` — la
  conexión a SQL Server del restaurante. El backend las lee de acá al
  arrancar y las guarda cifradas en `backend/data/bd.config` (ya no se
  configuran desde la app). Si cambias alguna, con reiniciar el backend
  alcanza para que tome el valor nuevo.

### 5. Primer uso de la app

Con el backend ya conectado a SQL Server (paso 4), solo falta la
configuración de pantalla, que es por dispositivo:

Ve a **Configuración**, elige el monitor de cocina y ajusta
filas/columnas/marca de agua para *ese* equipo — esto se guarda en el
navegador (`localStorage`), y se repite en cada PC/pantalla nueva.

## Development server

Dos formas de levantar la app, según qué quieras hacer:

**A) Simular producción** (una sola URL, todo servido por el backend):

```bash
npm run build      # compila Angular a dist/KDS-SR/browser
npm run backend    # compila el backend (tsc) y lo levanta en http://localhost:3000
```

Abre `http://localhost:3000/`.

**B) Modo desarrollo** (con recarga automática al guardar), en dos
terminales:

```bash
npm run backend   # terminal 1
ng serve          # terminal 2 — frontend en http://localhost:4200
```

Abre `http://localhost:4200/` — el proxy configurado en `proxy.conf.json`
reenvía la conexión `/ws` (y `/api`, si se llega a usar) hacia el backend.

Para iterar en el backend sin recompilar a mano cada vez, usa
`npm --prefix backend run dev` en vez de `npm run backend`: corre
`src/server.ts` directo con recarga automática al guardar (vía `tsx`).

## Producción (instalación real, servidor + pantallas)

Los comandos de la opción A de arriba alcanzan para levantar todo en una
sola PC de prueba. Para una instalación real en un restaurante (un servidor
central en la LAN + varias pantallas KDS, como servicio de Windows,
firewall, etc.), sigue la [guía de instalación en producción](DEPLOY.md).

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
