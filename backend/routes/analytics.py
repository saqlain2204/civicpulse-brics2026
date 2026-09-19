from fastapi import APIRouter
from database import get_db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
async def get_dashboard_stats():
    """Get high-level dashboard summary stats"""
    db = get_db()

    total = await db.feedback.count_documents({})
    critical = await db.feedback.count_documents({"urgency_score": {"$gte": 8}})
    pending = await db.feedback.count_documents({"status": "pending"})
    implemented = await db.feedback.count_documents({"status": "implemented"})
    positive = await db.feedback.count_documents({"sentiment": "positive"})

    # Category distribution
    cat_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}, "avg_urgency": {"$avg": "$urgency_score"}}},
        {"$sort": {"count": -1}}
    ]
    categories = {}
    async for doc in db.feedback.aggregate(cat_pipeline):
        if doc["_id"]:
            categories[doc["_id"]] = {
                "count": doc["count"],
                "avg_urgency": round(doc["avg_urgency"], 1)
            }

    # Country distribution
    country_pipeline = [
        {"$group": {
            "_id": "$location.country",
            "count": {"$sum": 1},
            "avg_urgency": {"$avg": "$urgency_score"},
            "critical_count": {"$sum": {"$cond": [{"$gte": ["$urgency_score", 8]}, 1, 0]}}
        }},
        {"$sort": {"count": -1}}
    ]
    countries = {}
    async for doc in db.feedback.aggregate(country_pipeline):
        if doc["_id"]:
            countries[doc["_id"]] = {
                "count": doc["count"],
                "avg_urgency": round(doc["avg_urgency"], 1),
                "critical_count": doc["critical_count"]
            }

    # Urgency distribution
    urgency_pipeline = [
        {"$bucket": {
            "groupBy": "$urgency_score",
            "boundaries": [1, 4, 7, 9, 11],
            "default": "Other",
            "output": {"count": {"$sum": 1}}
        }}
    ]
    urgency_dist = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    async for doc in db.feedback.aggregate(urgency_pipeline):
        if doc["_id"] == 1:
            urgency_dist["low"] = doc["count"]
        elif doc["_id"] == 4:
            urgency_dist["medium"] = doc["count"]
        elif doc["_id"] == 7:
            urgency_dist["high"] = doc["count"]
        elif doc["_id"] == 9:
            urgency_dist["critical"] = doc["count"]

    # Recent trend (last 30 days by week)
    from datetime import datetime, timedelta
    trend_pipeline = [
        {"$match": {"created_at": {"$gte": datetime.utcnow() - timedelta(days=90)}}},
        {"$group": {
            "_id": {
                "year": {"$year": "$created_at"},
                "week": {"$week": "$created_at"}
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.year": 1, "_id.week": 1}},
        {"$limit": 12}
    ]
    trend = []
    async for doc in db.feedback.aggregate(trend_pipeline):
        trend.append({"week": f"W{doc['_id']['week']}", "count": doc["count"]})

    return {
        "total_feedback": total,
        "critical_issues": critical,
        "pending_review": pending,
        "implemented": implemented,
        "positive_feedback": positive,
        "satisfaction_rate": round((positive / total * 100) if total else 0, 1),
        "categories": categories,
        "countries": countries,
        "urgency_distribution": urgency_dist,
        "trend": trend
    }


@router.get("/hotspots")
async def get_hotspots(min_urgency: int = 1, country: str = None):
    """Return geo-data for heatmap visualization"""
    db = get_db()
    query = {"location.lat": {"$ne": 0}, "location.lng": {"$ne": 0}}
    if min_urgency > 1:
        query["urgency_score"] = {"$gte": min_urgency}
    if country:
        query["location.country"] = country

    cursor = db.feedback.find(query, {
        "location": 1, "urgency_score": 1, "category": 1, "sentiment": 1, "summary": 1, "city": 1
    })

    points = []
    async for doc in cursor:
        loc = doc.get("location", {})
        if loc.get("lat") and loc.get("lng"):
            points.append({
                "lat": loc["lat"],
                "lng": loc["lng"],
                "intensity": doc.get("urgency_score", 5) / 10,
                "urgency": doc.get("urgency_score", 5),
                "category": doc.get("category", ""),
                "city": loc.get("city", ""),
                "country": loc.get("country", ""),
                "sentiment": doc.get("sentiment", "neutral"),
                "id": str(doc["_id"])
            })

    return {"points": points, "total": len(points)}


@router.get("/categories")
async def get_category_breakdown(country: str = None):
    db = get_db()
    match = {}
    if country:
        match["location.country"] = country

    pipeline = [
        {"$match": match} if match else {"$match": {}},
        {"$group": {
            "_id": "$category",
            "total": {"$sum": 1},
            "avg_urgency": {"$avg": "$urgency_score"},
            "critical": {"$sum": {"$cond": [{"$gte": ["$urgency_score", 8]}, 1, 0]}},
            "positive": {"$sum": {"$cond": [{"$eq": ["$sentiment", "positive"]}, 1, 0]}},
        }},
        {"$sort": {"total": -1}}
    ]

    results = []
    async for doc in db.feedback.aggregate(pipeline):
        if doc["_id"]:
            results.append({
                "category": doc["_id"],
                "total": doc["total"],
                "avg_urgency": round(doc["avg_urgency"], 1),
                "critical": doc["critical"],
                "positive": doc["positive"],
            })
    return {"data": results}


@router.get("/countries")
async def get_country_comparison():
    db = get_db()
    pipeline = [
        {"$group": {
            "_id": {
                "country": "$location.country",
                "category": "$category"
            },
            "count": {"$sum": 1},
            "avg_urgency": {"$avg": "$urgency_score"}
        }},
        {"$sort": {"count": -1}}
    ]

    country_data = {}
    async for doc in db.feedback.aggregate(pipeline):
        country = doc["_id"]["country"]
        category = doc["_id"]["category"]
        if not country:
            continue
        if country not in country_data:
            country_data[country] = {"total": 0, "categories": {}}
        country_data[country]["total"] += doc["count"]
        country_data[country]["categories"][category] = {
            "count": doc["count"],
            "avg_urgency": round(doc["avg_urgency"], 1)
        }

    return {"data": country_data}


@router.get("/timeline")
async def get_submission_timeline():
    """Get submission counts over time for sparkline charts"""
    from datetime import datetime, timedelta
    db = get_db()

    pipeline = [
        {"$match": {"created_at": {"$gte": datetime.utcnow() - timedelta(days=90)}}},
        {"$group": {
            "_id": {
                "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
            },
            "count": {"$sum": 1},
            "avg_urgency": {"$avg": "$urgency_score"}
        }},
        {"$sort": {"_id": 1}}
    ]

    timeline = []
    async for doc in db.feedback.aggregate(pipeline):
        timeline.append({
            "date": doc["_id"],
            "count": doc["count"],
            "avg_urgency": round(doc["avg_urgency"], 1)
        })

    return {"data": timeline}
