@echo off
echo ========================================
echo SETUP KONEKSI BACKEND DAN DATABASE
echo ========================================
echo.

echo [1/5] Checking MySQL Status...
netstat -ano | findstr :3306 >nul
if %errorlevel% equ 0 (
    echo [OK] MySQL is running on port 3306
) else (
    echo [ERROR] MySQL is NOT running!
    echo Please start MySQL from XAMPP Control Panel
    pause
    exit /b 1
)
echo.

echo [2/5] Checking Laravel .env file...
if exist "Laravel\.env" (
    echo [OK] Laravel .env file exists
) else (
    echo [WARNING] Laravel .env file NOT found!
    echo Creating .env from template...
    copy "Laravel\.env.template" "Laravel\.env"
    echo.
    echo [ACTION REQUIRED] Please run this command to generate APP_KEY:
    echo cd Laravel
    echo php artisan key:generate
    echo.
    pause
)
echo.

echo [3/5] Testing Database Connection...
cd Laravel
php artisan db:show
if %errorlevel% equ 0 (
    echo [OK] Database connection successful!
) else (
    echo [ERROR] Cannot connect to database!
    echo.
    echo Troubleshooting:
    echo 1. Make sure MySQL is running in XAMPP
    echo 2. Check database 'dbumkm' exists in phpMyAdmin
    echo 3. Verify .env settings:
    echo    DB_DATABASE=dbumkm
    echo    DB_USERNAME=root
    echo    DB_PASSWORD=
    echo.
    pause
    exit /b 1
)
cd ..
echo.

echo [4/5] Checking React .env file...
if exist "React\.env" (
    echo [OK] React .env file exists
    type "React\.env"
) else (
    echo [WARNING] React .env file NOT found!
    echo Creating .env...
    echo VITE_API_BASE_URL=http://localhost:8000/api > "React\.env"
    echo VITE_MOCK_MODE=false >> "React\.env"
    echo [OK] React .env created
)
echo.

echo [5/5] Checking Laravel Routes...
cd Laravel
echo Checking API routes...
php artisan route:list --path=api | findstr "auth umkm products categories"
cd ..
echo.

echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Start Laravel backend:
echo    cd Laravel
echo    php artisan serve
echo.
echo 2. Start React frontend (in new terminal):
echo    cd React
echo    npm run dev
echo.
echo 3. Open browser: http://localhost:5173
echo.
pause
