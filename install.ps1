# install.ps1 - Universal One-Click Installer for Spotify Mod
# Supports both one-liner (irm ... | iex) and local run (Install.bat)
[CmdletBinding()]
param(
    [string]$TargetDir = "$env:APPDATA\SpotifyMod",
    [switch]$ForceReinstall
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "           Spotify Mod - Universal Installer              " -ForegroundColor Cyan
Write-Host "   (Zero Ads + Offline Downloader + Auto Proxy Detection) " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# -------------------------------------------------------------
# 1. Determine Working Directory
# -------------------------------------------------------------
$isRemote = [string]::IsNullOrEmpty($PSScriptRoot)
$modRoot = if ($isRemote) { $TargetDir } else { $PSScriptRoot }

if ($isRemote) {
    Write-Host "`n[1/8] Running via Web One-Liner. Setting up mod directory..." -ForegroundColor Yellow
    if (-not (Test-Path $modRoot)) {
        New-Item -ItemType Directory -Path $modRoot -Force | Out-Null
    }
    # Download latest repository / release payload into $modRoot if running purely in-memory
    Write-Host "      Target directory: $modRoot" -ForegroundColor Green
} else {
    Write-Host "`n[1/8] Local installer running from: $modRoot" -ForegroundColor Green
}

# -------------------------------------------------------------
# 2. Locate or Install Spotify
# -------------------------------------------------------------
Write-Host "`n[2/8] Detecting Spotify installation..." -ForegroundColor Yellow

# Check for Microsoft Store version (blocks mods due to sandbox)
$storeApp = Get-AppxPackage -Name "*Spotify*" -ErrorAction SilentlyContinue
if ($storeApp) {
    Write-Host "      WARNING: Microsoft Store version of Spotify detected!" -ForegroundColor Red
    Write-Host "      Store version blocks modifications. Recommended: install official Win32 version." -ForegroundColor Yellow
}

$searchPaths = @(
    "$env:APPDATA\Spotify",
    "$env:LOCALAPPDATA\Spotify",
    "C:\Program Files\Spotify",
    "C:\Program Files (x86)\Spotify"
)

$spotifyDir = $null
foreach ($path in $searchPaths) {
    if ((Test-Path "$path\Spotify.exe") -and (Test-Path "$path\Apps\xpui.spa")) {
        $spotifyDir = $path
        break
    }
}

if (-not $spotifyDir) {
    Write-Host "      Spotify not found. Downloading official Win32 installer..." -ForegroundColor Yellow
    $setupUrl = "https://download.scdn.co/SpotifyFullSetup.exe"
    $tempSetup = "$env:TEMP\SpotifyFullSetup.exe"
    Invoke-WebRequest -Uri $setupUrl -OutFile $tempSetup -UseBasicParsing
    Write-Host "      Installing official Spotify..." -ForegroundColor Yellow
    $inst = Start-Process -FilePath $tempSetup -PassThru
    $inst.WaitForExit()
    Start-Sleep -Seconds 3

    foreach ($path in $searchPaths) {
        if ((Test-Path "$path\Spotify.exe") -and (Test-Path "$path\Apps\xpui.spa")) {
            $spotifyDir = $path
            break
        }
    }
}

if (-not $spotifyDir) {
    Write-Error "Could not find or install Spotify. Please install Spotify Win32 client and run again."
    exit 1
}
Write-Host "      Found Spotify Win32 at: $spotifyDir" -ForegroundColor Green

# -------------------------------------------------------------
# 3. Terminate running Spotify & Companion
# -------------------------------------------------------------
Write-Host "`n[3/8] Closing running Spotify & Companion instances..." -ForegroundColor Yellow
Stop-Process -Name Spotify -Force -ErrorAction SilentlyContinue
Stop-Process -Name SpotifyCompanionDaemon -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# -------------------------------------------------------------
# 4. Repair Permissions, Directories & Crashpad
# -------------------------------------------------------------
Write-Host "`n[4/8] Initializing directories and fixing permissions..." -ForegroundColor Yellow

# Download Directory in Music
$musicDownloadDir = Join-Path ([Environment]::GetFolderPath("MyMusic")) "Spotify Downloads"
if (-not (Test-Path $musicDownloadDir)) {
    New-Item -ItemType Directory -Path $musicDownloadDir -Force | Out-Null
    Write-Host "      Created Music download folder: $musicDownloadDir" -ForegroundColor Green
}

# Crashpad fix (prevents 0x5 Access Denied & 0x6D exit crash)
$crashpadDir = "$env:LOCALAPPDATA\Spotify\User Data\Crashpad"
if (-not (Test-Path $crashpadDir)) {
    New-Item -ItemType Directory -Path $crashpadDir -Force | Out-Null
}
foreach ($sub in @("new", "pending", "completed")) {
    $subDir = "$crashpadDir\$sub"
    if (-not (Test-Path $subDir)) {
        New-Item -ItemType Directory -Path $subDir -Force | Out-Null
    }
}

$settingsDat = "$crashpadDir\settings.dat"
if (-not (Test-Path $settingsDat) -or (Get-Item $settingsDat).Length -eq 0) {
    [System.IO.File]::WriteAllBytes($settingsDat, (New-Object byte[] 4096))
}

# Grant full control to current user
try {
    takeown /f "$crashpadDir" /r /d y | Out-Null
    icacls "$crashpadDir" /grant "${env:USERNAME}:(OI)(CI)F" /t /c /q | Out-Null
    Write-Host "      Crashpad permissions verified and secured." -ForegroundColor Green
} catch {}

# -------------------------------------------------------------
# 5. Ensure Runtime Dependencies (yt-dlp & node runtime)
# -------------------------------------------------------------
Write-Host "`n[5/8] Checking Downloader & Companion dependencies..." -ForegroundColor Yellow
$companionBin = "$modRoot\companion\bin"
if (-not (Test-Path $companionBin)) {
    New-Item -ItemType Directory -Path $companionBin -Force | Out-Null
}

$ytdlpExe = "$companionBin\yt-dlp.exe"
if (-not (Test-Path $ytdlpExe) -or (Get-Item $ytdlpExe).Length -lt 10000000) {
    Write-Host "      Downloading latest yt-dlp binary..." -ForegroundColor Yellow
    $ytdlpUrl = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
    Invoke-WebRequest -Uri $ytdlpUrl -OutFile $ytdlpExe -UseBasicParsing
    Write-Host "      yt-dlp installed successfully." -ForegroundColor Green
}

# Node.js check (if not installed on system, portable node is downloaded)
$localNode = "$companionBin\node.exe"
$hasNode = (Get-Command node -ErrorAction SilentlyContinue) -ne $null -or (Test-Path $localNode)
if (-not $hasNode) {
    Write-Host "      System Node.js not detected. Downloading portable runtime..." -ForegroundColor Yellow
    # Download portable node standalone zip
    $nodeZip = "$env:TEMP\node-min.zip"
    $nodeUrl = "https://nodejs.org/dist/v20.18.0/win-x64/node.exe"
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $localNode -UseBasicParsing
        Write-Host "      Portable Node runtime installed to $localNode." -ForegroundColor Green
    } catch {
        Write-Host "      Warning: Could not fetch portable node directly. Will check system PATH." -ForegroundColor Yellow
    }
}

