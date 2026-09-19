# CivicPulse — Data Flow Diagram (DFD)
## BRICS AI Infrastructure Governance Platform

---

## Level 0 — Context Diagram

```
                         ┌─────────────────────────────┐
                         │                             │
   CITIZENS ─────────────► C I V I C P U L S E  AI  ◄──────── POLICYMAKERS
   (Voice/Text/SMS)       │  Infrastructure Platform   │        (Dashboard)
                         │                             ├──────► GOVERNMENT
   BRICS NATIONS ─────────►  [DPG - Open Source]       │        INVESTMENT
   (India, Brazil,       │                             │        DECISIONS
    Russia, China,       └─────────────────────────────┘
    South Africa)
```

---

## Level 1 — Main Processes

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  CITIZENS                                                                  │
│  ┌────────┐                                                                │
│  │ Voice  ├──────┐                                                         │
│  │ Input  │      │   ┌────────────────────────────────────────────────┐    │
│  └────────┘      │   │                                                │    │
│                  ├──►│  P1: INPUT COLLECTION & ROUTING                │    │
│  ┌────────┐      │   │  - Accept text / voice / webhook inputs        │    │
│  │  Text  ├──────┘   │  - Validate & normalize payload                │    │
│  │  Input │          │  - Route by channel (web/voice/whatsapp/sms)   │    │
│  └────────┘          └──────────────────┬─────────────────────────────┘    │
│                                         │                                  │
│                                         │ Raw text (any language)          │
│                                         ▼                                  │
│                       ┌─────────────────────────────────────────────────┐  │
│                       │  P2: GROQ AI PROCESSING ENGINE                  │  │
│                       │                                                 │  │
│                       │  ┌──────────────┐  ┌─────────────────────────┐ │  │
│                       │  │ Voice→Text   │  │ LLM Analysis Pipeline   │ │  │
│                       │  │ Whisper V3   │  │                         │ │  │
│                       │  │ (Multilingual│  │ 1. Language Detection   │ │  │
│                       │  │  STT)        │  │ 2. Auto Translation     │ │  │
│                       │  └──────┬───────┘  │ 3. Category Classify    │ │  │
│                       │         │          │ 4. Sentiment Analysis   │ │  │
│                       │         └─────────►│ 5. Urgency Scoring 1-10 │ │  │
│                       │                   │ 6. Keyword Extraction    │ │  │
│                       │                   │ 7. Summary Generation    │ │  │
│                       │                   └──────────────┬──────────┘ │  │
│                       └──────────────────────────────────┼────────────┘  │
│                                                          │                │
│                                    Enriched Feedback ────┘                │
│                                         │                                  │
│                                         ▼                                  │
│                       ┌─────────────────────────────────────────────────┐  │
│                       │  D1: MONGODB ATLAS — FEEDBACK STORE             │  │
│                       │  ┌──────────────────────────────────────────┐   │  │
│                       │  │ feedback collection                      │   │  │
│                       │  │ - Geospatial index on (lat, lng)         │   │  │
│                       │  │ - Compound index on (country, category)  │   │  │
│                       │  │ - Index on (urgency_score DESC)          │   │  │
│                       │  │ - Index on (created_at DESC)             │   │  │
│                       │  └──────────────────────────────────────────┘   │  │
│                       └──────────────────────────────────────────────────┘  │
│                                         │                                  │
│                     ┌───────────────────┼───────────────────┐              │
│                     │                   │                   │              │
│                     ▼                   ▼                   ▼              │
│         ┌───────────────────┐ ┌─────────────────┐ ┌────────────────────┐  │
│         │ P3: ANALYTICS     │ │ P4: HOTSPOT     │ │ P5: AI RECS        │  │
│         │ ENGINE            │ │ DETECTION       │ │ GENERATOR          │  │
│         │                   │ │                 │ │                    │  │
│         │ - Dashboard stats │ │ - Geo-aggregate │ │ - Aggregate context│  │
│         │ - Category counts │ │   by lat/lng    │ │ - Send to LLaMA    │  │
│         │ - Country compare │ │ - Weight by     │ │   3.3-70B          │  │
│         │ - Urgency buckets │ │   urgency score │ │ - Get 5 priority   │  │
│         │ - Trend timeline  │ │ - Return heat   │ │   recommendations  │  │
│         │                   │ │   points array  │ │ - SDG alignment    │  │
│         └─────────┬─────────┘ └────────┬────────┘ └─────────┬──────────┘  │
│                   │                    │                     │              │
└───────────────────┼────────────────────┼─────────────────────┼──────────────┘
                    │                    │                     │
                    └────────────────────┼─────────────────────┘
                                         │
                                         ▼
                         ┌───────────────────────────────┐
                         │  REACT FRONTEND DASHBOARD      │
                         │                               │
                         │  ┌─────────────────────────┐  │
                         │  │ Home                    │  │
                         │  │ - Live stats counters   │  │
                         │  │ - How it works          │  │
                         │  │ - Feature cards         │  │
                         │  └─────────────────────────┘  │
                         │                               │
                         │  ┌─────────────────────────┐  │
                         │  │ Citizen Portal          │  │
                         │  │ - Text/voice input      │  │
                         │  │ - Live AI analysis      │  │
                         │  │ - Language examples     │  │
                         │  │ - Submission confirm    │  │
                         │  └─────────────────────────┘  │
                         │                               │
                         │  ┌─────────────────────────┐  │
                         │  │ Policy Dashboard        │  │◄── POLICYMAKERS
                         │  │ - Leaflet.heat heatmap  │  │
                         │  │ - Category bar charts   │  │
                         │  │ - Urgency donut chart   │  │
                         │  │ - BRICS radar chart     │  │
                         │  │ - Country breakdown     │  │
                         │  │ - AI recommendations    │  │
                         │  │ - AI chat interface     │  │
                         │  └─────────────────────────┘  │
                         │                               │
                         │  ┌─────────────────────────┐  │
                         │  │ Project Tracker         │  │
                         │  │ - Feedback table        │  │
                         │  │ - Status filters        │  │
                         │  │ - Pagination            │  │
                         │  │ - Language tags         │  │
                         │  └─────────────────────────┘  │
                         └───────────────────────────────┘
