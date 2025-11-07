@echo off
echo ========================================
echo   Sicily Live Map - Local Server
echo ========================================
echo.
echo Starting HTTP server on port 8080...
echo Opening browser automatically...
echo.
echo Press Ctrl+C to stop the server
echo.
timeout /t 2 /nobreak >nul
start http://localhost:8080
npx http-server . -p 8080

