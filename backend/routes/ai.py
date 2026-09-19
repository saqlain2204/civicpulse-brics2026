from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db
from services.groq_service import analyze_feedback, generate_policy_recommendations, chat_with_data
import json

router = APIRouter(prefix="/api/ai", tags=["ai"])


class AnalyzeRequest(BaseModel):
    text: str
    language: str = "auto"


class ChatRequest(BaseModel):
    question: str


@router.post("/analyze")
async def analyze_text(req: AnalyzeRequest):
    """Instantly analyze a text snippet with AI"""
    try:
        result = await analyze_feedback(req.text, req.language)
        return {"success": True, "analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations")
async def get_recommendations():
    """Generate AI-powered policy recommendations from aggregated data"""
    db = get_db()

    # Aggregate data for AI context
    total = await db.feedback.count_documents({})
    critical_count = await db.feedback.count_documents({"urgency_score": {"$gte": 8}})

    # Category counts
    cat_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}, "avg_urgency": {"$avg": "$urgency_score"}}},
        {"$sort": {"count": -1}}, {"$limit": 10}
    ]
    categories = {}
    async for doc in db.feedback.aggregate(cat_pipeline):
        if doc["_id"]:
            categories[doc["_id"]] = {"count": doc["count"], "avg_urgency": round(doc["avg_urgency"], 1)}

    # Country counts
    country_pipeline = [
        {"$group": {"_id": "$location.country", "count": {"$sum": 1}, "avg_urgency": {"$avg": "$urgency_score"}}},
        {"$sort": {"count": -1}}
    ]
    countries = {}
    async for doc in db.feedback.aggregate(country_pipeline):
        if doc["_id"]:
            countries[doc["_id"]] = {"count": doc["count"], "avg_urgency": round(doc["avg_urgency"], 1)}

    # Urgency by category
    urgency_pipeline = [
        {"$group": {"_id": "$category", "avg_urgency": {"$avg": "$urgency_score"}}},
        {"$sort": {"avg_urgency": -1}}, {"$limit": 5}
    ]
    urgency_by_cat = {}
    async for doc in db.feedback.aggregate(urgency_pipeline):
        if doc["_id"]:
            urgency_by_cat[doc["_id"]] = round(doc["avg_urgency"], 1)

    # Top hotspot cities
    city_pipeline = [
        {"$group": {
            "_id": {"city": "$location.city", "country": "$location.country"},
            "count": {"$sum": 1},
            "avg_urgency": {"$avg": "$urgency_score"}
        }},
        {"$sort": {"avg_urgency": -1, "count": -1}},
        {"$limit": 10}
    ]
    hotspot_cities = []
    async for doc in db.feedback.aggregate(city_pipeline):
        if doc["_id"]["city"]:
            hotspot_cities.append({
                "city": doc["_id"]["city"],
                "country": doc["_id"]["country"],
                "count": doc["count"],
                "avg_urgency": round(doc["avg_urgency"], 1)
            })

    aggregated_data = {
        "total": total,
        "critical_count": critical_count,
        "categories": categories,
        "countries": countries,
        "urgency_by_category": urgency_by_cat,
        "hotspot_cities": hotspot_cities
    }

    try:
        recommendations = await generate_policy_recommendations(aggregated_data)
        return {"success": True, "data": recommendations, "based_on": total}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.post("/chat")
async def ai_chat(req: ChatRequest):
    """Conversational AI for policymakers"""
    db = get_db()

    # Build context summary
    total = await db.feedback.count_documents({})
    critical = await db.feedback.count_documents({"urgency_score": {"$gte": 8}})

    cat_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 5}
    ]
    top_cats = []
    async for doc in db.feedback.aggregate(cat_pipeline):
        if doc["_id"]:
            top_cats.append(f"{doc['_id']}: {doc['count']}")

    context = f"""Total feedback: {total}. Critical issues (urgency >= 8): {critical}.
Top categories: {', '.join(top_cats)}.
Platform covers BRICS nations: India, Brazil, Russia, China, South Africa."""

    try:
        answer = await chat_with_data(req.question, context)
        return {"success": True, "answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
