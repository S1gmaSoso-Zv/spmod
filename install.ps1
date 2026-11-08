
[CmdletBinding()]
param(
    [string]$TargetDir = "$env:APPDATA\spmod",
    [switch]$ForceReinstall
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force -ErrorAction SilentlyContinue

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "                spmod - Native Engine                     " -ForegroundColor Cyan
Write-Host "   (Zero Ads + Offline Downloader + Auto Proxy Detection) " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$isRemote = [string]::IsNullOrEmpty($PSScriptRoot)
$modRoot = if ($isRemote) { $TargetDir } else { $PSScriptRoot }

if ($isRemote) {
    Write-Host "`n[1/8] Running via Web One-Liner. Downloading spmod package..." -ForegroundColor Yellow
    if (-not (Test-Path $modRoot)) {
        New-Item -ItemType Directory -Path $modRoot -Force | Out-Null
    }
    
    try {
        $zipUrl = "https://github.com/S1gmaSoso-Zv/spmod/archive/refs/heads/main.zip"
        $tempZip = "$env:TEMP\spmod-main.zip"
        $tempExtract = "$env:TEMP\spmod-extract"
        
        if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue }
        
        Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing
        
        if (Get-Command Expand-Archive -ErrorAction SilentlyContinue) {
            Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force
        } else {
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            [System.IO.Compression.ZipFile]::ExtractToDirectory($tempZip, $tempExtract)
        }
        
        $extractedFolder = Join-Path $tempExtract "spmod-main"
        if (Test-Path $extractedFolder) {
            Copy-Item -Path "$extractedFolder\*" -Destination $modRoot -Recurse -Force
        }
        
        Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
        Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "      Downloaded and unpacked spmod to: $modRoot" -ForegroundColor Green
    } catch {
        Write-Host "      Zip package pull: $($_.Exception.Message). Ensuring individual files..." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n[1/8] Local installer running from: $modRoot" -ForegroundColor Green
}

Write-Host "`n[2/8] Detecting Spotify installation..." -ForegroundColor Yellow

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

Write-Host "`n[3/8] Closing running Spotify & Companion instances..." -ForegroundColor Yellow
Stop-Process -Name Spotify -Force -ErrorAction SilentlyContinue
Stop-Process -Name SpotifyCompanionDaemon -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Host "`n[4/8] Initializing directories and fixing permissions..." -ForegroundColor Yellow

$musicDownloadDir = Join-Path ([Environment]::GetFolderPath("MyMusic")) "Spotify Downloads"
if (-not (Test-Path $musicDownloadDir)) {
    New-Item -ItemType Directory -Path $musicDownloadDir -Force | Out-Null
    Write-Host "      Created Music download folder: $musicDownloadDir" -ForegroundColor Green
}

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

try {
    takeown /f "$crashpadDir" /r /d y | Out-Null
    icacls "$crashpadDir" /grant "${env:USERNAME}:(OI)(CI)F" /t /c /q | Out-Null
    Write-Host "      Crashpad permissions verified and secured." -ForegroundColor Green
} catch {}

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

$localNode = "$companionBin\node.exe"
$hasNode = (Get-Command node -ErrorAction SilentlyContinue) -ne $null -or (Test-Path $localNode)
if (-not $hasNode) {
    Write-Host "      System Node.js not detected. Downloading portable runtime..." -ForegroundColor Yellow
    
    $nodeZip = "$env:TEMP\node-min.zip"
    $nodeUrl = "https://nodejs.org/dist/v20.18.0/win-x64/node.exe"
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $localNode -UseBasicParsing
        Write-Host "      Portable Node runtime installed to $localNode." -ForegroundColor Green
    } catch {
        Write-Host "      Warning: Could not fetch portable node directly. Will check system PATH." -ForegroundColor Yellow
    }
}

Write-Host "`n[6/8] Patching Spotify client..." -ForegroundColor Yellow
$spaFile = "$spotifyDir\Apps\xpui.spa"
$spaBak = "$spaFile.bak"

