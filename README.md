# 🌍 CivicPulse — BRICS AI Infrastructure Governance Platform

> *Amplifying Every Voice for Smarter Infrastructure*

**Track 1 — AI for Digital Public Infrastructure & Governance | BRICS 2026**

---

## What is CivicPulse?

CivicPulse is a multilingual AI-powered Digital Public Good that aggregates citizen infrastructure feedback from BRICS nations (India, Brazil, Russia, China, South Africa) via voice, text, and messaging apps — then surfaces demand hotspots and AI-powered policy recommendations to national policymakers.

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas free account → [https://mongodb.com/atlas](https://mongodb.com/atlas)
- Groq Cloud API key → [https://console.groq.com](https://console.groq.com)

### 1. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and GROQ_API_KEY
```

### 2. Start Backend
```powershell
.\start-backend.ps1
# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 3. Start Frontend
```powershell
.\start-frontend.ps1
# App runs at http://localhost:5173
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Maps | Leaflet.js + leaflet.heat (OpenStreetMap) |
| Charts | Recharts (Bar, Pie, Radar, Area) |
| Backend | Python FastAPI + Motor async |
| Database | MongoDB Atlas (Free Tier) |
| AI — Analysis | Groq `llama-3.3-70b-versatile` |
| AI — Fast | Groq `llama-3.1-8b-instant` |
| AI — Voice | Groq `whisper-large-v3-turbo` |

---

## Key Features

- 🎙️ **Voice Input** — Groq Whisper transcribes voice in any BRICS language
- 🌐 **Multilingual** — Auto-detects and translates Hindi, Portuguese, Russian, Chinese, Zulu, and more
- 🗺️ **Live Heatmaps** — Interactive demand hotspot maps across all 5 BRICS nations
- ⚡ **Real-time AI Analysis** — Live category, sentiment, and urgency scoring as you type
- 🤖 **AI Policy Recommendations** — LLaMA 3.3-70B generates SDG-aligned investment recommendations
- 💬 **AI Chat** — Conversational interface for policymakers to query the data
- 📊 **Cross-Nation Analytics** — Radar charts comparing infrastructure gaps across BRICS
- 🔒 **Privacy-First** — Anonymized, no personal data stored

---

## Architecture

See [docs/HLD.md](docs/HLD.md) for High-Level Design  
See [docs/DFD.md](docs/DFD.md) for Data Flow Diagrams

---

## API Documentation

After starting the backend, visit: **http://localhost:8000/docs**

Key endpoints:
- `POST /api/feedback/submit` — Submit citizen feedback
- `POST /api/feedback/voice` — Submit voice feedback  
- `GET /api/analytics/hotspots` — Geo-points for heatmap
- `GET /api/analytics/dashboard` — Summary statistics
- `GET /api/ai/recommendations` — AI policy recommendations
- `POST /api/ai/chat` — Conversational AI Q&A

---

## Project Structure

```
civicpulse/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration
│   ├── database.py          # MongoDB connection
│   ├── requirements.txt
│   ├── .env                 # Your credentials (not committed)
│   ├── routes/
│   │   ├── feedback.py      # Submit & list feedback
│   │   ├── analytics.py     # Dashboard & hotspot data
│   │   └── ai.py            # AI analysis & recommendations
│   ├── services/
│   │   ├── groq_service.py  # Groq AI integration
│   │   └── seed_service.py  # Demo data seeding
│   └── models/
│       └── feedback.py      # Pydantic schemas
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx         # Landing page
│       │   ├── CitizenPortal.jsx # Submit feedback
│       │   ├── Dashboard.jsx    # Policy dashboard
│       │   └── ProjectTracker.jsx
│       └── components/
│           ├── map/HeatMap.jsx  # Leaflet heatmap
│           ├── charts/          # Recharts components
│           ├── AIRecommendations.jsx
│           └── Navbar.jsx
├── docs/
│   ├── HLD.md               # High-Level Design
│   └── DFD.md               # Data Flow Diagrams
├── start-backend.ps1
└── start-frontend.ps1
```

---

## Demo Data

The backend auto-seeds ~60 realistic feedback entries across all 5 BRICS nations in multiple languages (Hindi, Portuguese, Russian, Chinese, Zulu, English) on first run — no setup required.

---

*Built for BRICS 2026 Hackathon — Code for Communities*  
*CivicPulse is an open Digital Public Good under MIT License*
