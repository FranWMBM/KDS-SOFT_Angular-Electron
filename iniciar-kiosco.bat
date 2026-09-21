@echo off
REM Abre el KDS en modo kiosco: pantalla completa, sin barra de navegador,
REM sin pestañas. Pensado para dejarlo corriendo en una pantalla de cocina.
REM
REM Si esta PC no es el servidor, cambia la URL de abajo por la IP real
REM del backend (la que sale con "ipconfig" en el servidor), por ejemplo:
REM   set KDS_URL=http://192.168.1.50:3000

setlocal
set KDS_URL=http://localhost:3000

set EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe
set CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe

if exist "%EDGE%" (
  start "" "%EDGE%" --kiosk "%KDS_URL%" --edge-kiosk-type=fullscreen
) else if exist "%CHROME%" (
  start "" "%CHROME%" --kiosk "%KDS_URL%"
) else (
  echo No se encontro Microsoft Edge ni Google Chrome instalado.
  echo Instala alguno de los dos, o edita este archivo con la ruta correcta.
  pause
)
