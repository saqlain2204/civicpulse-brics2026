"""
Vercel Python serverless entry point.
Wraps the FastAPI app with Mangum so Vercel can invoke it as a Lambda-style handler.
"""
import sys
import os

# Add the backend package to the module search path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from mangum import Mangum
from main import app  # noqa: E402  (backend/main.py)

# lifespan="auto" → Mangum runs startup/shutdown events if the ASGI server supports it.
# This ensures connect_db() and seed_database() are called on cold starts.
handler = Mangum(app, lifespan="auto")
