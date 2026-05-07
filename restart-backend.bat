@echo off
echo Stopping existing backend servers...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq server*" 2>nul

echo Waiting...
timeout /t 2 /nobreak >nul

echo Starting backend server...
cd server
start "Backend Server" cmd /k "node server.js"

echo Backend server started in a new window!
