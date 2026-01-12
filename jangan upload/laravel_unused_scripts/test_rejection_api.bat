@echo off
echo Testing rejection comments API for User ID 13...
echo.

curl -X GET "http://localhost:8000/api/umkm/rejection-comments" -H "X-User-ID: 13" -H "Accept: application/json"

echo.
echo.
echo Done!
pause
