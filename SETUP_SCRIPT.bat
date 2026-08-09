@echo off
REM ================================
REM First-time setup (MySQL + migrate + seed)
REM Dependencies install once at ROOT (npm workspaces)
REM ================================

setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo ========================================
echo Restaurant ERP - Complete Setup Script
echo ========================================
echo.

if not exist "backend" (
    echo ERROR: Please run this script from the project root directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: Frontend folder not found
    pause
    exit /b 1
)

if not exist "kot" (
    echo ERROR: KOT folder not found
    pause
    exit /b 1
)

echo [Step 1/6] Checking MySQL...
mysql -u root -e "SELECT VERSION();" >nul 2>&1
if errorlevel 1 (
    echo ERROR: MySQL is not running or not accessible
    echo Please start MySQL service and try again
    echo.
    echo To start MySQL:
    echo   net start MySQL80
    echo.
    pause
    exit /b 1
)
echo SUCCESS: MySQL is running
echo.

echo [Step 2/6] Creating database if not exists...
REM Read DB_NAME from backend/.env if available, fallback to restaurant_erp
set "DB_NAME=restaurant_erp"
if exist "backend\.env" (
  for /f "usebackq tokens=1,* delims==" %%A in (`findstr /B /C:"DB_NAME=" "backend\.env"`) do set "DB_NAME=%%B"
)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;"
if errorlevel 1 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)
echo SUCCESS: Database %DB_NAME% ready
echo.

echo [Step 3/6] Cleaning leftover nested node_modules...
if exist "backend\node_modules" rmdir /s /q "backend\node_modules"
if exist "frontend\node_modules" rmdir /s /q "frontend\node_modules"
if exist "kot\node_modules" rmdir /s /q "kot\node_modules"
echo SUCCESS: Nested folders cleaned
echo.

echo [Step 4/6] Installing workspace dependencies at ROOT...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo SUCCESS: Root node_modules ready
echo.

echo [Step 5/6] Running database migrations...
call npm run migration:run
if errorlevel 1 (
    echo ERROR: Migration failed
    pause
    exit /b 1
)
echo SUCCESS: Migrations completed
echo.

echo [Step 6/6] Seeding database...
REM Only seed if seeder_logs has fewer than 10 entries (fresh DB or incomplete seed)
set "SEED_COUNT=0"
for /f %%C in ('mysql -u root -D %DB_NAME% -s -N -e "SELECT COUNT(*) FROM seeder_logs" 2^>nul') do set "SEED_COUNT=%%C"

if "%SEED_COUNT%"=="10" (
    echo SKIP: All 10 seeders already applied ^(seeder_logs has 10 entries^)
    echo       Delete rows from seeder_logs table to force re-seed.
) else (
    echo Running seed ^(found %SEED_COUNT%/10 seeder_logs entries^)...
    call npm run seed
    if errorlevel 1 (
        echo ERROR: Seeding failed
        pause
        exit /b 1
    )
    echo SUCCESS: Database seeded
)
echo.

echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Next step: double-click START_ALL.bat
echo.
echo URLs after start:
echo   Frontend : http://localhost:3000
echo   KOT      : http://localhost:3001
echo   Backend  : http://localhost:5000
echo.
echo Login: admin@example.com / admin123
echo ========================================
pause
endlocal
