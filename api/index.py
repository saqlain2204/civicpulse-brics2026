"""
Vercel Python serverless entry point.
Wraps the FastAPI app with Mangum so Vercel can invoke it as a Lambda-style handler.
"""
import sys
import os

# Resolve backend path robustly regardless of Vercel's working directory
_here = os.path.dirname(os.path.abspath(__file__))
_backend = os.path.join(_here, '..', 'backend')
sys.path.insert(0, os.path.abspath(_backend))

from mangum import Mangum          # noqa: E402
from main import app               # noqa: E402  (backend/main.py)

# api_gateway_base_path strips "/api" before passing the path to FastAPI.
# e.g. Vercel receives GET /api/health → Mangum strips "/api" → FastAPI sees GET /health
handler = Mangum(app, lifespan="auto", api_gateway_base_path="/api")
