from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import connect_db, close_db, get_db
from routes import feedback, analytics, ai
from services.seed_service import seed_database
from services.cache import ensure_index as ensure_cache_index


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    db = get_db()
    await ensure_cache_index()   # Create TTL index on llm_cache collection
    await seed_database(db)
    yield
    await close_db()


app = FastAPI(
    title="CivicPulse API",
    description="Multilingual AI Platform for Citizen-Driven Infrastructure Governance — BRICS Digital Public Good",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback.router)
app.include_router(analytics.router)
app.include_router(ai.router)


@app.get("/")
async def root():
    return {
        "platform": "CivicPulse",
        "tagline": "Amplifying Every Voice for Smarter Infrastructure",
        "version": "1.0.0",
        "brics_nations": ["India", "Brazil", "Russia", "China", "South Africa"],
        "status": "operational"
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "platform": "CivicPulse"}
