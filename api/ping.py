"""Minimal Vercel function — no backend imports. Used to verify Python runtime works."""

def handler(request):
    import sys, platform
    return {
        "statusCode": 200,
        "body": f"Python {sys.version} on {platform.system()}",
        "headers": {"Content-Type": "text/plain"},
    }
