# Guía de instalación en producción (desde cero)

Esta guía asume Windows, que es donde corre hoy el sistema. Cubre la
instalación completa: el servidor central (backend + SQL Server) y cada
pantalla KDS del restaurante.

Antes de empezar, repasa la arquitectura en el [README](README.md#arquitectura):
**una sola instancia del backend** corre en la LAN, y cada pantalla KDS
(navegador o Electron) se conecta a esa misma URL.

## 0. Qué máquina hace qué

- **Servidor** (una sola PC/servidor en la red del restaurante, con línea de
  red hacia el SQL Server): corre el backend Node. Puede ser la misma
  máquina donde está SQL Server o cualquier otra PC de la LAN.
- **Pantallas KDS** (una por estación de cocina): abren un navegador o el
  shell de Electron apuntando a la IP del servidor. No necesitan Node ni
  acceso directo a SQL Server.

## 1. Preparar el servidor

### 1.1 Requisitos

- Windows con acceso de red al SQL Server del restaurante.
- [Node.js LTS](https://nodejs.org/) instalado (incluye `npm`).
- Git (o simplemente copiar la carpeta del proyecto por USB/red).

### 1.2 Obtener el proyecto

```powershell
git clone <url-del-repositorio> C:\KDS-SR
cd C:\KDS-SR
```

(O copia la carpeta del proyecto ya existente si no usas Git en el servidor.)

### 1.3 Instalar dependencias y compilar el frontend

```powershell
npm install
npm run build
```

Esto genera `dist/KDS-SR/browser`, que es lo que el backend va a servir.

### 1.4 Configurar el backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edita `backend/.env` y define:

```
PORT=3000
CONFIG_SECRET=<una-frase-larga-y-unica-de-al-menos-32-caracteres>
DB_SERVIDOR=<ip-o-nombre-del-servidor-de-sql-server>
DB_BASE_DATOS=<nombre-de-la-base-de-datos>
DB_USUARIO=<usuario-de-sql-server>
DB_CONTRASENA=<contraseña>
```

`CONFIG_SECRET` cifra las credenciales de SQL Server que el backend guarda
en `backend/data/bd.config` al arrancar. **Anótalo en un lugar seguro**: si
lo cambias más adelante, el backend ya no podrá leer la conexión guardada y
volverá a tomar los valores de `DB_SERVIDOR`/`DB_BASE_DATOS`/`DB_USUARIO`/
`DB_CONTRASENA` de este mismo archivo.

Las credenciales de SQL Server (`DB_SERVIDOR`, `DB_BASE_DATOS`,
`DB_USUARIO`, `DB_CONTRASENA`) ya no se configuran desde la app — se
declaran acá, una sola vez, en el servidor. Si en algún momento cambian
(nueva contraseña, otro servidor), edita estas cuatro líneas y reinicia el
backend (`nssm restart KDS-SR-Backend`, ver paso 1.7).

El backend está en TypeScript; `npm run backend` (paso 1.5) lo compila solo
antes de arrancar. Si en algún momento quieres compilarlo a mano:

```powershell
cd backend
npm run build   # genera backend/dist/*.js
```

### 1.5 Probar que arranca

```powershell
cd C:\KDS-SR
npm run backend
```

Deberías ver `Backend KDS-SR escuchando en http://localhost:3000`. Abre esa
URL en un navegador de la misma PC para confirmar que carga la app. Detenlo
con `Ctrl+C` una vez confirmado; en el paso 1.7 lo dejamos corriendo como
servicio.

### 1.6 Abrir el puerto en el Firewall de Windows

Para que las demás pantallas de la LAN puedan llegar al backend:

```powershell
New-NetFirewallRule -DisplayName "KDS-SR Backend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### 1.7 Dejarlo corriendo siempre (servicio de Windows)

Recomendado: [NSSM](https://nssm.cc/) para que el backend arranque solo con
Windows y se reinicie si se cae. Como NSSM llama a `node.exe` directamente
(sin pasar por npm), primero hay que compilar una vez:

```powershell
cd C:\KDS-SR\backend
npm run build

# Descarga nssm.exe y colócalo en el PATH, luego:
nssm install KDS-SR-Backend "C:\Program Files\nodejs\node.exe" "C:\KDS-SR\backend\dist\server.js"
nssm set KDS-SR-Backend AppDirectory "C:\KDS-SR\backend"
nssm start KDS-SR-Backend
```

Verifica el estado con `nssm status KDS-SR-Backend`, o revisa en
`services.msc` que "KDS-SR-Backend" esté "En ejecución".

> Alternativa sin instalar nada aparte: dejar la ventana de
> `npm run backend` abierta y minimizada, y agregar un acceso directo a esa
> misma carpeta en la carpeta de inicio de Windows
> (`shell:startup`). Menos robusto (no se reinicia solo si falla), pero
> funciona para una primera puesta en marcha.

### 1.8 Averigua la IP del servidor

```powershell
ipconfig
```

Anota la IPv4 (ej. `192.168.1.50`). Todas las pantallas KDS usarán
`http://192.168.1.50:3000`.

## 2. Configurar cada pantalla KDS

La configuración de **pantalla** (filas, columnas, qué monitor de cocina
mostrar, marca de agua) es local a cada dispositivo — se guarda en el
navegador de esa PC, así que este paso sí se repite en cada estación.

### Opción A — Navegador en modo kiosco (más simple)

1. Abre Chrome/Edge normal en la PC de la pantalla KDS (no en modo kiosco
   todavía) y navega a `http://<ip-del-servidor>:3000`.
2. Ve a **Configuración**, define filas/columnas y elige el
   monitor de cocina que corresponde a esa estación, guarda.
3. Copia [`iniciar-kiosco.bat`](iniciar-kiosco.bat) a esa PC y edita la
   línea `set KDS_URL=...` con la IP real del servidor, por ejemplo:

   ```bat
   set KDS_URL=http://192.168.1.50:3000
   ```

   Al ejecutarlo abre Edge (o Chrome si no hay Edge) en pantalla completa,
   sin barra de navegador ni pestañas — apunta a `--edge-kiosk-type=fullscreen`
   para Edge, que si no se especifica abre un modo kiosco distinto
   (de navegación pública, con varias pestañas).
4. Para que arranque solo al prender la PC, coloca un acceso directo a
   `iniciar-kiosco.bat` en la carpeta de inicio de Windows (`shell:startup`)
   de esa PC.

### Opción B — Shell de Electron (ventana dedicada)

Si prefieres una app de escritorio en vez de un navegador:

1. Copia la carpeta del proyecto (o solo `electron/` + `node_modules` con
   Electron instalado) a la PC de la pantalla.
2. Edita `electron/host.config.json` con la IP real del servidor:

   ```json
   { "backendUrl": "http://192.168.1.50:3000" }
   ```

3. Instala Electron y ejecútalo:

   ```powershell
   npm install
   npm run electron
   ```

4. Igual que en la opción A, configura filas/columnas/monitor desde
   **Configuración** dentro de esa ventana.
5. Para que arranque solo al iniciar Windows, crea un acceso directo a
   `npm run electron` (o al `.exe` si luego se empaqueta con
   `electron-builder`) en `shell:startup`.

## 3. Verificación final

- Abre dos pantallas KDS a la vez y confirma que ambas reciben las mismas
  comandas nuevas casi al instante (WebSocket).
- Apaga y prende el servidor: el backend debe volver a levantar solo (si
  configuraste NSSM) y las pantallas deben reconectarse solas al WebSocket
  en unos segundos.
- Revisa `backend/data/` — debe existir `bd.config`, nunca debe subirse a
  Git (ya está en `.gitignore`).

## 4. Actualizar la app a futuro

Desde el servidor:

```powershell
cd C:\KDS-SR
git pull
npm install
npm run build
cd backend
npm install
npm run build
nssm restart KDS-SR-Backend
```

Las pantallas KDS no necesitan actualizarse manualmente: al recargar el
navegador (o reiniciar el shell de Electron) obtienen el build nuevo, porque
lo sirve el backend.

## 5. Problemas comunes

| Síntoma | Causa probable |
|---|---|
| Una pantalla no carga nada | No llega al servidor: revisa la IP, que el firewall tenga la regla del paso 1.6, y que ambas PCs estén en la misma red/VLAN. |
| "Define DB_SERVIDOR, DB_BASE_DATOS, ... en backend/.env" | Faltan (o están vacías) las variables `DB_*` en `backend/.env` (paso 1.4). Complétalas y reinicia el backend. |
| El backend no toma una credencial nueva que acabas de cambiar en `.env` | Hace falta reiniciar el backend (`nssm restart KDS-SR-Backend`) para que relea `backend/.env`. |
| Las pantallas no reciben comandas nuevas | Revisa que el backend siga corriendo (`nssm status KDS-SR-Backend`) y que no haya un firewall bloqueando WebSockets en el puerto 3000. |
