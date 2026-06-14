@echo off
setlocal EnableDelayedExpansion

:: 1. Auto-Elevate to Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

color 0B

echo ========================================================
echo       PRODUCTIVE DASHBOARD - AUTO SETUP WIZARD
echo ========================================================
echo.
echo     ___    _   __ ___    _   __ ____     __ __ __  __ __  ___ ___    ____ 
echo    /   ^|  / ^| / //   ^|  / ^| / // __ \   / //_// / / //  ^|/  //   ^|  / __ \ 
echo   / /^| ^| /  ^|/ // /^| ^| /  ^|/ // / / /  / ,^<  / / / // /^|_/ // /^| ^| / /_/ / 
echo  / ___ ^|/ /^|  // ___ ^|/ /^|  // /_/ /  / /^| ^|/ /_/ // /  / // ___ ^|/ _, _/ 
echo /_/  ^|_/_/ ^|_//_/  ^|_/_/ ^|_//_____/  /_/ ^|_^\____//_/  /_//_/  ^|_/_/ ^|_^|
echo.
echo       Made with Love by ANAND KUMAR
echo ========================================================
echo.
echo Welcome! This wizard will completely set up the dashboard,
echo install required software, and configure your local SQLite
echo database (no XAMPP or servers required!).
echo.
echo ========================================================
echo [ IMPORTANT: LIVELY WALLPAPER REQUIRED ]
echo While this setup runs, please ensure you download and install
echo the standalone (.exe) version of Lively Wallpaper from here:
echo https://drive.google.com/file/d/1TJWAWPTtTbKNMaNVAwz2GwbSb04NO-J5/view?usp=drive_link
echo ========================================================
echo.
echo REQUIREMENTS BEFORE PROCEEDING:
echo - An active INTERNET connection is required right now.
echo.
echo If anything goes wrong during setup, safely close this
echo window and run setup.bat again.
echo.
:confirmStart
set /p startConfirm="Do you want to proceed with the setup? Type 'yes' to start or 'no' to cancel: "
if /i "!startConfirm!"=="no" exit
if /i not "!startConfirm!"=="yes" goto confirmStart
echo.
echo Stopping any existing background instances to prevent file locks...
call taskkill /F /IM livelywpf.exe >nul 2>&1
call taskkill /F /IM Lively.exe >nul 2>&1
call npx -y kill-port 4321 >nul 2>&1

echo.
echo [1/5] Checking Dependencies (Node.js ^& Git)...

:: Check Node.js
node -v >nul 2>&1
if !errorlevel! neq 0 (
    echo Node.js is not installed. Downloading Official Installer...
    curl -o node-installer.msi https://nodejs.org/dist/v20.14.0/node-v20.14.0-x64.msi
    if !errorlevel! neq 0 (
        echo ERROR: Failed to download Node.js. Check your internet connection.
        pause
        exit /b 1
    )
    echo Installing Node.js silently, this may take a minute...
    start /wait msiexec /i node-installer.msi /quiet /qn /norestart
    echo Node.js installed successfully!
    del node-installer.msi
    
    :: Temporarily add Node to the current session's PATH so the script can continue immediately
    set "PATH=!PATH!;C:\Program Files\nodejs"
) else (
    echo Node.js is already installed!
)

