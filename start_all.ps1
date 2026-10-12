Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   PulseBand Smart Health Platform Launcher  " -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Launching Backend Server in a new PowerShell window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", (Join-Path $PSScriptRoot "start_backend.ps1")

Start-Sleep -Seconds 2

Write-Host "2. Launching Mobile UI in this window..." -ForegroundColor Green
Set-Location (Join-Path $PSScriptRoot "mobile")
npm run dev
