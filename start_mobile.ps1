Write-Host "Starting PulseBand Mobile Application on http://localhost:3000 ..." -ForegroundColor Green
Set-Location (Join-Path $PSScriptRoot "mobile")
npm run dev
