@echo off
echo ========================================
echo TEST KONEKSI API BACKEND
echo ========================================
echo.

echo Checking if Laravel server is running...
curl -s http://localhost:8000 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Laravel server is NOT running!
    echo.
    echo Please start Laravel server first:
    echo cd Laravel
    echo php artisan serve
    echo.
    pause
    exit /b 1
)
echo [OK] Laravel server is running
echo.

echo ========================================
echo Testing API Endpoints...
echo ========================================
echo.

echo [1] Testing GET /api/categories
curl -s http://localhost:8000/api/categories | findstr "success"
if %errorlevel% equ 0 (
    echo [OK] Categories endpoint working
) else (
    echo [ERROR] Categories endpoint failed
)
echo.

echo [2] Testing GET /api/umkm
curl -s http://localhost:8000/api/umkm | findstr "success"
if %errorlevel% equ 0 (
    echo [OK] UMKM endpoint working
) else (
    echo [ERROR] UMKM endpoint failed
)
echo.

echo [3] Testing GET /api/events
curl -s http://localhost:8000/api/events | findstr "success"
if %errorlevel% equ 0 (
    echo [OK] Events endpoint working
) else (
    echo [ERROR] Events endpoint failed
)
echo.

echo [4] Testing POST /api/auth/login (Admin)
curl -s -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}" | findstr "success"
if %errorlevel% equ 0 (
    echo [OK] Login endpoint working
) else (
    echo [ERROR] Login endpoint failed
)
echo.

echo ========================================
echo TEST COMPLETE!
echo ========================================
echo.
echo If all tests passed, your backend is ready!
echo Now you can start the React frontend:
echo   cd React
echo   npm run dev
echo.
pause
