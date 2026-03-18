# ══════════════════════════════════════════════════════════════
#  EMS PRO SYSTEM 2026 — One-Click Server Launcher
#  Run: Right-click → "Run with PowerShell"
#  Ya: Double-click START_EMS_PS.bat
# ══════════════════════════════════════════════════════════════

$Host.UI.RawUI.WindowTitle = "EMS PRO 2026 — Server Manager"

$ROOT     = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND  = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"

function Write-Banner {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║         EMS PRO SYSTEM 2026 — SERVER LAUNCHER           ║" -ForegroundColor Cyan
    Write-Host "  ║              Samajwadi Party — UP Command                ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Status($msg, $color = "Green") {
    Write-Host "  $msg" -ForegroundColor $color
}

function Start-Server($title, $dir, $cmd, $colorIndex) {
    $colors = @("Red","Yellow","Cyan","Magenta")
    $c = $colors[$colorIndex % $colors.Count]
    Write-Status "► Starting: $title" $c
    Start-Process "cmd.exe" -ArgumentList "/k title $title && color 0$($colorIndex+9) && cd /d `"$dir`" && $cmd" -WindowStyle Normal
    Start-Sleep -Milliseconds 800
}

function Test-Port($port) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $port)
        $tcp.Close()
        return $true
    } catch { return $false }
}

# ── Main ──────────────────────────────────────────────────────
Clear-Host
Write-Banner

Write-Status "Checking if ports are already in use..." "Gray"
Write-Host ""

$backendRunning  = Test-Port 5000
$frontendRunning = Test-Port 3000

if ($backendRunning)  { Write-Status "⚠  Port 5000 already in use (Backend may already be running)" "Yellow" }
if ($frontendRunning) { Write-Status "⚠  Port 3000 already in use (Frontend may already be running)" "Yellow" }

Write-Host ""
Write-Status "Launching servers..." "White"
Write-Host ""

# ── 1. Backend API
if (-not $backendRunning) {
    Start-Server "EMS-BACKEND [PORT 5000]" $BACKEND "node server.js" 0
} else {
    Write-Status "  [SKIP] Backend already running on port 5000" "DarkGray"
}

# ── 2. Producer
Start-Server "EMS-PRODUCER" $BACKEND "node producer.js" 1

# ── 3. Worker
Start-Server "EMS-WORKER" $BACKEND "node queueWorker.js" 2

# ── 4. Frontend
if (-not $frontendRunning) {
    Start-Server "EMS-FRONTEND [PORT 3000]" $FRONTEND "npm run dev" 3
} else {
    Write-Status "  [SKIP] Frontend already running on port 3000" "DarkGray"
}

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║  ✅ All servers launched!                                ║" -ForegroundColor Green
Write-Host "  ╠══════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "  ║  Backend API   →  http://localhost:5000                  ║" -ForegroundColor White
Write-Host "  ║  Frontend UI   →  http://localhost:3000                  ║" -ForegroundColor White
Write-Host "  ║  Producer      →  Queue background process               ║" -ForegroundColor White
Write-Host "  ║  Worker        →  Queue consumer process                 ║" -ForegroundColor White
Write-Host "  ╠══════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "  ║  Frontend ready hone mein ~30 seconds lagte hain        ║" -ForegroundColor Yellow
Write-Host "  ╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# ── Wait then open browser
Write-Status "Browser 12 seconds mein automatically khulega..." "Gray"
Start-Sleep -Seconds 12

# ── Check if frontend is up, then open
$attempts = 0
while ($attempts -lt 5) {
    if (Test-Port 3000) {
        Write-Status "✅ Frontend ready! Browser khul raha hai..." "Green"
        Start-Process "http://localhost:3000"
        break
    }
    $attempts++
    Write-Status "  Waiting for frontend... ($attempts/5)" "DarkGray"
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Status "Press any key to close this launcher..." "DarkGray"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
