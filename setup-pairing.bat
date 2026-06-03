@echo off
REM NEGO-CLAN Bot Pairing Setup Script for Windows
REM This batch file helps you pair your bot with WhatsApp using a pairing code

echo.
echo ╔════════════════════════════════════════╗
echo ║   NEGO-TECH Bot Pairing Code Setup      ║
echo ║          Windows Edition                ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if phone number is provided
if "%1"=="" (
    echo ❌ Error: Phone number required
    echo.
    echo Usage: setup-pairing.bat ^<phone_number^>
    echo.
    echo Examples:
    echo   setup-pairing.bat 923051391005    (for +92 country code - Pakistan)
    echo   setup-pairing.bat 2348123456789   (for +234 country code - Nigeria)
    echo   setup-pairing.bat 919876543210    (for +91 country code - India)
    echo.
    echo 📋 Format: Enter phone number WITHOUT + symbol or spaces
    echo.
    pause
    exit /b 1
)

set PHONE_NUMBER=%1

REM Check if only numbers in phone number
for /f "delims=0123456789" %%A in ("%PHONE_NUMBER%") do (
    echo ❌ Error: Invalid phone number format
    echo    Phone number should contain only digits (10-15 characters)
    echo.
    pause
    exit /b 1
)

REM Check length (minimum 10 digits)
if %PHONE_NUMBER% LEQ 9999999999 (
    if %PHONE_NUMBER% GTR 999999999 (
        goto :valid
    )
)

if %PHONE_NUMBER% GEQ 10000000000 (
    goto :valid
)

echo ❌ Error: Invalid phone number format
echo    Phone number should be between 10-15 digits
echo.
pause
exit /b 1

:valid
echo 📱 Phone Number: +%PHONE_NUMBER%
echo.
echo Starting bot with pairing code mode...
echo.

REM Set environment variables
set PAIRING_NUMBER=%PHONE_NUMBER%
set NODE_ENV=production

REM Start the bot
node index.js --pairing-code

REM Check if bot started successfully
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Bot failed to start
    echo.
    pause
    exit /b 1
)

pause
