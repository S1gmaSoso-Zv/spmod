
param([switch]$Restart)

$companionDir = $PSScriptRoot
$daemonExe = "$companionDir\SpotifyCompanionDaemon.exe"
$daemonCs = "$companionDir\SpotifyCompanionDaemon.cs"

if (-not $Restart) {
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:43821/ping" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($res -and $res.status -eq "ok") {
            Write-Host "      Companion already running and healthy on port 43821." -ForegroundColor Green
            exit 0
        }
    } catch {}
}

Stop-Process -Name SpotifyCompanionDaemon -Force -ErrorAction SilentlyContinue

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

if (-not (Test-Path $daemonExe) -and (Test-Path $daemonCs)) {
    & "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /target:winexe /optimize+ /out:"$daemonExe" "$daemonCs" | Out-Null
}

if (Get-Process explorer -ErrorAction SilentlyContinue) {
    explorer.exe "$daemonExe"
} else {
    Start-Process -FilePath $daemonExe -WorkingDirectory $companionDir
}

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
