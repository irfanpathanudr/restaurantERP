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

echo [Step 2/6] Creating database...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS restaurant_erp;"
if errorlevel 1 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)
echo SUCCESS: Database created
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
call npm run seed
if errorlevel 1 (
    echo ERROR: Seeding failed
    pause
    exit /b 1
)
echo SUCCESS: Database seeded
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
