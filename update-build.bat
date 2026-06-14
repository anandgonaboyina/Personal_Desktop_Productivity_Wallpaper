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
    exit
)

:run_update
(
REM Ensure we are in the script's directory
cd /d "%~dp0"

echo ============================================================================
echo.
echo      ___  _  _  ___  _  _  ___     _  _  _  _  __  __  ___  ___ 
echo     / _ \^| \^| ^|/ _ \^| \^| ^|^|   \   ^| ^|/ /^| ^|^| ^|^|  \/  ^|/ _ \^| _ \ 
echo    ^|  _  ^| .  ^|  _  ^| .  ^|^| ^|^) ^|  ^|   ^< ^| \/ ^|^| ^|\/^| ^|  _  ^|   / 
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

echo CHECKING DEPENDENCIES...
git --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Git is missing! Installing Git automatically via winget...
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    if %errorLevel% neq 0 (
        echo ERROR: Failed to install Git automatically.
        echo Please install it manually from https://git-scm.com/ and try again.
        pause
        exit /b 1
    )
    echo Git installed successfully!
    REM Temporarily add Git to the current session's PATH so the script can continue immediately
    set "PATH=%PATH%;C:\Program Files\Git\cmd"
) else (
    echo Git is already installed.
)

echo.
echo [1/5] STOPPING BACKGROUND SERVER AND WALLPAPER...
call taskkill /F /IM livelywpf.exe >nul 2>&1
call taskkill /F /IM Lively.exe >nul 2>&1
call npx -y kill-port 4321
echo Server and Wallpaper stopped.

echo.
echo [2/5] BACKING UP DATABASE TO PREVENT DATA LOSS...
if exist "prisma\dev.db" (
    copy /y prisma\dev.db prisma\dev.db.backup >nul
    echo Database backed up safely.
) else (
    echo No database found to backup.
)

echo.
echo [3/5] PULLING LATEST UPDATE FROM GITHUB...

:: Ensure it is a git repository before pulling
if not exist ".git" (
    echo Initializing local git repository for OTA updates...
    git init
    git remote add origin https://github.com/anandgonaboyina/Personal_Desktop_Productivity_Wallpaper.git
    git branch -M main
) else (
    :: Just to be safe, set the remote URL in case it's missing
    git remote set-url origin https://github.com/anandgonaboyina/Personal_Desktop_Productivity_Wallpaper.git >nul 2>&1
)

call git fetch origin
call git reset --hard origin/main
echo Update pulled successfully.

echo.
echo [4/5] RESTORING DATABASE...
if exist "prisma\dev.db.backup" (
    copy /y prisma\dev.db.backup prisma\dev.db >nul
    echo Database restored successfully.
)

echo.
echo [5/5] REBUILDING DASHBOARD SOURCE CODE...
if exist ".next" rmdir /s /q ".next"
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
echo Rebooting the background server now...
start wscript "start-server.vbs" "nowait"
echo.
echo Server is starting up in the background!
echo Waiting 10 seconds before starting Lively Wallpaper...
timeout /t 10
start wscript "start-lively.vbs" "nowait"
echo.
echo Lively Wallpaper has been started. Update complete!
timeout /t 5
exit
)
