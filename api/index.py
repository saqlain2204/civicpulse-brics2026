"""
Vercel Python serverless entry point.
"""
import sys
import os
import traceback

# Add backend/ to module search path
_here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.abspath(os.path.join(_here, '..', 'backend')))

try:
    from mangum import Mangum
    from main import app

    # lifespan="off" — DB connects lazily on first get_db() call.
    # Avoids running the full startup sequence (connect + seed) on every
    # cold start, which was causing FUNCTION_INVOCATION_FAILED timeouts.
    handler = Mangum(app, lifespan="off", api_gateway_base_path="/api")

except Exception:
    # Surface any import error as a readable JSON 500 instead of
    # a cryptic FUNCTION_INVOCATION_FAILED so we can debug faster.
    import json
    _tb = traceback.format_exc()
    print("CIVICPULSE IMPORT ERROR:\n", _tb)

    from fastapi import FastAPI
    _fallback = FastAPI()

    @_fallback.get("/{path:path}")
    async def _err():
        return {"import_error": _tb}

    from mangum import Mangum as _M
    handler = _M(_fallback, lifespan="off", api_gateway_base_path="/api")
