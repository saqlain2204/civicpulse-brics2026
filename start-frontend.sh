#!/bin/bash
# CivicPulse Frontend Startup — Mac/Linux
set -e
cd "$(dirname "$0")/frontend"

echo "Starting CivicPulse Frontend..."

if [ ! -d "node_modules" ]; then
  echo "Installing npm packages..."
  npm install --legacy-peer-deps
fi

echo "Frontend running at http://localhost:5173"
npm run dev
