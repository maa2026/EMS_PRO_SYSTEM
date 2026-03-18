@echo off
title EMS PRO 2026 — Launching All Servers
color 0A
cls

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║         EMS PRO SYSTEM 2026 — SERVER LAUNCHER           ║
echo  ║              Samajwadi Party — UP Command                ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  [*] Starting all 4 servers...
echo.

:: ── Set root directory
set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend

:: ── 1. Backend API Server (Port 5000)
echo  [1/4] Starting Backend API Server (port 5000)...
start "EMS-BACKEND [PORT 5000]" cmd /k "cd /d %BACKEND% && color 0C && title EMS-BACKEND [PORT 5000] && echo Backend API Server Starting... && node server.js"
timeout /t 2 /nobreak >nul

:: ── 2. Queue Producer
echo  [2/4] Starting Queue Producer...
start "EMS-PRODUCER" cmd /k "cd /d %BACKEND% && color 0E && title EMS-PRODUCER && echo Queue Producer Starting... && node producer.js"
timeout /t 1 /nobreak >nul

:: ── 3. Queue Worker
echo  [3/4] Starting Queue Worker...
start "EMS-WORKER" cmd /k "cd /d %BACKEND% && color 0B && title EMS-WORKER && echo Queue Worker Starting... && node queueWorker.js"
timeout /t 1 /nobreak >nul

:: ── 4. Frontend Next.js (Port 3000)
echo  [4/4] Starting Frontend (Next.js port 3000)...
start "EMS-FRONTEND [PORT 3000]" cmd /k "cd /d %FRONTEND% && color 0D && title EMS-FRONTEND [PORT 3000] && echo Frontend Server Starting... && npm run dev"

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║  ✅ All 4 servers launched in separate windows           ║
echo  ╠══════════════════════════════════════════════════════════╣
echo  ║  Backend API   →  http://localhost:5000                  ║
echo  ║  Frontend UI   →  http://localhost:3000                  ║
echo  ║  Producer      →  Running (background queue)            ║
echo  ║  Worker        →  Running (background queue)            ║
echo  ╠══════════════════════════════════════════════════════════╣
echo  ║  Frontend ready hone mein ~30 seconds lagte hain        ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

:: ── Auto-open browser after 10 seconds
echo  [*] Browser 10 seconds mein khulega...
timeout /t 10 /nobreak
start http://localhost:3000

exit
