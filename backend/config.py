import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "civicpulse")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Primary model for analysis and recommendations (120B - best quality)
GROQ_MODEL = "openai/gpt-oss-120b"
# Fast model for quick classification (20B - faster)
GROQ_FAST_MODEL = "openai/gpt-oss-20b"
# Voice transcription model
GROQ_WHISPER_MODEL = "whisper-large-v3-turbo"

BRICS_COUNTRIES = ["India", "Brazil", "Russia", "China", "South Africa"]

INFRASTRUCTURE_CATEGORIES = [
    "Roads & Transportation",
    "Water Supply & Sanitation",
    "Healthcare",
    "Education",
    "Electricity & Power",
    "Digital Infrastructure",
    "Housing",
    "Agriculture Support",
    "Public Safety",
    "Environmental"
]
