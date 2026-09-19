from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, MONGO_DB

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    # Create indexes
    await db.feedback.create_index([("location.country", 1)])
    await db.feedback.create_index([("category", 1)])
    await db.feedback.create_index([("urgency_score", -1)])
    await db.feedback.create_index([("created_at", -1)])
    await db.feedback.create_index([("location.lat", 1), ("location.lng", 1)])
    print(f"[OK] Connected to MongoDB: {MONGO_DB}")

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db
