@echo off
chcp 65001 >nul
color 0A
title NaviHive 启动器

:menu
cls
echo ===============================================
echo   NaviHive 启动器 (稳定模式)
echo ===============================================
echo.
echo   [1] 快速启动 (直接预览，不重新构建)
echo       * 适用于未修改代码，仅需重启的情况
echo.
echo   [2] 构建并启动 (推荐)
echo       * 修改代码后请使用此选项
echo.
echo   [3] 清理缓存并重建
echo   [4] 退出
echo.
echo ===============================================
set /p choice="请选择操作 (1-4): "

if "%choice%"=="1" goto quick_start
if "%choice%"=="2" goto build_start
if "%choice%"=="3" goto clean_restart
if "%choice%"=="4" exit /b 0
goto menu

:quick_start
echo.
echo [启动] 正在检查数据库...
call :init_db
echo [启动] 正在启动预览服务器...
cd /d "%~dp0"
call :kill_processes
start "NaviHive Stable Server" cmd /c "pnpm run preview"
goto open_browser

:build_start
echo.
echo [启动] 正在检查数据库...
call :init_db
echo [启动] 正在构建项目...
cd /d "%~dp0"
call :kill_processes
start "NaviHive Stable Server" cmd /c "pnpm run build && pnpm run preview"
echo.
echo [提示] 构建可能需要几十秒，请稍候...
goto open_browser

:clean_restart
echo.
echo [清理] 正在清理缓存...
cd /d "%~dp0"
call :kill_processes
if exist "node_modules\.vite" rmdir /S /Q "node_modules\.vite"
if exist "node_modules\.cache" rmdir /S /Q "node_modules\.cache"
if exist "dist" rmdir /S /Q "dist"
if exist ".vite" rmdir /S /Q ".vite"
del /F /Q "*.tsbuildinfo" 2>nul
echo [清理] 缓存已清理，开始重新构建...
call :init_db
start "NaviHive Stable Server" cmd /c "pnpm run build && pnpm run preview"
goto open_browser

:init_db
echo [DB] 正在验证/初始化本地数据库...
REM 自动应用表结构（安全，含 IF NOT EXISTS）
call npx wrangler d1 execute DB --local --file=init_table.sql >nul 2>&1
REM 自动应用测试数据（安全，已改为 INSERT OR IGNORE）
call npx wrangler d1 execute DB --local --file=test_data.sql >nul 2>&1
echo [DB] 数据库准备就绪
goto :eof

:kill_processes
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM pnpm.exe >nul 2>&1
goto :eof

:open_browser
echo.
echo [完成] 服务器正在启动...
timeout /t 5 /nobreak >nul
start http://localhost:4173
echo.
pause
goto menu
