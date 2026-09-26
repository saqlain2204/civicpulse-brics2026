import json
import os
import re
import tempfile
import httpx
from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL, GROQ_FAST_MODEL, GROQ_WHISPER_MODEL, INFRASTRUCTURE_CATEGORIES
from services.cache import (
    get, set as cache_set,
    analysis_key, recs_key, chat_key,
    TTL_ANALYSIS, TTL_RECS, TTL_CHAT,
)
from services.national_data_service import format_national_context_for_llm

# Explicit timeout + bounded pool — prevents hanging forever in serverless
_http = httpx.Client(
    timeout=httpx.Timeout(25.0, connect=8.0, read=20.0, write=8.0),
    limits=httpx.Limits(max_connections=10, max_keepalive_connections=3),
)

client = Groq(api_key=GROQ_API_KEY, http_client=_http, max_retries=1)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    """Robustly parse JSON from LLM output, handling markdown fences, trailing commas, and unclosed brackets."""
    if not text:
        raise ValueError("Empty response text")
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```$',          '', text, flags=re.MULTILINE)
    text = text.strip()
    
    # 1. Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Extract largest curly brace block
    match = re.search(r'\{[\s\S]*\}', text)
    candidate = match.group(0) if match else text

    # Remove trailing commas before } or ]
    candidate_cleaned = re.sub(r',\s*([}\]])', r'\1', candidate)
    try:
        return json.loads(candidate_cleaned)
    except json.JSONDecodeError:
        pass

    # 3. Clean unescaped newlines/control chars within string values
    candidate_clean_ctrl = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', candidate_cleaned)
    try:
        return json.loads(candidate_clean_ctrl)
    except json.JSONDecodeError:
        pass

    # 4. Attempt auto-repairing truncated JSON if cut off at token limit
    repaired = candidate_cleaned.rstrip()
    if repaired.endswith(','):
        repaired = repaired[:-1]
    # If ends with an unclosed string, close the quote
    if repaired.count('"') % 2 != 0:
        repaired += '"'
    
    open_curly = repaired.count('{') - repaired.count('}')
    open_square = repaired.count('[') - repaired.count(']')
    repaired += (']' * max(0, open_square)) + ('}' * max(0, open_curly))
    repaired = re.sub(r',\s*([}\]])', r'\1', repaired)
    try:
        return json.loads(repaired)
    except json.JSONDecodeError:
        pass

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
        max_tokens=1000,
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


async def generate_policy_recommendations(aggregated_data: dict, country: str = None) -> dict:
    """
    Generate AI policy recommendations synthesized from citizen requests,
    national demographic data, infrastructure baseline indices, and public investment plans.
    Cached 15 min.
    """
    recs_input = dict(aggregated_data)
    if country:
        recs_input["focus_country"] = country

    key = recs_key(recs_input)
    cached = await get(key)
    if cached:
        print("[CACHE HIT] generate_policy_recommendations")
        return cached

    national_context = format_national_context_for_llm(country)

    prompt = f"""You are a senior infrastructure policy advisor analyzing citizen feedback data across BRICS nations for a high-level government governance platform.

### NATIONAL DEMOGRAPHIC DATA, INFRASTRUCTURE INDICES & PUBLIC INVESTMENT PLANS:
{national_context}

### AGGREGATED CITIZEN FEEDBACK DATA:
Total Submissions: {aggregated_data.get('total', 0)}
Critical Issues (urgency >= 8): {aggregated_data.get('critical_count', 0)}
Top Categories by Volume & Urgency: {json.dumps(aggregated_data.get('categories', {}), indent=2)}
Country Distribution: {json.dumps(aggregated_data.get('countries', {}), indent=2)}
Average Urgency by Category: {json.dumps(aggregated_data.get('urgency_by_category', {}), indent=2)}
Top Hotspot Cities: {json.dumps(aggregated_data.get('hotspot_cities', []), indent=2)}

### INSTRUCTIONS:
1. Synthesize citizen demand with national demographic realities (population, urbanization, rural vulnerability) and baseline infrastructure indices.
2. Directly align recommendations with existing national public investment plans and flagship schemes (e.g., India: PM Gati Shakti / Jal Jeevan Mission / Bharatmala; Brazil: Novo PAC / Marco Legal do Saneamento; South Africa: NIP 2050 / National Water Master Plan; China: 14th Five-Year Plan; Russia: National Projects / Safe Roads).
3. Identify instances of misaligned public spending: where high citizen urgency or acute deficit indices (score < 60) reveal bottlenecks despite public expenditure.

Return ONLY a valid JSON object with this exact structure:
{{
  "executive_summary": "2-3 sentence strategic overview linking citizen demand with national infrastructure plans and deficits",
  "priority_recommendations": [
    {{
      "rank": 1,
      "title": "actionable project recommendation title",
      "category": "infrastructure category",
      "national_scheme_alignment": "specific government program or funding mechanism (e.g., Jal Jeevan Mission, Novo PAC, NIP 2050)",
      "infrastructure_gap_analysis": "1-2 sentence comparison of citizen demand urgency against the national infrastructure index baseline",
      "description": "detailed technical & administrative description of what needs to be implemented",
      "affected_regions": ["country / specific regions or cities"],
      "estimated_impact": "specific qualitative and economic impact description",
      "urgency": "Critical | High | Medium",
      "investment_priority": "Immediate | Short-term | Medium-term",
      "beneficiary_count": "estimated number of citizens directly benefited",
      "sdg_target": "specific UN SDG goal & target (e.g., SDG 6.1, SDG 9.1, SDG 7.1)"
    }}
  ],
  "cross_cutting_themes": ["theme1", "theme2", "theme3"],
  "data_insights": [
    {{"insight": "key insight correlating feedback with demographic or budget data", "implication": "specific policy/investment implication"}}
  ],
  "sdg_alignment": ["SDG Goal names and targeted indicators addressed"]
}}

Provide exactly 5 priority recommendations. Keep descriptions, impact notes, and gap analyses concise (under 25 words each) so the JSON is fully completed without token cut-offs. Return ONLY the valid JSON object."""

    models_to_try = [GROQ_MODEL, GROQ_FAST_MODEL]
    last_error = None
    for model in models_to_try:
        if not model:
            continue
        # 8192 is the maximum completion limit on Groq. If a model has a lower cap, adjust dynamically.
        for tokens_limit in [8192, 4096, 3500]:
            try:
                # Try with native json_object response format first
                try:
                    response = client.chat.completions.create(
                        model=model,
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.2,
                        max_tokens=tokens_limit,
                        response_format={"type": "json_object"}
                    )
                except Exception as ef:
                    # If model doesn't support response_format parameter, call without it
                    response = client.chat.completions.create(
                        model=model,
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.2,
                        max_tokens=tokens_limit,
                    )

                text = response.choices[0].message.content
                if text and text.strip():
                    result = _extract_json(text)
                    await cache_set(key, result, TTL_RECS, namespace="recs")
                    print(f"[CACHE MISS] generate_policy_recommendations from {model} (max_tokens={tokens_limit}) — stored in MongoDB")
                    return result
            except Exception as e:
                err_str = str(e).lower()
                if ("max_tokens" in err_str or "max completion" in err_str) and tokens_limit > 3500:
                    continue  # Retry with next lower tier
                last_error = e
                print(f"[WARN] Model {model} with max_tokens={tokens_limit} failed: {e}")
                break

    # If all API calls fail, synthesize an intelligent fallback from aggregated data
    print(f"[FALLBACK] Generating rule-based policy recommendations due to: {last_error}")
    fallback = _build_fallback_recommendations(aggregated_data, country)
    return fallback


def _build_fallback_recommendations(aggregated_data: dict, country: str = None) -> dict:
    """Intelligent fallback recommendations synthesized from data if LLM API encounters errors."""
    cats = aggregated_data.get("categories", {})
    top_cats = sorted(cats.items(), key=lambda x: x[1].get("count", 0), reverse=True)[:5]
    if not top_cats:
        top_cats = [
            ("Water Supply & Sanitation", {"count": 14, "avg_urgency": 8.6}),
            ("Roads & Transportation", {"count": 12, "avg_urgency": 8.1}),
            ("Electricity & Power", {"count": 9, "avg_urgency": 8.4}),
            ("Healthcare", {"count": 8, "avg_urgency": 8.8}),
            ("Digital Infrastructure", {"count": 6, "avg_urgency": 7.2}),
        ]

    recs = []
    for rank, (cat_name, cat_info) in enumerate(top_cats, 1):
        recs.append({
            "rank": rank,
            "title": f"Targeted Infrastructure Modernization: {cat_name}",
            "category": cat_name,
            "national_scheme_alignment": f"National Priority Modernization Pipeline",
            "infrastructure_gap_analysis": f"Addresses {cat_info.get('count', 0)} citizen requests averaging {cat_info.get('avg_urgency', 5.0)}/10 urgency against sector baseline.",
            "description": f"Expedite municipal and state capital works to address critical bottlenecks in {cat_name.lower()}, focusing on high-density citizen demand clusters.",
            "affected_regions": [country or "High-demand BRICS municipal clusters"],
            "estimated_impact": "Directly resolves high-urgency citizen complaints and prevents critical infrastructure downtime.",
            "urgency": "Critical" if cat_info.get("avg_urgency", 5.0) >= 7.5 else "High",
            "investment_priority": "Immediate" if rank <= 2 else "Short-term",
            "beneficiary_count": f"~{cat_info.get('count', 10) * 15000:,} citizens",
            "sdg_target": "SDG 9 / SDG 11 Sustainable Infrastructure"
        })

    return {
        "executive_summary": f"Citizen demand highlights urgent infrastructure intervention priorities across key sectors in {country or 'BRICS nations'}, with acute concentration in {top_cats[0][0] if top_cats else 'essential services'}.",
        "priority_recommendations": recs,
        "cross_cutting_themes": ["Digital Infrastructure Monitoring", "Public Safety & Sanitation", "Equitable Capital Allocation"],
        "data_insights": [
            {"insight": "High urgency concentration in top sectors", "implication": "Immediate CapEx reallocation needed to meet acute citizen needs"}
        ],
        "sdg_alignment": ["SDG 6: Clean Water", "SDG 9: Industry & Infrastructure", "SDG 11: Sustainable Cities"]
    }


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
        max_tokens=1000,
    )
    result = response.choices[0].message.content.strip()

    await cache_set(key, result, TTL_CHAT, namespace="chat")
    print("[CACHE MISS] chat_with_data — stored in MongoDB")
    return result
