@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell.exe -NoProfile -Command "try { $preview = Invoke-RestMethod -Uri 'http://127.0.0.1:5173/__health' -TimeoutSec 2; if ($preview.app -eq 'photocraft-local') { Start-Process 'http://127.0.0.1:5173/'; exit 0 } } catch {}; exit 1"
if %errorlevel%==0 exit /b 0
echo PhotoCraft 本地预览：http://127.0.0.1:5173
echo 修改 src 中的文件并保存，页面会自动刷新。
echo 关闭此窗口或按 Ctrl+C 可以停止本地服务。
call npm.cmd run dev
pause
