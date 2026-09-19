# CivicPulse — High-Level Design (HLD)
## BRICS AI Infrastructure Governance Platform

---

## 1. Project Overview

**Name:** CivicPulse  
**Tagline:** *Amplifying Every Voice for Smarter Infrastructure*  
**Track:** Track 1 — AI for Digital Public Infrastructure & Governance  
**Theme:** Innovation | Digital Public Good

CivicPulse is a multilingual, AI-powered citizen feedback aggregation platform that enables BRICS governments to:
- Collect infrastructure development requests from citizens via voice, text, WhatsApp, SMS, and web
- Analyze, classify, and score feedback using Groq AI in 15+ languages
- Visualize demand hotspots on interactive geographic heatmaps
- Generate actionable, AI-powered policy recommendations for national policymakers

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CITIZEN INPUT LAYER                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │   Web    │ │  Voice   │ │ WhatsApp │ │   SMS    │ │ Telegram │ │
│  │  Portal  │ │  (Mic)   │ │ Webhook  │ │  (USSD)  │ │   Bot    │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
└───────┼────────────┼────────────┼────────────┼────────────┼────────┘
        │            │            │            │            │
        └────────────┴────────────┴────────────┴────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │       FastAPI Backend        │
                    │     (Python / REST API)      │
                    └─────────────┬──────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│   GROQ AI ENGINE  │  │  MongoDB Atlas DB  │  │  Analytics Engine │
│  ┌─────────────┐  │  │  ┌─────────────┐  │  │  ┌─────────────┐  │
│  │ Whisper V3  │  │  │  │  feedback   │  │  │  │  Hotspot    │  │
│  │ (Voice→Text)│  │  │  │  collection │  │  │  │  Detection  │  │
│  └─────────────┘  │  │  └─────────────┘  │  │  └─────────────┘  │
│  ┌─────────────┐  │  │  ┌─────────────┐  │  │  ┌─────────────┐  │
│  │ LLaMA 3.3  │  │  │  │  Geospatial │  │  │  │  Priority   │  │
│  │    70B     │  │  │  │   Indexes   │  │  │  │  Scoring    │  │
│  └─────────────┘  │  │  └─────────────┘  │  │  └─────────────┘  │
│  ┌─────────────┐  │  └───────────────────┘  │  ┌─────────────┐  │
│  │ LLaMA 3.1  │  │                          │  │  Category   │  │
│  │    8B      │  │                          │  │  Aggregation│  │
│  └─────────────┘  │                          │  └─────────────┘  │
└───────────────────┘                          └───────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │       React Frontend         │
                    │   Vite + Tailwind CSS        │
                    └─────────────┬──────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│  Citizen Portal   │  │ Policy Dashboard  │  │ Project Tracker   │
│  - Text input     │  │ - Live heatmaps   │  │ - Status tracking │
│  - Voice capture  │  │ - Analytics       │  │ - Pagination      │
│  - Language auto  │  │ - AI recs         │  │ - Filtering       │
│  - Live AI preview│  │ - Country compare │  │ - Search          │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite | Fast, modern SPA |
| **Styling** | Tailwind CSS | Dark-theme responsive UI |
| **Maps** | Leaflet.js + react-leaflet | Interactive geospatial heatmaps |
| **Map Heatmap** | leaflet.heat | Demand hotspot visualization |
| **Map Clustering** | react-leaflet-cluster | Marker aggregation |
| **Charts** | Recharts | Bar, Pie, Radar, Area charts |
| **Backend** | Python FastAPI | High-performance REST API |
| **Database** | MongoDB Atlas (Free) | Geospatially-indexed document store |
| **ODM** | Motor (async PyMongo) | Async MongoDB driver |
| **AI — LLM** | Groq llama-3.3-70b-versatile | Analysis, translation, recommendations |
| **AI — Fast** | Groq llama-3.1-8b-instant | Quick classification |
| **AI — Voice** | Groq whisper-large-v3-turbo | Multilingual voice transcription |
| **Base Map** | OpenStreetMap | Free global map tiles |

---

## 4. Module Breakdown

### 4.1 Citizen Input Module
- **Web form**: Text area with real-time AI preview as user types
- **Voice capture**: Browser MediaRecorder API → Groq Whisper → text
- **Channel routing**: Supports web / voice / whatsapp / sms / telegram source tags
- **Location mapping**: Country + city → pre-set geocoordinates

### 4.2 AI Processing Pipeline (Groq)
```
Input Text / Transcription
         │
         ▼
   Language Detection
         │
         ▼
  English Translation
         │
         ▼
  Category Classification
  (10 infrastructure categories)
         │
         ▼
  Sentiment Analysis
  (positive / negative / neutral)
         │
         ▼
  Urgency Scoring (1-10)
  + Urgency Reason
         │
         ▼
  Keyword Extraction
         │
         ▼
  1-sentence Summary
         │
         ▼
  MongoDB Storage with GeoIndex
```

