"""
MongoDB connection — works in both traditional (uvicorn) and serverless (Vercel/Lambda) modes.

The client is created at module level so it is reused across warm invocations,
which is the recommended pattern for serverless + Motor/PyMongo.
"""
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, MONGO_DB

# Module-level singleton — created once per container / warm invocation
_client: Optional[AsyncIOMotorClient] = None
_db = None


def get_db():
    """Return the active DB handle, initialising lazily if needed."""
    global _client, _db
    if _client is None:
        _client = AsyncIOMotorClient(
            MONGO_URI,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=20000,
            tls=True,
            tlsAllowInvalidCertificates=False,
        )
        _db = _client[MONGO_DB]
    return _db


async def connect_db():
    """Called from the FastAPI lifespan startup hook.
    Also safe to call multiple times (idempotent)."""
    db = get_db()
    try:
        await db.feedback.create_index([("location.country", 1)])
        await db.feedback.create_index([("category", 1)])
        await db.feedback.create_index([("urgency_score", -1)])
        await db.feedback.create_index([("created_at", -1)])
        await db.feedback.create_index([("location.lat", 1), ("location.lng", 1)])
        print(f"[OK] Connected to MongoDB: {MONGO_DB}")
    except Exception as exc:
        print(f"[WARN] Index creation skipped: {exc}")


async def close_db():
    global _client
    if _client:
        _client.close()
        _client = None
