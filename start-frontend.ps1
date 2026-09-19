Write-Host "🚀 Starting CivicPulse Frontend..." -ForegroundColor Cyan
Set-Location frontend

# Install dependencies if node_modules missing
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}

Write-Host "Starting Vite dev server on http://localhost:5173" -ForegroundColor Green
npm run dev
