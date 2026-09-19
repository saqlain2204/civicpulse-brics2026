#!/bin/bash
# CivicPulse Backend Startup — Mac/Linux
set -e
cd "$(dirname "$0")/backend"

echo "Starting CivicPulse Backend..."

if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
fi

source .venv/bin/activate
echo "Installing dependencies..."
pip install -r requirements.txt -q

echo "Backend running at http://localhost:8000"
echo "API docs at http://localhost:8000/docs"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
