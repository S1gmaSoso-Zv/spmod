
[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "           spmod Uninstaller             " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Stopping processes..." -ForegroundColor Yellow
Stop-Process -Name Spotify -Force -ErrorAction SilentlyContinue
Stop-Process -Name SpotifyCompanionDaemon -Force -ErrorAction SilentlyContinue

try {
    $netstat = netstat -ano | Select-String ":43821.+LISTENING"
    foreach ($line in $netstat) {
        $parts = $line.Line.Trim() -split '\s+'
        $pidToKill = $parts[-1]
        if ($pidToKill -match '^\d+$') {
            Stop-Process -Id ([int]$pidToKill) -Force -ErrorAction SilentlyContinue
        }
    }
} catch {}

Write-Host "[2/4] Removing Startup shortcut..." -ForegroundColor Yellow
$startupFolder = [Environment]::GetFolderPath("Startup")
foreach ($lnk in @("spmod.lnk", "SpotifyModCompanion.lnk")) {
    $shortcut = "$startupFolder\$lnk"
    if (Test-Path $shortcut) {
        Remove-Item $shortcut -Force -ErrorAction SilentlyContinue
        Write-Host "      Removed: $shortcut" -ForegroundColor Green
    }
}

Write-Host "[3/4] Restoring original Spotify xpui.spa..." -ForegroundColor Yellow
$spotifyDirs = @(
    "$env:APPDATA\Spotify",
    "$env:LOCALAPPDATA\Spotify",
    "C:\Program Files\Spotify"
)

$restored = $false
foreach ($dir in $spotifyDirs) {
    $spa = "$dir\Apps\xpui.spa"
    $bak = "$spa.bak"
    if (Test-Path $bak) {
        Copy-Item $bak $spa -Force
        Remove-Item $bak -Force
        Write-Host "      Restored pristine xpui.spa from backup in $dir" -ForegroundColor Green
        $restored = $true
        break
    }
}

if (-not $restored) {
    Write-Host "      No xpui.spa.bak found. If Spotify has issues, run Spotify installer to refresh." -ForegroundColor Yellow
}

Write-Host "[4/4] Clearing browser cache..." -ForegroundColor Yellow
$cache = "$env:LOCALAPPDATA\Spotify\Browser\Cache"
if (Test-Path $cache) {
    Remove-Item "$cache\*" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`nSpotify Mod successfully uninstalled!" -ForegroundColor Green
