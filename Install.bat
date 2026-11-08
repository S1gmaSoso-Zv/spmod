@echo off
title spmod installer
echo ===================================================
echo                   spmod installer
echo ===================================================
echo.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; if (Test-Path '.\install.ps1') { & '.\install.ps1' } else { Write-Host 'Fetching spmod...' -ForegroundColor Cyan; irm 'https://raw.githubusercontent.com/siggmaxnj/spmod/main/install.ps1' | iex } }"
echo.
pause
