import json
import os
import re
import tempfile
from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL, GROQ_FAST_MODEL, GROQ_WHISPER_MODEL, INFRASTRUCTURE_CATEGORIES
from services.cache import (
    get, set as cache_set,
    analysis_key, recs_key, chat_key,
    TTL_ANALYSIS, TTL_RECS, TTL_CHAT,
)

client = Groq(api_key=GROQ_API_KEY)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    """Robustly parse JSON from LLM output, handling markdown fences and leading text."""
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```$',          '', text, flags=re.MULTILINE)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        return json.loads(match.group(0))
    raise ValueError(f"No valid JSON in LLM response: {text[:300]}")


# ── Core LLM functions ────────────────────────────────────────────────────────

async def analyze_feedback(text: str, language: str = "auto") -> dict:
    """Detect language, translate, classify, score urgency — all in one LLM call."""

    key = analysis_key(text)
    cached = await get(key)
    if cached:
        print("[CACHE HIT] analyze_feedback")
        return cached

    categories_str = ", ".join(INFRASTRUCTURE_CATEGORIES)
    prompt = f"""You are an AI analyst for a government infrastructure platform analyzing citizen feedback from BRICS nations.

Analyze the following citizen feedback and return a JSON response.

Feedback: "{text}"

Return ONLY a valid JSON object with these exact fields:
{{
  "detected_language": "language code (e.g., en, hi, pt, ru, zh, zu)",
  "language_name": "full language name",
  "translated_text": "English translation (same as input if already English)",
  "category": "one of: {categories_str}",
  "sentiment": "positive | negative | neutral",
  "urgency_score": <integer 1-10 where 10 is most urgent>,
  "urgency_reason": "brief reason for urgency score",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "summary": "one sentence English summary of the issue"
}}

Urgency scale: 1-3=minor inconvenience, 4-6=significant problem, 7-8=serious issue affecting many, 9-10=crisis/life-threatening.
Only return the JSON, no other text."""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=500,
    )
    result = _extract_json(response.choices[0].message.content)

    await cache_set(key, result, TTL_ANALYSIS, namespace="analysis")
    print("[CACHE MISS] analyze_feedback — stored in MongoDB")
    return result


async def transcribe_voice(audio_bytes: bytes, filename: str = "audio.wav") -> str:
    """Transcribe audio using Groq Whisper (not cached — audio is always unique)."""
    with tempfile.NamedTemporaryFile(
        suffix=os.path.splitext(filename)[1] or ".wav", delete=False
    ) as f:
        f.write(audio_bytes)
        tmp_path = f.name
    try:
        with open(tmp_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=(filename, audio_file.read()),
                model=GROQ_WHISPER_MODEL,
                response_format="text",
            )
        return transcription
    finally:
        os.unlink(tmp_path)


async def generate_policy_recommendations(aggregated_data: dict) -> dict:
    """Generate AI policy recommendations — cached 15 min since DB data changes slowly."""

    key = recs_key(aggregated_data)
    cached = await get(key)
    if cached:
        print("[CACHE HIT] generate_policy_recommendations")
        return cached

    prompt = f"""You are a senior policy advisor analyzing citizen feedback data from BRICS nations for a government infrastructure platform.

Here is the aggregated citizen feedback data:

Total Feedback Submissions: {aggregated_data.get('total', 0)}
Top Categories by Volume: {json.dumps(aggregated_data.get('categories', {}), indent=2)}
Country Distribution: {json.dumps(aggregated_data.get('countries', {}), indent=2)}
Average Urgency by Category: {json.dumps(aggregated_data.get('urgency_by_category', {}), indent=2)}
Top Hotspot Cities: {json.dumps(aggregated_data.get('hotspot_cities', []), indent=2)}
Critical Issues (urgency >= 8): {aggregated_data.get('critical_count', 0)}

Generate comprehensive, actionable policy recommendations. Return ONLY a valid JSON object:
{{
  "executive_summary": "2-3 sentence overview of the infrastructure situation",
  "priority_recommendations": [
    {{
      "rank": 1,
      "title": "recommendation title",
      "category": "infrastructure category",
      "description": "detailed description of what needs to be done",
      "affected_regions": ["country/region"],
      "estimated_impact": "impact description",
      "urgency": "Critical | High | Medium",
      "investment_priority": "Immediate | Short-term | Medium-term",
      "beneficiary_count": "estimated number of citizens affected"
    }}
  ],
  "cross_cutting_themes": ["theme1", "theme2", "theme3"],
  "data_insights": [
    {{"insight": "key insight", "implication": "policy implication"}}
  ],
  "sdg_alignment": ["SDG Goal descriptions aligned with recommendations"]
}}

Provide exactly 5 priority recommendations. Be specific and data-driven."""

    models_to_try = [GROQ_MODEL, GROQ_FAST_MODEL]
    last_error = None
    for model in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=2000,
            )
            text = response.choices[0].message.content
            if text and text.strip():
                result = _extract_json(text)
                await cache_set(key, result, TTL_RECS, namespace="recs")
                print("[CACHE MISS] generate_policy_recommendations — stored in MongoDB")
                return result
        except Exception as e:
            last_error = e
            print(f"[WARN] Model {model} failed: {e}")
    raise last_error or ValueError("All models returned empty responses")


async def chat_with_data(question: str, context: str) -> str:
    """Conversational AI — cached 5 min since the same question is often repeated."""

    key = chat_key(question, context)
    cached = await get(key)
    if cached:
        print("[CACHE HIT] chat_with_data")
        return cached

    prompt = f"""You are CivicPulse AI, an intelligent assistant for government policymakers analyzing BRICS infrastructure data.

Current Data Context:
{context}

Policymaker's Question: {question}

Provide a concise, insightful answer based on the data. Be specific and actionable. Keep response under 200 words."""

    response = client.chat.completions.create(
        model=GROQ_FAST_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=400,
    )
    result = response.choices[0].message.content.strip()

    await cache_set(key, result, TTL_CHAT, namespace="chat")
    print("[CACHE MISS] chat_with_data — stored in MongoDB")
    return result
