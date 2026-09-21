# KDSSR

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.3.

## Arquitectura

La app tiene tres partes:

- `src/` — el frontend Angular (comandas, configuración). No depende de
  Electron: habla con el backend por un único WebSocket (`BackendService`),
  tanto para pedir datos (config de base de datos, monitores, registros)
  como para recibir los pedidos nuevos en vivo.
- `backend/` — un servidor Node/Express en **TypeScript** (`backend/src/`,
  compila a `backend/dist/`) que se conecta a SQL Server, guarda las
  credenciales (cifradas) y atiende todo por WebSocket: el cliente manda
  `{ id, accion, datos }` y el backend responde `{ id, evento, datos }` con
  el mismo `id`. Los nuevos registros se transmiten a todas las pantallas
  conectadas sin que nadie los pida (`nuevos-registros`). También sirve el
  build de Angular como archivos estáticos, y expone además una API REST
  equivalente (`backend/src/routes/config.ts`) que el frontend no usa hoy,
  mantenida por si hace falta acceso por HTTP en el futuro (otra
  integración, debugging).
- `electron/` — un shell delgado opcional para empaquetar una pantalla KDS
  como app de escritorio; solo abre una ventana apuntando a la URL del
  backend (`electron/host.config.json` o la variable `KDS_BACKEND_URL`).

Solo hace falta **una instancia** del backend en la red del restaurante
(en la misma LAN que el SQL Server). Cada pantalla KDS, sea un navegador o
el shell de Electron, se conecta a esa misma URL.

## Development server

Primero instala las dependencias del backend (una sola vez) y copia
`backend/.env.example` a `backend/.env` con un `CONFIG_SECRET` propio:

```bash
cd backend
npm install
cp .env.example .env
```

Luego, desde la raíz del proyecto, en dos terminales:

```bash
npm run backend   # compila el backend (tsc) y lo levanta en http://localhost:3000
ng serve          # frontend en http://localhost:4200, con proxy a /ws (y /api)
```

Abre `http://localhost:4200/` — el proxy configurado en `proxy.conf.json`
reenvía la conexión `/ws` (y `/api`, si se llega a usar) hacia el backend.

Para iterar en el backend sin recompilar a mano cada vez, usa
`npm --prefix backend run dev` en vez de `npm run backend`: corre
`src/server.ts` directo con recarga automática al guardar (vía `tsx`).

## Producción

```bash
ng build                 # genera dist/KDS-SR/browser
npm run backend           # el backend sirve ese build en http://<ip>:3000
```

Cada pantalla KDS abre `http://<ip-del-backend>:3000` en un navegador, o
corre `npm run electron` (con `electron/host.config.json` apuntando a esa
misma IP) para tener una ventana dedicada.

Para la instalación completa en un restaurante (servidor + cada pantalla,
como servicio de Windows, firewall, etc.), ve la [guía de instalación en
producción](DEPLOY.md).

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
