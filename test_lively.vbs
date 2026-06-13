Set WshShell = CreateObject("WScript.Shell")
psCmd = "powershell -WindowStyle Hidden -Command "Get-AppxPackage -Name *LivelyWallpaper* | ForEach-Object { Start-Process explorer.exe -ArgumentList ('shell:AppsFolder\' + $_.PackageFamilyName + '!App') }""
WshShell.Run psCmd, 0, False
