from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class Location(BaseModel):
    country: str
    region: str
    city: str
    lat: float
    lng: float

class FeedbackSubmit(BaseModel):
    text: str
    language: Optional[str] = "en"
    category: Optional[str] = None
    country: str
    region: Optional[str] = ""
    city: Optional[str] = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    source: Optional[Literal["web", "voice", "whatsapp", "sms", "telegram"]] = "web"

class FeedbackResponse(BaseModel):
    id: str
    text: str
    translated_text: Optional[str]
    original_language: str
    category: str
    sentiment: str
    urgency_score: int
    keywords: list[str]
    location: dict
    status: str
    source: str
    created_at: datetime
