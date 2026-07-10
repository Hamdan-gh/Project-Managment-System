@echo off
title FYP Dev Environment
color 0A

echo ================================================
echo   FYP System - Local Development Startup
echo ================================================
echo.

:: ── Check Node ───────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo         Download it from https://nodejs.org
  pause & exit /b 1
)
echo [OK] Node.js found

:: ── Check MongoDB (optional, only needed for local DB) ───
where mongod >nul 2>&1
if errorlevel 1 (
  echo [WARN] MongoDB not installed locally.
  echo        Backend will use MongoDB Atlas.
  echo        If Atlas is unreachable on this network:
  echo          1. Switch to a mobile hotspot or VPN
  echo          2. Or install MongoDB Community from:
  echo             https://www.mongodb.com/try/download/community
  echo          3. Then edit server\.env:
  echo             Change MONGO_URI to mongodb://localhost:27017/fypSystem
) else (
  echo [OK] MongoDB found locally
  :: Start MongoDB service if not running
  sc query MongoDB >nul 2>&1
  if errorlevel 1 (
    echo [INFO] Starting MongoDB service...
    net start MongoDB >nul 2>&1
  ) else (
    echo [OK] MongoDB service is running
  )
)

echo.
echo ── Checking dependencies ────────────────────────
if not exist "node_modules" (
  echo [INFO] Installing root dependencies...
  npm install
)
if not exist "server\node_modules" (
  echo [INFO] Installing server dependencies...
  cd server && npm install && cd ..
)
echo [OK] Dependencies ready

echo.
echo ── Starting servers ─────────────────────────────
echo   Frontend : http://localhost:8080
echo   Backend  : http://localhost:5000
echo   API Test : http://localhost:5000/api/test
echo.
echo Press Ctrl+C to stop all servers.
echo ================================================
echo.

:: Start backend in a new window
start "FYP Backend (port 5000)" cmd /k "cd /d %~dp0server && npm run dev"

:: Small delay so backend starts first
timeout /t 2 /nobreak >nul

:: Start frontend in this window
npm run dev

pause
