Write-Host "Starting PulseBand FastAPI Backend Server on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
Set-Location $PSScriptRoot
C:\msys64\ucrt64\bin\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
