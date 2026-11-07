@echo off
title Spotify Mod Installer
echo ===================================================
echo             Spotify Mod Auto-Installer
echo ===================================================
echo.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; if (Test-Path '.\install.ps1') { & '.\install.ps1' } else { Write-Host 'Fetching installer...' -ForegroundColor Cyan; irm 'https://raw.githubusercontent.com/YourUsername/spotify-mod/main/install.ps1' | iex } }"
echo.
pause
