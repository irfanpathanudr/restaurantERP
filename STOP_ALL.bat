@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title Restaurant ERP - Stop All
color 0C

echo.
echo ========================================
echo   Stopping Backend / Frontend / KOT
echo ========================================
echo.

REM Kill node processes started for this project (dev servers on known ports)
for %%P in (5000 3000 3001) do (
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
    echo Stopping process on port %%P ^(PID %%A^)...
    taskkill /F /PID %%A >nul 2>&1
  )
)

echo.
echo Done. Ports 5000, 3000, 3001 should be free.
echo.
pause
endlocal
