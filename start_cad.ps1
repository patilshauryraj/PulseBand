Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PulseBand 3D CAD & Telemetry Simulator Launcher        " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
$cadDir = "C:\Users\Dell\.gemini\antigravity\scratch\PulseBand-CAD"
if (Test-Path $cadDir) {
    Set-Location $cadDir
    Write-Host "Starting Vite dev server on http://localhost:3002/ ..." -ForegroundColor Green
    npm run dev
} else {
    Write-Error "Could not locate PulseBand-CAD directory at $cadDir"
}