:: Check Git
git --version >nul 2>&1
if !errorlevel! neq 0 (
    echo Git is not installed. Downloading Official Installer...
    curl -L -o git-installer.exe https://github.com/git-for-windows/git/releases/download/v2.45.2.windows.1/Git-2.45.2-64-bit.exe
    if !errorlevel! neq 0 (
        echo ERROR: Failed to download Git. Check your internet connection.
        pause
        exit /b 1
    )
    echo Installing Git silently...
    start /wait "" git-installer.exe /VERYSILENT /NORESTART /NOCANCEL /SP-
    echo Git installed successfully!
    del git-installer.exe
    
    :: Temporarily add Git to the current session's PATH so the script can continue immediately
    set "PATH=!PATH!;C:\Program Files\Git\cmd"
) else (
    echo Git is already installed!
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
echo Creating .env file automatically...
echo DATABASE_URL="file:./dev.db" > .env
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
echo [5/5] Configuring Automatic Background Startup (Task Scheduler)...
echo Finding Lively Wallpaper executable...

set "LIVELY_EXE="

:: 1. Check LocalAppData installation (Standalone Installer - Per User)
if exist "%LOCALAPPDATA%\Programs\Lively Wallpaper\Lively.exe" (
    set "LIVELY_EXE=%LOCALAPPDATA%\Programs\Lively Wallpaper\Lively.exe"
    goto :found_exe
)

:: 2. Check Program Files installation (Standalone Installer - System Wide)
if exist "C:\Program Files\Lively Wallpaper\Lively.exe" (
    set "LIVELY_EXE=C:\Program Files\Lively Wallpaper\Lively.exe"
    goto :found_exe
)
if exist "C:\Program Files (x86)\Lively Wallpaper\Lively.exe" (
    set "LIVELY_EXE=C:\Program Files (x86)\Lively Wallpaper\Lively.exe"
    goto :found_exe
)

:: 3. Check WindowsApps (Microsoft Store Version)
set "LIVELY_APP_DIR="
for /f "tokens=*" %%I in ('dir "C:\Program Files\WindowsApps\*Lively*" /b /a 2^>nul') do (
    set "LIVELY_APP_DIR=%%I"
    goto :found_lively_dir
)
:found_lively_dir

if not "!LIVELY_APP_DIR!"=="" (
    for /f "tokens=*" %%A in ('dir /b /s "C:\Program Files\WindowsApps\!LIVELY_APP_DIR!\Lively.exe" 2^>nul') do (
        set "LIVELY_EXE=%%A"
        goto :found_exe
    )
)

:found_exe

if "!LIVELY_EXE!"=="" (
    color 0C
    echo ERROR: Lively.exe not found!
    echo Checked paths:
    echo - %LOCALAPPDATA%\Programs\Lively Wallpaper\
    echo - C:\Program Files\Lively Wallpaper\
    echo - C:\Program Files\WindowsApps\
    echo.
    echo Please make sure Lively Wallpaper is installed.
    echo Download the standalone installer here:
    echo https://drive.google.com/file/d/1TJWAWPTtTbKNMaNVAwz2GwbSb04NO-J5/view?usp=drive_link
    echo.
    pause
    exit /b
)

echo Found Lively Executable: !LIVELY_EXE!

:: Generate VBS scripts
set "CURRENT_DIR=%~dp0"
if "%CURRENT_DIR:~-1%"=="\" set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"

echo Generating start-server.vbs (30s delay)...
echo Set WshShell = CreateObject("WScript.Shell") > start-server.vbs
echo If WScript.Arguments.Count ^> 0 Then >> start-server.vbs
echo     If WScript.Arguments(0) = "boot" Then >> start-server.vbs
echo         WScript.Sleep 30000 >> start-server.vbs
echo     End If >> start-server.vbs
echo End If >> start-server.vbs
echo WshShell.CurrentDirectory = "%CURRENT_DIR%" >> start-server.vbs
echo WshShell.Run "npm start", 0, False >> start-server.vbs

echo Generating start-lively.vbs (60s delay)...
echo Set WshShell = CreateObject("WScript.Shell") > start-lively.vbs
echo If WScript.Arguments.Count = 0 Then >> start-lively.vbs
echo     WScript.Sleep 60000 >> start-lively.vbs
echo ElseIf WScript.Arguments(0) ^<^> "nowait" Then >> start-lively.vbs
echo     WScript.Sleep 60000 >> start-lively.vbs
echo End If >> start-lively.vbs
echo WshShell.Run """!LIVELY_EXE!""", 0, False >> start-lively.vbs

:: Cleanup old scripts
if exist start.vbs del /f /q start.vbs

:: Remove old startup folder remnants
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
if exist "%STARTUP_FOLDER%\ProductiveDashboard.vbs" del /f /q "%STARTUP_FOLDER%\ProductiveDashboard.vbs"
if exist "%STARTUP_FOLDER%\start_hidden.vbs" del /f /q "%STARTUP_FOLDER%\start_hidden.vbs"

:: Register Tasks
set "TASK_SERVER_XML=%TEMP%\ProductiveDashboardServerTask.xml"
(
echo ^<?xml version="1.0" encoding="UTF-16"?^>
echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^>
echo   ^<RegistrationInfo^>
echo     ^<Description^>Productive Dashboard Server Task^</Description^>
echo   ^</RegistrationInfo^>
echo   ^<Triggers^>
echo     ^<LogonTrigger^>
echo       ^<Enabled^>true^</Enabled^>
echo     ^</LogonTrigger^>
echo   ^</Triggers^>
echo   ^<Principals^>
echo     ^<Principal id="Author"^>
echo       ^<LogonType^>InteractiveToken^</LogonType^>
echo       ^<RunLevel^>HighestAvailable^</RunLevel^>
echo     ^</Principal^>
echo   ^</Principals^>
echo   ^<Settings^>
echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^>
echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^>
echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^>
echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^>
echo     ^<StartWhenAvailable^>true^</StartWhenAvailable^>
echo     ^<RunOnlyIfNetworkAvailable^>false^</RunOnlyIfNetworkAvailable^>
echo     ^<IdleSettings^>
echo       ^<StopOnIdleEnd^>true^</StopOnIdleEnd^>
echo       ^<RestartOnIdle^>false^</RestartOnIdle^>
echo     ^</IdleSettings^>
echo     ^<AllowStartOnDemand^>true^</AllowStartOnDemand^>
echo     ^<Enabled^>true^</Enabled^>
echo     ^<Hidden^>false^</Hidden^>
echo     ^<RunOnlyIfIdle^>false^</RunOnlyIfIdle^>
echo     ^<WakeToRun^>false^</WakeToRun^>
echo     ^<ExecutionTimeLimit^>PT0S^</ExecutionTimeLimit^>
echo     ^<Priority^>7^</Priority^>
echo     ^<RestartOnFailure^>
echo       ^<Interval^>PT1M^</Interval^>
echo       ^<Count^>3^</Count^>
echo     ^</RestartOnFailure^>
echo   ^</Settings^>
echo   ^<Actions Context="Author"^>
echo     ^<Exec^>
echo       ^<Command^>wscript.exe^</Command^>
echo       ^<Arguments^>"%CURRENT_DIR%\start-server.vbs" "boot"^</Arguments^>
echo       ^<WorkingDirectory^>%CURRENT_DIR%^</WorkingDirectory^>
echo     ^</Exec^>
echo   ^</Actions^>
echo ^</Task^>
) > "%TASK_SERVER_XML%"

set "TASK_LIVELY_XML=%TEMP%\ProductiveDashboardLivelyTask.xml"
(
echo ^<?xml version="1.0" encoding="UTF-16"?^>
echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^>
echo   ^<RegistrationInfo^>
echo     ^<Description^>Productive Dashboard Lively Task^</Description^>
echo   ^</RegistrationInfo^>
echo   ^<Triggers^>
echo     ^<LogonTrigger^>
echo       ^<Enabled^>true^</Enabled^>
echo     ^</LogonTrigger^>
echo   ^</Triggers^>
echo   ^<Principals^>
echo     ^<Principal id="Author"^>
echo       ^<LogonType^>InteractiveToken^</LogonType^>
echo       ^<RunLevel^>HighestAvailable^</RunLevel^>
echo     ^</Principal^>
echo   ^</Principals^>
echo   ^<Settings^>
echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^>
echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^>
echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^>
echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^>
echo     ^<StartWhenAvailable^>true^</StartWhenAvailable^>
echo     ^<RunOnlyIfNetworkAvailable^>false^</RunOnlyIfNetworkAvailable^>
echo     ^<IdleSettings^>
echo       ^<StopOnIdleEnd^>true^</StopOnIdleEnd^>
echo       ^<RestartOnIdle^>false^</RestartOnIdle^>
echo     ^</IdleSettings^>
echo     ^<AllowStartOnDemand^>true^</AllowStartOnDemand^>
echo     ^<Enabled^>true^</Enabled^>
echo     ^<Hidden^>false^</Hidden^>
echo     ^<RunOnlyIfIdle^>false^</RunOnlyIfIdle^>
echo     ^<WakeToRun^>false^</WakeToRun^>
echo     ^<ExecutionTimeLimit^>PT0S^</ExecutionTimeLimit^>
echo     ^<Priority^>7^</Priority^>
echo     ^<RestartOnFailure^>
echo       ^<Interval^>PT1M^</Interval^>
echo       ^<Count^>3^</Count^>
echo     ^</RestartOnFailure^>
echo   ^</Settings^>
echo   ^<Actions Context="Author"^>
echo     ^<Exec^>
echo       ^<Command^>wscript.exe^</Command^>
echo       ^<Arguments^>"%CURRENT_DIR%\start-lively.vbs"^</Arguments^>
echo       ^<WorkingDirectory^>%CURRENT_DIR%^</WorkingDirectory^>
echo     ^</Exec^>
echo   ^</Actions^>
echo ^</Task^>
) > "%TASK_LIVELY_XML%"

schtasks /create /tn "ProductiveDashboard_Server" /xml "%TASK_SERVER_XML%" /f
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Failed to register Task Scheduler server task.
    del /f /q "%TASK_SERVER_XML%"
    del /f /q "%TASK_LIVELY_XML%"
    pause
    exit /b
)

