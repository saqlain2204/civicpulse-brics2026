Write-Host "🚀 Starting CivicPulse Backend..." -ForegroundColor Cyan
Set-Location backend

# Create virtual environment if not exists
if (-not (Test-Path ".venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

# Activate venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt -q

# Start server
Write-Host "Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
uvicorn main:app --reload --host 0.0.0.0 --port 8000
