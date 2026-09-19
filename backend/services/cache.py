"""
In-memory TTL cache for LLM responses.
No extra dependencies — uses stdlib only.
"""
import time
import hashlib
import json
from typing import Any, Optional

# { cache_key: (value, expires_at) }
_store: dict[str, tuple[Any, float]] = {}

# TTL constants (seconds)
TTL_ANALYSIS      = 60 * 10      # 10 min  — same text always returns same result
TTL_RECS          = 60 * 15      # 15 min  — DB aggregation changes slowly
TTL_CHAT          = 60 * 5       # 5 min   — conversational, but questions repeat


def _make_key(namespace: str, *parts) -> str:
    """Stable hash key from any JSON-serialisable inputs."""
    payload = json.dumps([namespace, *parts], sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(payload.encode()).hexdigest()


def get(key: str) -> Optional[Any]:
    entry = _store.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.time() > expires_at:
        del _store[key]
        return None
    return value


def set(key: str, value: Any, ttl: int) -> None:
    _store[key] = (value, time.time() + ttl)


def invalidate_prefix(namespace: str) -> int:
    """Remove all keys that start with a given namespace hash prefix."""
    prefix = hashlib.sha256(json.dumps([namespace]).encode()).hexdigest()[:8]
    removed = [k for k in list(_store) if k.startswith(prefix)]
    for k in removed:
        del _store[k]
    return len(removed)


def stats() -> dict:
    now = time.time()
    total = len(_store)
    alive = sum(1 for _, (_, exp) in _store.items() if exp > now)
    return {"total_entries": total, "alive": alive, "expired": total - alive}


# ── Convenience helpers tied to each LLM function ──────────────────────────

def analysis_key(text: str) -> str:
    return _make_key("analysis", text.strip().lower())

def recs_key(agg_data: dict) -> str:
    # Key on the counts that matter, not raw dict (avoids noise from ordering)
    slim = {
        "total":    agg_data.get("total"),
        "critical": agg_data.get("critical_count"),
        "cats":     sorted(agg_data.get("categories", {}).keys()),
        "countries":sorted(agg_data.get("countries", {}).keys()),
    }
    return _make_key("recs", slim)

def chat_key(question: str, context: str) -> str:
    return _make_key("chat", question.strip().lower(), context[:200])
