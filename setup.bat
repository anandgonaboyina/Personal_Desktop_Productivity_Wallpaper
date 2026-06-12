@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
color 0B

echo ========================================================
echo       PRODUCTIVE DASHBOARD - AUTO SETUP WIZARD
echo       Made with Love by Anand for More efficiently work every day
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
echo Setting up a robust background task with highest privileges.
echo This task includes a 3-strike retry policy: if the dashboard fails
echo to start, it will automatically restart up to 3 times (1 minute apart).
echo Old startup folder remnants are being removed...

:: Generate the VBS script with the absolute path of the current directory
set "CURRENT_DIR=%~dp0"
:: Remove trailing backslash if present
if "%CURRENT_DIR:~-1%"=="\" set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"

echo Set WshShell = CreateObject("WScript.Shell") > start.vbs
echo WshShell.CurrentDirectory = "%CURRENT_DIR%" >> start.vbs
echo WshShell.Run "npm start", 0, False >> start.vbs
echo WScript.Sleep 30000 >> start.vbs
echo Set oFSO = CreateObject("Scripting.FileSystemObject") >> start.vbs
echo livelyPath = "" >> start.vbs
echo localAppData = WshShell.ExpandEnvironmentStrings("%%LOCALAPPDATA%%") >> start.vbs
echo path1 = localAppData ^& "\Programs\Lively Wallpaper\Lively.exe" >> start.vbs
echo If oFSO.FileExists(path1) Then >> start.vbs
echo     livelyPath = path1 >> start.vbs
echo Else >> start.vbs
echo     windowsApps = "C:\Program Files\WindowsApps" >> start.vbs
echo     If oFSO.FolderExists(windowsApps) Then >> start.vbs
echo         On Error Resume Next >> start.vbs
echo         For Each subFolder In oFSO.GetFolder(windowsApps).SubFolders >> start.vbs
echo             If InStr(1, subFolder.Name, "LivelyWallpaper", 1) ^> 0 Then >> start.vbs
echo                 If oFSO.FileExists(subFolder.Path ^& "\Build\Lively.exe") Then >> start.vbs
echo                     livelyPath = subFolder.Path ^& "\Build\Lively.exe" >> start.vbs
echo                     Exit For >> start.vbs
echo                 ElseIf oFSO.FileExists(subFolder.Path ^& "\Lively.exe") Then >> start.vbs
echo                     livelyPath = subFolder.Path ^& "\Lively.exe" >> start.vbs
echo                     Exit For >> start.vbs
echo                 End If >> start.vbs
echo             End If >> start.vbs
echo         Next >> start.vbs
echo         On Error GoTo 0 >> start.vbs
echo     End If >> start.vbs
echo End If >> start.vbs
echo If livelyPath ^<^> "" Then >> start.vbs
echo     WshShell.Run Chr(34) ^& livelyPath ^& Chr(34), 0, False >> start.vbs
echo End If >> start.vbs

:: Remove old startup folder remnants
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
if exist "%STARTUP_FOLDER%\ProductiveDashboard.vbs" (
    del /f /q "%STARTUP_FOLDER%\ProductiveDashboard.vbs"
)
if exist "%STARTUP_FOLDER%\start_hidden.vbs" (
    del /f /q "%STARTUP_FOLDER%\start_hidden.vbs"
)

:: Create Task Scheduler XML config
set "TASK_XML=%TEMP%\ProductiveDashboardTask.xml"
(
echo ^<?xml version="1.0" encoding="UTF-16"?^>
echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^>
echo   ^<RegistrationInfo^>
echo     ^<Description^>Productive Dashboard Background Task with 3-strike retry policy^</Description^>
echo   ^</RegistrationInfo^>
echo   ^<Triggers^>
echo     ^<LogonTrigger^>
echo       ^<Enabled^>true^</Enabled^>
echo     ^</LogonTrigger^>
echo   ^</Triggers^>
echo   ^<Principals^>
echo     ^<Principal id="Author"^>
echo       ^<LogonType^>InteractiveToken^</LogonType^>
echo       ^<RunLevel^>LeastPrivilege^</RunLevel^>
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
echo       ^<Arguments^>"%CURRENT_DIR%\start.vbs"^</Arguments^>
echo       ^<WorkingDirectory^>%CURRENT_DIR%^</WorkingDirectory^>
echo     ^</Exec^>
echo   ^</Actions^>
echo ^</Task^>
) > "%TASK_XML%"

:: Register the task using XML
schtasks /create /tn "ProductiveDashboard" /xml "%TASK_XML%" /f
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Failed to register Task Scheduler background task.
    echo Please try right-clicking setup.bat and selecting "Run as Administrator".
    del /f /q "%TASK_XML%"
    pause
    exit
)
del /f /q "%TASK_XML%"

echo Task registered successfully with a 3-strike retry policy!

echo.
echo ========================================================
echo                 SETUP COMPLETE!
echo ========================================================
echo The dashboard is now fully installed and configured.
echo It will automatically start silently every time you turn
echo on your PC using Windows Task Scheduler.
echo.
echo [ HOW TO START AND TEST ]
echo 1. To start it RIGHT NOW without rebooting:
echo    Double-click the 'start.vbs' file in this folder.
echo.
echo 2. Check if it is working by opening your normal web
echo    browser (Chrome/Edge) and going to:
echo    http://localhost:4321
echo.
echo [ LIVELY WALLPAPER SETUP ]
echo 1. Open Lively Wallpaper.
echo 2. Click 'Add Wallpaper' (+) at the top right.
echo 3. Choose 'Enter URL' and type: http://localhost:4321
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