schtasks /create /tn "ProductiveDashboard_Lively" /xml "%TASK_LIVELY_XML%" /f
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Failed to register Task Scheduler lively task.
    del /f /q "%TASK_SERVER_XML%"
    del /f /q "%TASK_LIVELY_XML%"
    pause
    exit /b
)

del /f /q "%TASK_SERVER_XML%"
del /f /q "%TASK_LIVELY_XML%"

echo Tasks registered successfully!

echo.
echo ========================================================
echo                 SETUP COMPLETE!
echo ========================================================
echo The dashboard is now fully installed and configured.
echo We have separated the startup into two background tasks:
echo 1. start-server.vbs (Starts Next.js server with 30s delay)
echo 2. start-lively.vbs (Starts Lively Wallpaper with 60s delay)
echo.
echo These are scheduled via Windows Task Scheduler to run
echo automatically whenever you start your computer.
echo.
echo Starting the dashboard server now...
start wscript "start-server.vbs"
echo Server is starting up in the background!
echo.
echo ========================================================
echo                 CRITICAL NEXT STEPS!
echo ========================================================
echo Please read the following instructions carefully from here.
echo.

:confirmRead
set /p readConfirm="Type 'ok' to continue to the final instructions: "
if /i not "!readConfirm!"=="ok" goto confirmRead