```

---

## Level 2 — AI Processing Detail (P2 Expanded)

```
  Raw Input
  (any language)
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│            GROQ AI ENGINE — Detailed Flow                    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  If Voice Input:                                    │    │
│  │  Audio File ──► Groq whisper-large-v3-turbo         │    │
│  │                      │                              │    │
│  │                      ▼                              │    │
│  │               Transcribed Text                      │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Groq llama-3.3-70b-versatile — Single Prompt       │    │
│  │                                                     │    │
│  │  INPUT: Raw citizen feedback text                   │    │
│  │                                                     │    │
│  │  PROMPT ENGINEERING:                                │    │
│  │  - System: "BRICS infrastructure analyst"          │    │
│  │  - Context: All 10 infrastructure categories       │    │
│  │  - Urgency scale definition (1-10)                 │    │
│  │  - BRICS language awareness                        │    │
│  │                                                     │    │
│  │  OUTPUT JSON:                                       │    │
│  │  {                                                  │    │
│  │    detected_language: "hi",                        │    │
│  │    language_name: "Hindi",                         │    │
│  │    translated_text: "Water shortage...",           │    │
│  │    category: "Water Supply & Sanitation",          │    │
│  │    sentiment: "negative",                          │    │
│  │    urgency_score: 9,                               │    │
│  │    urgency_reason: "No water for 3 months",        │    │
│  │    keywords: ["water", "shortage", "village"],     │    │
│  │    summary: "Village water supply failure..."      │    │
│  │  }                                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                        │                                    │
│                        ▼                                    │
│               Enriched Feedback Object                      │
│               ──► MongoDB Atlas Storage                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Level 2 — Policy Recommendation Flow (P5 Expanded)

```
  MongoDB Aggregation
  ┌──────────────────────────────────────────────┐
  │  Pipeline 1: Total count & critical count    │
  │  Pipeline 2: Category counts + avg urgency   │
  │  Pipeline 3: Country distribution            │
  │  Pipeline 4: Urgency by category             │
  │  Pipeline 5: Top 10 hotspot cities          │
  └──────────────────┬───────────────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────┐
  │  Aggregated Context JSON                     │
  │  {                                           │
  │    total: 200,                               │
  │    critical_count: 45,                       │
  │    categories: { Healthcare: {count: 32, ..} │
  │    countries: { India: {count: 65, ...} }    │
  │    hotspot_cities: [{city: "Mumbai", ...}]   │
  │  }                                           │
  └──────────────────┬───────────────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────┐
  │  Groq llama-3.3-70b-versatile                │
  │  "Senior Policy Advisor" role prompt         │
  │                                              │
  │  OUTPUT:                                     │
  │  - Executive Summary (2-3 sentences)         │
  │  - 5 Ranked Priority Recommendations         │
  │    • Title, Category, Description            │
  │    • Affected Regions, Urgency level         │
  │    • Investment timeline                     │
  │    • Beneficiary count estimate              │
  │    • Expected impact                         │
  │  - Cross-cutting themes                      │
  │  - Data insights + policy implications       │
  │  - UN SDG alignment                          │
  └──────────────────────────────────────────────┘
                     │
                     ▼
  React AI Recommendations Panel
  (Policymaker Dashboard)
```

---

## Data Flow Summary Table

| Source | → Process | → Destination |
|--------|-----------|---------------|
| Citizen web form | Text validation | Groq AI Analysis |
| Citizen voice | Whisper transcription | Groq AI Analysis |
| Groq AI analysis | JSON enrichment | MongoDB Atlas |
| MongoDB Atlas | Geo-aggregation | Leaflet heatmap |
| MongoDB Atlas | Category aggregation | Recharts bar/pie |
| MongoDB Atlas | Country aggregation | Recharts radar |
| MongoDB Atlas | Context building | Groq policy recs |
| Groq policy recs | Structured JSON | React dashboard |
| Policymaker question | Chat context | Groq LLaMA 8B |

---

## External Data Stores & Integrations

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  MongoDB Atlas  │     │  Groq Cloud API  │     │ OpenStreetMap  │
│  (Free Tier)    │     │  (Free Tier)     │     │ (Free Tiles)    │
│                 │     │                 │     │                 │
│  Cluster 0      │     │ whisper-large   │     │ /{z}/{x}/{y}   │
│  civicpulse DB  │     │ llama-3.3-70b   │     │ .png tiles      │
│  feedback coll  │     │ llama-3.1-8b    │     │                 │
│  GeoIndex       │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                              FastAPI Backend
                          (Python + Motor async)
```

---

*CivicPulse DFD v1.0 — BRICS 2026 Hackathon Submission*