### 4.3 Analytics Engine
- **Demand Hotspots**: Geo-aggregation of feedback by lat/lng with urgency intensity
- **Category Breakdown**: Counts + avg urgency per infrastructure category
- **Country Comparison**: Cross-BRICS radar chart data
- **Urgency Distribution**: Bucketed urgency score histograms
- **Timeline Trends**: Weekly submission counts

### 4.4 AI Policy Recommendations
- Aggregates data: totals, categories, countries, urgency, hotspot cities
- Sends structured context to Groq llama-3.3-70b-versatile
- Returns: 5 ranked recommendations, SDG alignment, data insights, executive summary
- Conversational AI chat for policymaker Q&A

### 4.5 Geospatial Heatmap
- Points fetched from MongoDB with lat/lng/urgency
- leaflet.heat renders intensity-weighted heatmap
- Color gradient: Green(low) → Blue → Amber → Red(critical)
- Toggle between heatmap overlay and cluster markers

---

## 5. Data Models

### Feedback Document (MongoDB)
```json
{
  "_id": "ObjectId",
  "text": "Original citizen text (any language)",
  "translated_text": "English translation",
  "original_language": "hi|pt|ru|zh|zu|en|...",
  "category": "Roads & Transportation | Water Supply | Healthcare | ...",
  "sentiment": "positive | negative | neutral",
  "urgency_score": 1-10,
  "urgency_reason": "Brief explanation",
  "keywords": ["keyword1", "keyword2"],
  "summary": "One-sentence English summary",
  "location": {
    "country": "India | Brazil | Russia | China | South Africa",
    "region": "State/Province",
    "city": "City name",
    "lat": 19.076,
    "lng": 72.877
  },
  "status": "pending | in_review | approved | implemented",
  "source": "web | voice | whatsapp | sms | telegram",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

---

## 6. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback/submit` | Submit text feedback |
| POST | `/api/feedback/voice` | Submit voice feedback |
| GET | `/api/feedback/list` | Paginated feedback list |
| GET | `/api/feedback/projects` | Project status aggregation |
| GET | `/api/analytics/dashboard` | Summary statistics |
| GET | `/api/analytics/hotspots` | Geo-points for heatmap |
| GET | `/api/analytics/categories` | Category breakdown |
| GET | `/api/analytics/countries` | Country comparison |
| GET | `/api/analytics/timeline` | Submission trends |
| POST | `/api/ai/analyze` | Instant text analysis |
| GET | `/api/ai/recommendations` | AI policy recommendations |
| POST | `/api/ai/chat` | Conversational AI Q&A |

---

## 7. Infrastructure Categories Covered

1. Roads & Transportation
2. Water Supply & Sanitation
3. Healthcare
4. Education
5. Electricity & Power
6. Digital Infrastructure
7. Housing
8. Agriculture Support
9. Public Safety
10. Environmental

---

## 8. Supported Languages

| Country | Languages |
|---------|-----------|
| India | Hindi (hi), Tamil (ta), Telugu (te), Bengali (bn), Marathi (mr), Gujarati (gu), English (en) |
| Brazil | Portuguese (pt) |
| Russia | Russian (ru) |
| China | Mandarin Chinese (zh) |
| South Africa | English (en), Zulu (zu), Afrikaans (af), Xhosa (xh) |

---

## 9. Key Differentiators (Winning Factors)

1. **Real-time Live AI Analysis** — As user types, Groq AI provides instant category/urgency preview
2. **Interactive Heatmap** — Visual demand hotspots across all 5 BRICS nations simultaneously
3. **True Multilingual** — Voice input transcribed by Whisper in any BRICS language
4. **AI Policy Recommendations** — LLM-generated, SDG-aligned, investment-ready recommendations
5. **Digital Public Good** — Open-source, privacy-first, no vendor lock-in
6. **Cross-Nation Radar Chart** — Side-by-side BRICS infrastructure gap comparison
7. **Full-Stack Production Quality** — Dark-themed, responsive, professional UI
8. **Zero-cost Infrastructure** — MongoDB Atlas free tier + Groq free API

---

## 10. Scalability Considerations

- **MongoDB Atlas**: Scales to millions of documents with geospatial sharding
- **Motor (async)**: Non-blocking I/O handles high concurrent API requests
- **Groq**: 30 RPM free, 1000 RPD — sufficient for hackathon; upgrade path available
- **React + Vite**: Code-split, lazy-loaded pages for fast initial load
- **Leaflet.heat**: Handles 10,000+ geo-points client-side with WebGL
- **Horizontal scaling**: FastAPI + MongoDB supports container orchestration

---

*CivicPulse — Where citizen voices become national policy. Built for BRICS 2026.*
