# start.ps1 - Reliable background launcher for Companion Daemon
param([switch]$Restart)

$companionDir = $PSScriptRoot
$daemonExe = "$companionDir\SpotifyCompanionDaemon.exe"
$daemonCs = "$companionDir\SpotifyCompanionDaemon.cs"

# Check if companion is already healthy
if (-not $Restart) {
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:43821/ping" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($res -and $res.status -eq "ok") {
            Write-Host "      Companion already running and healthy on port 43821." -ForegroundColor Green
            exit 0
        }
    } catch {}
}

# Stop old processes if restarting or unhealthy
Stop-Process -Name SpotifyCompanionDaemon -Force -ErrorAction SilentlyContinue

# Stop any process listening on port 43821 (CIM-free netstat lookup)
try {
    $netstatLines = netstat -ano | Select-String ":43821.+LISTENING"
    foreach ($line in $netstatLines) {
        $tokens = ($line.Line.Trim() -split '\s+')
        $pidToKill = $tokens[-1]
        if ($pidToKill -match '^\d+$' -and [int]$pidToKill -gt 0 -and [int]$pidToKill -ne $PID) {
            Stop-Process -Id ([int]$pidToKill) -Force -ErrorAction SilentlyContinue
        }
    }
} catch {}

Start-Sleep -Milliseconds 600

# Ensure daemon executable is compiled
if (-not (Test-Path $daemonExe) -and (Test-Path $daemonCs)) {
    & "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /target:winexe /optimize+ /out:"$daemonExe" "$daemonCs" | Out-Null
}

# Start GUI daemon (starts completely detached without console)
if (Get-Process explorer -ErrorAction SilentlyContinue) {
    explorer.exe "$daemonExe"
} else {
    Start-Process -FilePath $daemonExe -WorkingDirectory $companionDir
}

# Verify health with retries
for ($i = 0; $i -lt 10; $i++) {
    Start-Sleep -Milliseconds 500
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:43821/ping" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($res -and $res.status -eq "ok") {
            Write-Host "      Companion daemon started successfully on http://127.0.0.1:43821" -ForegroundColor Green
            exit 0
        }
    } catch {}
}

Write-Host "      Companion daemon started in background." -ForegroundColor Green