# -------------------------------------------------------------
# 6. Patch Spotify xpui.spa (SpotX Core + Mod UI Bundle)
# -------------------------------------------------------------
Write-Host "`n[6/8] Patching Spotify client..." -ForegroundColor Yellow
$spaFile = "$spotifyDir\Apps\xpui.spa"
$spaBak = "$spaFile.bak"

# Ensure pristine backup exists
if (-not (Test-Path $spaBak)) {
    Copy-Item $spaFile $spaBak -Force
    Write-Host "      Created initial backup: xpui.spa.bak" -ForegroundColor Green
}

# Ensure pre-built bundle.js is present
$bundleFile = "$modRoot\dist\bundle.js"
if (-not (Test-Path $bundleFile)) {
    # If bundle not built yet and node exists, build it
    if (Get-Command node -ErrorAction SilentlyContinue) {
        Write-Host "      Building latest bundle.js..." -ForegroundColor Yellow
        & node "$modRoot\build.js"
    } else {
        Write-Error "Prebuilt dist/bundle.js not found in mod root."
        exit 1
    }
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::Open($spaFile, [System.IO.Compression.ZipArchiveMode]::Update)
try {
    # 1. Update index.html
    $indexEntry = $archive.GetEntry("index.html")
    if (-not $indexEntry) { throw "index.html not found inside xpui.spa!" }
    $reader = New-Object System.IO.StreamReader($indexEntry.Open(), [System.Text.Encoding]::UTF8)
    $html = $reader.ReadToEnd()
    $reader.Close()

    # Clean old script tags
    $html = $html.Replace('<script defer="defer" src="/bundle.js"></script>', '')
    $html = $html.Replace('<script src="/bundle.js"></script>', '')
    $html = $html.Replace('<script defer="defer" src="bundle.js"></script>', '')

    # Inject bundle.js after xpui.js
    if ($html.Contains('<script defer="defer" src="/xpui.js"></script>')) {
        $html = $html.Replace('<script defer="defer" src="/xpui.js"></script>', '<script defer="defer" src="/xpui.js"></script><script defer="defer" src="/bundle.js"></script>')
    } elseif ($html.Contains('</body>')) {
        $html = $html.Replace('</body>', '<script defer="defer" src="/bundle.js"></script></body>')
    }

    $indexEntry.Delete()
    $newIndex = $archive.CreateEntry("index.html", [System.IO.Compression.CompressionLevel]::Optimal)
    $writer = New-Object System.IO.StreamWriter($newIndex.Open(), [System.Text.Encoding]::UTF8)
    $writer.Write($html)
    $writer.Close()

    # 2. Inject bundle.js
    $oldBundle = $archive.GetEntry("bundle.js")
    if ($oldBundle) { $oldBundle.Delete() }
    $bundleBytes = [System.IO.File]::ReadAllBytes($bundleFile)
    $newBundle = $archive.CreateEntry("bundle.js", [System.IO.Compression.CompressionLevel]::Optimal)
    $stream = $newBundle.Open()
    $stream.Write($bundleBytes, 0, $bundleBytes.Length)
    $stream.Close()

    Write-Host "      Successfully injected Mod Bundle into xpui.spa!" -ForegroundColor Green
} finally {
    $archive.Dispose()
}

# -------------------------------------------------------------
# 7. Compile & Start Companion Background Daemon
# -------------------------------------------------------------
Write-Host "`n[7/8] Setting up Companion Daemon and Auto-Start..." -ForegroundColor Yellow
$daemonCs = "$modRoot\companion\SpotifyCompanionDaemon.cs"
$daemonExe = "$modRoot\companion\SpotifyCompanionDaemon.exe"

# Compile C# daemon via built-in Windows .NET csc.exe
if (Test-Path $daemonCs) {
    $cscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
    if (Test-Path $cscPath) {
        & $cscPath /target:winexe /optimize+ /out:"$daemonExe" "$daemonCs" | Out-Null
        Write-Host "      Compiled SpotifyCompanionDaemon.exe using native .NET." -ForegroundColor Green
    }
}

# Register Windows Startup shortcut
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = "$startupFolder\SpotifyModCompanion.lnk"
try {
    $wsh = New-Object -ComObject WScript.Shell
    $shortcut = $wsh.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $daemonExe
    $shortcut.WorkingDirectory = "$modRoot\companion"
    $shortcut.Description = "Spotify Mod Background Companion"
    $shortcut.WindowStyle = 7
    $shortcut.Save()
    Write-Host "      Created Windows Startup shortcut (silent boot on login)." -ForegroundColor Green
} catch {}

# Start Companion Daemon
& "$modRoot\companion\start.ps1" -Restart

# -------------------------------------------------------------
# 8. Launch Spotify with Mod
# -------------------------------------------------------------
Write-Host "`n[8/8] Launching Spotify..." -ForegroundColor Yellow
$spotifyExe = "$spotifyDir\Spotify.exe"
if (Test-Path $spotifyExe) {
    Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = "`"$spotifyExe`"" } | Out-Null
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host " Installation completed successfully! Spotify is running! " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "`nInstallation completed! Open Spotify from Start Menu." -ForegroundColor Green
}
