@echo off
setlocal
chcp 65001 >nul
title ASTRUB - Les premieres pierres v0.7.0
cd /d "%~dp0"
echo ASTRUB - Prototype local v0.7.0
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js est manquant. Installez Node.js LTS depuis https://nodejs.org/
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm est manquant. Reinstallez Node.js LTS.
  pause
  exit /b 1
)
node -e "const s=require('node:net').connect(5173,'127.0.0.1');s.on('connect',()=>{s.destroy();process.exit(1)});s.on('error',()=>process.exit(0))"
if errorlevel 1 (
  echo Le port 5173 est deja utilise. Fermez l'ancien terminal ASTRUB puis relancez.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" goto install
if not exist "node_modules\phaser\package.json" goto install
goto launch
:install
echo Installation des bibliotheques depuis le verrou fourni...
call npm ci --no-audit --no-fund
if errorlevel 1 (
  echo L'installation a echoue. Verifiez votre connexion et les messages ci-dessus.
  pause
  exit /b 1
)
:launch
echo Demarrage. Gardez cette fenetre ouverte.
echo Votre partie utilise toujours http://127.0.0.1:5173/
start "Astrub - navigateur" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0OUVRIR_QUAND_PRET.ps1"
call npm run dev
if errorlevel 1 echo Le serveur s'est arrete avec une erreur. Consultez les messages ci-dessus.
pause
