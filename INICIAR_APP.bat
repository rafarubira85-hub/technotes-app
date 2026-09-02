@echo off
title TechNotes - Sistema de Avisos Tecnicos
cls
echo ========================================================
echo   Iniciando Servidor TechNotes (Clientes y Avisos)
echo ========================================================
echo.
echo Abrir en el navegador: http://localhost:3001
echo.
echo Presione CTRL+C o cierre esta ventana para detener.
echo ========================================================
echo.

start http://localhost:3001
node server/server.js
pause
