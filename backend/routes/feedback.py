from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from datetime import datetime
from bson import ObjectId
from database import get_db
from models.feedback import FeedbackSubmit
from services.groq_service import analyze_feedback, transcribe_voice

router = APIRouter(prefix="/api/feedback", tags=["feedback"])

def serialize_doc(doc):
    doc["id"] = str(doc.pop("_id"))
    doc["created_at"] = doc["created_at"].isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at")
    doc["updated_at"] = doc["updated_at"].isoformat() if isinstance(doc.get("updated_at"), datetime) else doc.get("updated_at")
    return doc


@router.post("/submit")
async def submit_feedback(payload: FeedbackSubmit):
    """Submit citizen feedback via text"""
    db = get_db()
    try:
        # Use Groq AI to analyze the feedback
        ai_result = await analyze_feedback(payload.text, payload.language or "auto")
    except Exception as e:
        print(f"AI analysis error: {e}")
        # Fallback if AI fails
        ai_result = {
            "detected_language": payload.language or "en",
            "language_name": "Unknown",
            "translated_text": payload.text,
            "category": payload.category or "Roads & Transportation",
            "sentiment": "neutral",
            "urgency_score": 5,
            "urgency_reason": "Manual submission",
            "keywords": [],
            "summary": payload.text[:100]
        }

    doc = {
        "text": payload.text,
        "translated_text": ai_result.get("translated_text", payload.text),
        "original_language": ai_result.get("detected_language", "en"),
        "category": ai_result.get("category", payload.category or "Roads & Transportation"),
        "sentiment": ai_result.get("sentiment", "neutral"),
        "urgency_score": ai_result.get("urgency_score", 5),
        "urgency_reason": ai_result.get("urgency_reason", ""),
        "keywords": ai_result.get("keywords", []),
        "summary": ai_result.get("summary", ""),
        "location": {
            "country": payload.country,
            "region": payload.region or "",
            "city": payload.city or "",
            "lat": payload.lat or 0.0,
            "lng": payload.lng or 0.0,
        },
        "status": "pending",
        "source": payload.source or "web",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.feedback.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()

    return {
        "success": True,
        "message": "Feedback submitted and analyzed successfully",
        "data": doc,
        "ai_analysis": ai_result
    }


@router.post("/voice")
async def submit_voice_feedback(
    audio: UploadFile = File(...),
    country: str = Form(...),
    region: str = Form(""),
    city: str = Form(""),
    lat: float = Form(0.0),
    lng: float = Form(0.0),
    source: str = Form("voice"),
):
    """Submit voice feedback - transcribed by Groq Whisper then analyzed"""
    db = get_db()

    audio_bytes = await audio.read()
    try:
        transcribed_text = await transcribe_voice(audio_bytes, audio.filename or "audio.wav")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Voice transcription failed: {str(e)}")

    try:
        ai_result = await analyze_feedback(transcribed_text)
    except Exception as e:
        ai_result = {
            "detected_language": "en", "language_name": "English",
            "translated_text": transcribed_text, "category": "Roads & Transportation",
            "sentiment": "neutral", "urgency_score": 5, "keywords": [], "summary": transcribed_text[:100]
        }

    doc = {
        "text": transcribed_text,
        "translated_text": ai_result.get("translated_text", transcribed_text),
        "original_language": ai_result.get("detected_language", "en"),
        "category": ai_result.get("category"),
        "sentiment": ai_result.get("sentiment", "neutral"),
        "urgency_score": ai_result.get("urgency_score", 5),
        "keywords": ai_result.get("keywords", []),
        "summary": ai_result.get("summary", ""),
        "location": {"country": country, "region": region, "city": city, "lat": lat, "lng": lng},
        "status": "pending",
        "source": "voice",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.feedback.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()

    return {
        "success": True,
        "transcribed_text": transcribed_text,
        "message": "Voice feedback transcribed and analyzed",
        "data": doc,
        "ai_analysis": ai_result
    }


@router.get("/list")
async def list_feedback(
    page: int = 1,
    limit: int = 20,
    country: str = None,
    category: str = None,
    status: str = None,
    min_urgency: int = None,
):
    db = get_db()
    query = {}
    if country:
        query["location.country"] = country
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    if min_urgency:
        query["urgency_score"] = {"$gte": min_urgency}

    total = await db.feedback.count_documents(query)
    cursor = db.feedback.find(query).sort("created_at", -1).skip((page - 1) * limit).limit(limit)
    docs = []
    async for doc in cursor:
        docs.append(serialize_doc(doc))

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "data": docs
    }


@router.get("/projects")
async def get_projects():
    """Get aggregated project status overview"""
    db = get_db()
    pipeline = [
        {"$group": {
            "_id": {"category": "$category", "country": "$location.country", "status": "$status"},
            "count": {"$sum": 1},
            "avg_urgency": {"$avg": "$urgency_score"}
        }},
        {"$sort": {"avg_urgency": -1}},
        {"$limit": 50}
    ]
    cursor = db.feedback.aggregate(pipeline)
    projects = []
    async for doc in cursor:
        projects.append({
            "category": doc["_id"]["category"],
            "country": doc["_id"]["country"],
            "status": doc["_id"]["status"],
            "count": doc["count"],
            "avg_urgency": round(doc["avg_urgency"], 1)
        })
    return {"data": projects}
