@echo off
setlocal EnableDelayedExpansion
color 0B

echo ========================================================
echo       PRODUCTIVE DASHBOARD - AUTO SETUP WIZARD
echo       Made with ❤️ by Anand for More efficiently work every day
echo ========================================================
echo.
echo Welcome! This wizard will completely set up the dashboard,
echo install required software, and configure your local SQLite
echo database (no XAMPP or servers required!).
echo.
echo REQUIREMENTS BEFORE PROCEEDING:
echo - An active INTERNET connection is required right now.
echo.
echo If anything goes wrong during setup, safely close this
echo window and run setup.bat again, but just follow carefully all instructions.
echo.
pause

echo.
echo [1/5] Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Installing via Winget...
    echo You may be prompted for Administrator permissions.
    winget install OpenJS.NodeJS -e --source winget
    
    echo.
    echo ========================================================
    echo IMPORTANT: Node.js has been installed!
    echo However, Windows needs to refresh its environment variables.
    echo Please CLOSE this window, and DOUBLE-CLICK setup.bat again.
    echo ========================================================
    pause
    exit
) else (
    echo Node.js is already installed!
)

echo.
echo [2/5] Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Failed to install dependencies. Please check your internet connection.
    pause
    exit
)

echo.
echo [3/5] Configuring local SQLite database (Zero Setup Required!)...
echo Don't worry, SQLite is incredibly safe and stores all your data securely in a local file.
call npx prisma generate
call npx prisma db push
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Database setup failed.
    pause
    exit
)

echo.
echo [4/5] Building the dashboard for production...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Failed to build the dashboard.
    pause
    exit
)

echo.
echo [5/5] Configuring Automatic Background Startup...
:: Generate the VBS script with the absolute path of the current directory
set "CURRENT_DIR=%~dp0"
:: Remove trailing backslash if present
if "%CURRENT_DIR:~-1%"=="\" set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"

echo Set WshShell = CreateObject("WScript.Shell") > start_hidden.vbs
echo WshShell.CurrentDirectory = "%CURRENT_DIR%" >> start_hidden.vbs
echo WshShell.Run "npm start", 0, False >> start_hidden.vbs

:: Copy to Windows Startup folder
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
copy /Y "start_hidden.vbs" "%STARTUP_FOLDER%\ProductiveDashboard.vbs" >nul

echo Startup script copied to your Startup folder successfully!

echo.
echo ========================================================
echo                 SETUP COMPLETE!
echo ========================================================
echo The dashboard is now fully installed and configured.
echo It will automatically start silently every time you turn
echo on your PC.
echo.
echo [ HOW TO START AND TEST ]
echo 1. To start it RIGHT NOW without rebooting:
echo    Double-click the 'start_hidden.vbs' file in this folder.
echo.
echo 2. Check if it is working by opening your normal web
echo    browser (Chrome/Edge) and going to:
echo    http://localhost:3000
echo.
echo [ LIVELY WALLPAPER SETUP ]
echo 1. Open Lively Wallpaper.
echo 2. Click 'Add Wallpaper' (+) at the top right.
echo 3. Choose 'Enter URL' and type: http://localhost:3000
echo 4. Click the arrow to save and apply.
echo.
echo [ TROUBLESHOOTING TIP ]
echo If you are using Lively Wallpaper and a button or element
echo is not responding to your click, simply click on an empty
echo space or another element first to regain focus, then click
echo again. It will work!
echo.
echo Enjoy your Productive Dashboard!
echo ========================================================
pause
