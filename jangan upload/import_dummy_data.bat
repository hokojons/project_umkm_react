@echo off
echo ============================================
echo Import Data Dummy - Produk UMKM dan Acara
echo ============================================
echo.

REM Coba path MySQL yang berbeda
set MYSQL_PATH1=C:\xampp\mysql\bin\mysql.exe
set MYSQL_PATH2=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
set MYSQL_PATH3=C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe

echo Mencari MySQL...
if exist "%MYSQL_PATH1%" (
    echo Found MySQL di XAMPP
    set MYSQL_CMD=%MYSQL_PATH1%
    goto :run_import
)

if exist "%MYSQL_PATH2%" (
    echo Found MySQL Server 8.0
    set MYSQL_CMD=%MYSQL_PATH2%
    goto :run_import
)

if exist "%MYSQL_PATH3%" (
    echo Found MySQL Server 5.7
    set MYSQL_CMD=%MYSQL_PATH3%
    goto :run_import
)

echo ERROR: MySQL tidak ditemukan!
echo Silakan install XAMPP atau MySQL Server
pause
exit /b 1

:run_import
echo.
echo Mengimport data dummy ke database dbumkm...
echo.
"%MYSQL_CMD%" -u root dbumkm < "dummy_data_products_events.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo SUCCESS! Data dummy berhasil diimport
    echo ============================================
    echo.
    echo Data yang berhasil ditambahkan:
    echo - 8 UMKM Businesses
    echo - 50+ Produk UMKM
    echo - 15+ Events/Acara
    echo.
) else (
    echo.
    echo ============================================
    echo ERROR! Import gagal
    echo ============================================
    echo.
)

pause
