"""
MongoDB-backed TTL cache for LLM responses.

Persists across serverless cold starts, shared between all function instances.
Uses a dedicated `llm_cache` collection with a MongoDB TTL index for auto-expiry.
"""
import hashlib
import json
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from database import get_db

# ── TTL constants (seconds) ───────────────────────────────────────────────
TTL_ANALYSIS = 60 * 10     # 10 min  — same text → same result
TTL_RECS     = 60 * 15     # 15 min  — aggregated data changes slowly
TTL_CHAT     = 60 * 5      # 5 min   — conversational but questions repeat

COLLECTION = "llm_cache"


# ── Internal helpers ───────────────────────────────────────────────────────

def _make_key(namespace: str, *parts) -> str:
    """Stable SHA-256 key from any JSON-serialisable inputs."""
    payload = json.dumps([namespace, *parts], sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(payload.encode()).hexdigest()


async def ensure_index() -> None:
    """Create the TTL index on `expires_at`. Safe to call multiple times."""
    db = get_db()
    await db[COLLECTION].create_index(
        "expires_at",
        expireAfterSeconds=0,  # MongoDB removes doc when expires_at < now
        background=True,
    )


# ── Public async API ───────────────────────────────────────────────────────

async def get(key: str) -> Optional[Any]:
    db = get_db()
    doc = await db[COLLECTION].find_one({"_id": key})
    if doc is None:
        return None
    # Belt-and-suspenders check (MongoDB TTL runs every ~60 s)
    if doc["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        await db[COLLECTION].delete_one({"_id": key})
        return None
    return doc["value"]


async def set(key: str, value: Any, ttl: int, namespace: str = "") -> None:
    db = get_db()
    now = datetime.now(timezone.utc)
    await db[COLLECTION].update_one(
        {"_id": key},
        {"$set": {
            "namespace": namespace,
            "value":     value,
            "created_at": now,
            "expires_at": now + timedelta(seconds=ttl),
        }},
        upsert=True,
    )


async def invalidate_prefix(namespace: str) -> int:
    """Delete all cached entries for a given namespace."""
    db = get_db()
    result = await db[COLLECTION].delete_many({"namespace": namespace})
    return result.deleted_count


async def stats() -> dict:
    db = get_db()
    now = datetime.now(timezone.utc)
    total = await db[COLLECTION].count_documents({})
    alive = await db[COLLECTION].count_documents({"expires_at": {"$gt": now}})
    return {"total_entries": total, "alive": alive, "expired": total - alive}


# ── Key helpers ────────────────────────────────────────────────────────────

def analysis_key(text: str) -> str:
    return _make_key("analysis", text.strip().lower())


def recs_key(agg_data: dict) -> str:
    slim = {
        "total":    agg_data.get("total"),
        "critical": agg_data.get("critical_count"),
        "cats":     sorted(agg_data.get("categories", {}).keys()),
        "countries":sorted(agg_data.get("countries", {}).keys()),
    }
    return _make_key("recs", slim)


def chat_key(question: str, context: str) -> str:
    return _make_key("chat", question.strip().lower(), context[:200])
