@echo off
echo ============================================================
echo   Restaurant ERP - MySQL Database Setup
echo ============================================================
echo.

REM Check if MySQL is installed
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not installed or not in PATH
    echo.
    echo Please install MySQL 8.0 from:
    echo https://dev.mysql.com/downloads/installer/
    echo.
    pause
    exit /b 1
)

echo MySQL found! Setting up database...
echo.

REM Prompt for MySQL root password
set /p ROOT_PASS="Enter MySQL root password: "
echo.

echo Creating database and user...
echo.

REM Run the SQL setup script
mysql -u root -p%ROOT_PASS% < backend\setup-database.sql

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo   SUCCESS! Database setup complete
    echo ============================================================
    echo.
    echo Database: restaurant_erp
    echo User:     restaurant_user
    echo Password: restaurant_pass
    echo Host:     localhost
    echo Port:     3306
    echo.
    echo Next steps:
    echo 1. cd backend
    echo 2. npm run dev    (Creates tables automatically)
    echo 3. npm run seed   (In new terminal, populates data)
    echo.
) else (
    echo.
    echo ============================================================
    echo   ERROR: Database setup failed
    echo ============================================================
    echo.
    echo Please check:
    echo - MySQL root password is correct
    echo - MySQL service is running
    echo - You have admin privileges
    echo.
)

pause