echo.
echo [ 1. VERIFY THE SERVER IS RUNNING ]
echo The server is running in the background. You can check it 
echo by opening Chrome or Edge and going to this URL:
echo http://localhost:4321
echo.
echo Wait a few seconds for it to load. Once you see the dashboard
echo in your browser, proceed to the next step.
echo.

:confirmBrowser
set /p browserConfirm="Did you see the dashboard in your browser? Type 'yes' to continue: "
if /i not "!browserConfirm!"=="yes" goto confirmBrowser

echo.
echo [ 2. LIVELY WALLPAPER SETUP (IF NOT DONE YET) ]
echo If you haven't installed Lively Wallpaper yet, please 
echo download the standalone version using this link:
echo https://drive.google.com/file/d/1TJWAWPTtTbKNMaNVAwz2GwbSb04NO-J5/view?usp=drive_link
echo.
echo Once installed:
echo 1. Open Lively Wallpaper.
echo 2. Click 'Add Wallpaper' (+) at the top right.
echo 3. Choose 'Enter URL' and type: http://localhost:4321
echo 4. Click the arrow to save and apply.
echo ========================================================
echo.

:confirmLively
set /p livelyConfirm="Have you downloaded and installed Lively Wallpaper using the provided link? Type 'yes' to confirm: "
if /i not "!livelyConfirm!"=="yes" goto confirmLively

echo.
:confirm
set /p userConfirm="Have you read everything carefully? Type 'yes' to close this window: "
if /i not "!userConfirm!"=="yes" goto confirm

exit
