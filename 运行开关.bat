@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
echo 正在启动/停止 silk-studio-web...
echo 如果报错，请把这个文件发给我看：
echo %~dp0run-switch.log
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-switch.ps1"
echo.
pause