if (-not (Test-Path $spaBak)) {
    Copy-Item $spaFile $spaBak -Force
    Write-Host "      Created initial backup: xpui.spa.bak" -ForegroundColor Green
}

$bundleFile = "$modRoot\dist\bundle.js"
if (-not (Test-Path $bundleFile)) {
    $bundleDir = Split-Path $bundleFile
    if (-not (Test-Path $bundleDir)) { New-Item -ItemType Directory -Path $bundleDir -Force | Out-Null }

    if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path "$modRoot\build.js")) {
        Write-Host "      Building latest bundle.js..." -ForegroundColor Yellow
        & node "$modRoot\build.js"
    } else {
        Write-Host "      Downloading prebuilt bundle.js from GitHub..." -ForegroundColor Yellow
        try {
            Invoke-WebRequest -Uri "https://raw.githubusercontent.com/S1gmaSoso-Zv/spmod/main/dist/bundle.js" -OutFile $bundleFile -UseBasicParsing
            Write-Host "      Prebuilt bundle.js fetched successfully." -ForegroundColor Green
        } catch {
            Write-Error "Could not retrieve bundle.js: $($_.Exception.Message)"
            exit 1
        }
    }
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::Open($spaFile, [System.IO.Compression.ZipArchiveMode]::Update)
try {
    
    $indexEntry = $archive.GetEntry("index.html")
    if (-not $indexEntry) { throw "index.html not found inside xpui.spa!" }
    $reader = New-Object System.IO.StreamReader($indexEntry.Open(), [System.Text.Encoding]::UTF8)
    $html = $reader.ReadToEnd()
    $reader.Close()

    $html = $html.Replace('<script defer="defer" src="/bundle.js"></script>', '')
    $html = $html.Replace('<script src="/bundle.js"></script>', '')
    $html = $html.Replace('<script defer="defer" src="bundle.js"></script>', '')

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

Write-Host "`n[7/8] Setting up Companion Daemon and Auto-Start..." -ForegroundColor Yellow
$companionDir = "$modRoot\companion"
if (-not (Test-Path $companionDir)) { New-Item -ItemType Directory -Path $companionDir -Force | Out-Null }
$rawBase = "https://raw.githubusercontent.com/S1gmaSoso-Zv/spmod/main"

foreach ($f in @("server.js", "downloader.js", "SpotifyCompanionDaemon.cs", "start.ps1", "SpotifyCompanionDaemon.exe")) {
    $targetFile = "$companionDir\$f"
    if (-not (Test-Path $targetFile)) {
        try {
            Invoke-WebRequest -Uri "$rawBase/companion/$f" -OutFile $targetFile -UseBasicParsing
        } catch {}
    }
}

$daemonCs = "$modRoot\companion\SpotifyCompanionDaemon.cs"
$daemonExe = "$modRoot\companion\SpotifyCompanionDaemon.exe"

if (-not (Test-Path $daemonExe) -and (Test-Path $daemonCs)) {
    $cscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
    if (-not (Test-Path $cscPath)) {
        $cscPath = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
    }
    if (Test-Path $cscPath) {
        & $cscPath /target:winexe /optimize+ /out:"$daemonExe" "$daemonCs" | Out-Null
        Write-Host "      Compiled SpotifyCompanionDaemon.exe using native .NET." -ForegroundColor Green
    }
}

$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = "$startupFolder\spmod.lnk"
try {
    $wsh = New-Object -ComObject WScript.Shell
    $shortcut = $wsh.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $daemonExe
    $shortcut.WorkingDirectory = "$modRoot\companion"
    $shortcut.Description = "spmod Background Companion"
    $shortcut.WindowStyle = 7
    $shortcut.Save()
    Write-Host "      Created Windows Startup shortcut (spmod.lnk)." -ForegroundColor Green
} catch {}

Stop-Process -Name SpotifyCompanionDaemon -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 300
if (Test-Path $daemonExe) {
    Start-Process -FilePath $daemonExe -WorkingDirectory "$modRoot\companion"
    Write-Host "      Started SpotifyCompanionDaemon background service." -ForegroundColor Green
}

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
