"""
Vercel Python serverless entry point.
handler must be a module-level name so Vercel's static analyser can find it.
"""
import sys
import os
import traceback

# Add backend/ to module search path
_here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.abspath(os.path.join(_here, '..', 'backend')))

# ── Try importing the real app ────────────────────────────────────────────
_import_error = None
_app = None

try:
    from main import app as _real_app   # backend/main.py
    _app = _real_app
except Exception:
    _import_error = traceback.format_exc()
    print("[CivicPulse] import error:\n", _import_error)

# ── Build the handler that Vercel looks for at module scope ───────────────
from mangum import Mangum   # always available (in requirements.txt)

if _app is not None:
    # Happy path — real FastAPI app
    handler = Mangum(_app, lifespan="off", api_gateway_base_path="/api")
else:
    # Fallback — return the import traceback as JSON so we can debug
    from fastapi import FastAPI as _FastAPI
    _fallback = _FastAPI()
    _err_copy = _import_error

    @_fallback.get("/{path:path}")
    async def _debug_error(path: str = ""):
        return {"import_error": _err_copy}

    handler = Mangum(_fallback, lifespan="off", api_gateway_base_path="/api")
