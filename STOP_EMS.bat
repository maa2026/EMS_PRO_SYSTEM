@echo off
title EMS PRO 2026 — Stopping All Servers
color 0C
cls

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║         EMS PRO SYSTEM 2026 — SERVER STOPPER            ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  [*] Sare servers band ho rahe hain...
echo.

:: Kill node processes (backend + producer + worker)
echo  [1/3] Backend / Producer / Worker (Node.js) band kar rahe hain...
taskkill /F /IM node.exe /T >nul 2>&1
echo       Done.

:: Kill Next.js dev server (also node, but may be separate)
echo  [2/3] Frontend Next.js band kar raha hain...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000.*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo       Done.

:: Kill port 5000 if still running
echo  [3/3] Port 5000 clear kar rahe hain...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000.*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo       Done.

echo.
echo  ✅ Sare servers band ho gaye.
echo.
pause
