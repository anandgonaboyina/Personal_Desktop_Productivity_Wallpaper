@echo off
title Productive Dashboard - System Updater
color 0B

:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :run_update
) else (
    echo Requesting Administrator Privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:run_update
:: Ensure we are in the script's directory
cd /d "%~dp0"

echo ============================================================================
echo.
echo      ___  _  _  ___  _  _  ___     _  _  _  _  __  __  ___  ___ 
echo     / _ \^| \^| ^|/ _ \^| \^| ^|^|   \   ^| ^|/ /^| ^|^| ^|^|  \/  ^|/ _ \^| _ \ 
echo    ^|  _  ^| .  ^|  _  ^| .  ^|^| ^|) ^|  ^|   ^< ^| \/ ^|^| ^|\/^| ^|  _  ^|   / 
echo    ^|_^| ^|_^|_^|\_^|_^| ^|_^|_^|\_^|^|___/   ^|_^|\_\ \__/ ^|_^|  ^|_^|_^| ^|_^|_^|_\ 
echo.
echo     "Forged from the pain of wasted days and lost potential."
echo     "Built to enforce discipline, reclaim focus, and ensure"
echo     "that every single hour builds a powerful future."
echo.
echo ============================================================================
echo                   PRODUCTIVE DASHBOARD - SYSTEM UPDATER
echo ============================================================================
echo.

echo [1/3] STOPPING BACKGROUND SERVER...
call npx -y kill-port 4321
echo Server stopped.

echo.
echo [2/3] PULLING LATEST UPDATE FROM GITHUB...
call git fetch origin
call git reset --hard origin/main
echo Update pulled successfully.

echo.
echo [3/3] REBUILDING DASHBOARD SOURCE CODE...
call npm run build
if %errorLevel% neq 0 (
    color 0C
    echo.
    echo =======================================================
    echo ERROR: BUILD FAILED
    echo =======================================================
    echo Please check the error logs above.
    pause
    exit /b 1
)

echo.
echo =======================================================
echo UPDATE COMPLETE AND BUILT SUCCESSFULLY!
echo =======================================================
echo The server is currently offline. 
echo PLEASE RESTART YOUR PC NOW to start the updated dashboard.
echo.
echo This window will close automatically in 10 seconds...
timeout /t 10 >nul
exit /b 0
