"""
National Demographic Data, Infrastructure Indices, and Public Investment Plans for BRICS Nations.
Maintained as an in-memory knowledge service (zero database footprint) to enrich AI policy recommendations
and power the SDG Alignment & Priority Matrix dashboard.
"""
from typing import Dict, Any, Optional

BRICS_NATIONAL_DATA: Dict[str, Dict[str, Any]] = {
    "India": {
        "demographics": {
            "population": 1428000000,
            "urbanization_pct": 36.4,
            "hdi": 0.644,
            "internet_penetration_pct": 52.4,
            "median_age": 28.7,
            "vulnerable_rural_pct": 63.6,
        },
        "infrastructure_indices": {
            # Scale 0-100 (Higher = superior baseline access/quality)
            "Roads & Transportation": 54,
            "Water Supply & Sanitation": 58,
            "Healthcare": 51,
            "Education": 62,
            "Electricity & Power": 74,
            "Digital Infrastructure": 69,
            "Housing": 49,
            "Agriculture Support": 56,
            "Public Safety": 59,
            "Environmental": 44,
        },
        "public_investment_plans": {
            "annual_capex_usd_bn": 133.0,
            "national_flagship_schemes": [
                {"name": "PM Gati Shakti National Master Plan", "target_sectors": ["Roads & Transportation", "Digital Infrastructure"], "budget_usd_bn": 120.0},
                {"name": "Jal Jeevan Mission", "target_sectors": ["Water Supply & Sanitation"], "budget_usd_bn": 45.0},
                {"name": "Bharatmala Pariyojana", "target_sectors": ["Roads & Transportation"], "budget_usd_bn": 70.0},
                {"name": "Ayushman Bharat Infrastructure Mission", "target_sectors": ["Healthcare"], "budget_usd_bn": 8.5},
                {"name": "Pradhan Mantri Awas Yojana (PMAY)", "target_sectors": ["Housing"], "budget_usd_bn": 24.0},
                {"name": "Digital India & BharatNet 5G", "target_sectors": ["Digital Infrastructure"], "budget_usd_bn": 18.0}
            ],
            "sector_budgets_usd_bn": {
                "Roads & Transportation": 32.5,
                "Water Supply & Sanitation": 11.2,
                "Healthcare": 10.8,
                "Education": 14.5,
                "Electricity & Power": 9.4,
                "Digital Infrastructure": 8.2,
                "Housing": 6.8,
                "Agriculture Support": 15.0,
                "Public Safety": 7.2,
                "Environmental": 4.1,
            },
            "funding_mechanism": "Consolidated Fund of India & NDB Concessional Loans"
        }
    },
    "Brazil": {
        "demographics": {
            "population": 215300000,
            "urbanization_pct": 87.8,
            "hdi": 0.754,
            "internet_penetration_pct": 81.2,
            "median_age": 33.5,
            "vulnerable_rural_pct": 12.2,
        },
        "infrastructure_indices": {
            "Roads & Transportation": 48,
            "Water Supply & Sanitation": 63,
            "Healthcare": 61,
            "Education": 64,
            "Electricity & Power": 82,
            "Digital Infrastructure": 74,
            "Housing": 52,
            "Agriculture Support": 70,
            "Public Safety": 46,
            "Environmental": 53,
        },
        "public_investment_plans": {
            "annual_capex_usd_bn": 72.0,
            "national_flagship_schemes": [
                {"name": "Novo PAC (Growth Acceleration Program)", "target_sectors": ["Roads & Transportation", "Electricity & Power", "Digital Infrastructure"], "budget_usd_bn": 350.0},
                {"name": "Marco Legal do Saneamento Básico", "target_sectors": ["Water Supply & Sanitation"], "budget_usd_bn": 140.0},
                {"name": "Minha Casa, Minha Vida", "target_sectors": ["Housing"], "budget_usd_bn": 28.0},
                {"name": "Luz Para Todos", "target_sectors": ["Electricity & Power"], "budget_usd_bn": 5.0},
                {"name": "Fundo Amazônia & Plano Clima", "target_sectors": ["Environmental"], "budget_usd_bn": 4.5}
            ],
            "sector_budgets_usd_bn": {
                "Roads & Transportation": 14.2,
                "Water Supply & Sanitation": 7.8,
                "Healthcare": 16.5,
                "Education": 18.0,
                "Electricity & Power": 11.2,
                "Digital Infrastructure": 5.4,
                "Housing": 8.0,
                "Agriculture Support": 12.3,
                "Public Safety": 6.8,
                "Environmental": 3.9,
            },
            "funding_mechanism": "BNDES Development Bank & Federal Budget"
        }
    },
    "Russia": {
        "demographics": {
            "population": 144200000,
            "urbanization_pct": 75.1,
            "hdi": 0.822,
            "internet_penetration_pct": 88.2,
            "median_age": 40.3,
            "vulnerable_rural_pct": 24.9,
        },
        "infrastructure_indices": {
            "Roads & Transportation": 59,
            "Water Supply & Sanitation": 71,
            "Healthcare": 68,
            "Education": 78,
            "Electricity & Power": 85,
            "Digital Infrastructure": 79,
            "Housing": 67,
            "Agriculture Support": 64,
            "Public Safety": 66,
            "Environmental": 50,
        },
        "public_investment_plans": {
            "annual_capex_usd_bn": 85.0,
            "national_flagship_schemes": [
                {"name": "National Projects 2024-2030", "target_sectors": ["Healthcare", "Education", "Digital Infrastructure"], "budget_usd_bn": 400.0},
                {"name": "Safe and High-Quality Roads Federal Project", "target_sectors": ["Roads & Transportation"], "budget_usd_bn": 65.0},
                {"name": "Clean Water (Chistaya Voda)", "target_sectors": ["Water Supply & Sanitation"], "budget_usd_bn": 8.0},
                {"name": "Digital Economy of the Russian Federation", "target_sectors": ["Digital Infrastructure"], "budget_usd_bn": 22.0},
                {"name": "Far East & Arctic Development Corridor", "target_sectors": ["Roads & Transportation", "Electricity & Power"], "budget_usd_bn": 35.0}
            ],
            "sector_budgets_usd_bn": {
                "Roads & Transportation": 22.0,
                "Water Supply & Sanitation": 6.5,
                "Healthcare": 19.5,
                "Education": 15.0,
                "Electricity & Power": 18.2,
                "Digital Infrastructure": 7.5,
                "Housing": 12.0,
                "Agriculture Support": 9.0,
                "Public Safety": 11.0,
                "Environmental": 4.5,
            },
            "funding_mechanism": "National Wealth Fund & VEB.RF Development Corp"
        }
    },
    "China": {
        "demographics": {
            "population": 1411000000,
            "urbanization_pct": 66.2,
            "hdi": 0.768,
            "internet_penetration_pct": 76.4,
            "median_age": 38.4,
            "vulnerable_rural_pct": 33.8,
        },
        "infrastructure_indices": {
            "Roads & Transportation": 86,
            "Water Supply & Sanitation": 78,
            "Healthcare": 74,
            "Education": 79,
            "Electricity & Power": 92,
            "Digital Infrastructure": 91,
            "Housing": 75,
            "Agriculture Support": 76,
            "Public Safety": 82,
            "Environmental": 61,
        },
        "public_investment_plans": {
            "annual_capex_usd_bn": 480.0,
            "national_flagship_schemes": [
                {"name": "14th Five-Year Infrastructure Modernization Plan", "target_sectors": ["Electricity & Power", "Roads & Transportation"], "budget_usd_bn": 1800.0},
                {"name": "New Infrastructure Initiative (5G, AI, Ultra-HV Grids)", "target_sectors": ["Digital Infrastructure", "Electricity & Power"], "budget_usd_bn": 420.0},
                {"name": "Rural Revitalization & Piped Water Campaign", "target_sectors": ["Water Supply & Sanitation", "Agriculture Support"], "budget_usd_bn": 150.0},
                {"name": "South-to-North Water Diversion Expansion", "target_sectors": ["Water Supply & Sanitation"], "budget_usd_bn": 80.0},
                {"name": "Dual Carbon (Peak Carbon 2030) Energy Transition", "target_sectors": ["Environmental", "Electricity & Power"], "budget_usd_bn": 300.0}
            ],
            "sector_budgets_usd_bn": {
                "Roads & Transportation": 85.0,
                "Water Supply & Sanitation": 35.0,
                "Healthcare": 42.0,
                "Education": 55.0,
                "Electricity & Power": 78.0,
                "Digital Infrastructure": 48.0,
                "Housing": 32.0,
                "Agriculture Support": 38.0,
                "Public Safety": 26.0,
                "Environmental": 29.0,
            },
            "funding_mechanism": "China Development Bank (CDB) & Local Government Special Bonds"
        }
    },
    "South Africa": {
        "demographics": {
            "population": 60600000,
            "urbanization_pct": 68.3,
            "hdi": 0.713,
            "internet_penetration_pct": 72.3,
            "median_age": 27.6,
            "vulnerable_rural_pct": 31.7,
        },
        "infrastructure_indices": {
            "Roads & Transportation": 51,
            "Water Supply & Sanitation": 46,
            "Healthcare": 49,
            "Education": 52,
            "Electricity & Power": 38,
            "Digital Infrastructure": 63,
            "Housing": 44,
            "Agriculture Support": 50,
            "Public Safety": 39,
            "Environmental": 47,
        },
        "public_investment_plans": {
            "annual_capex_usd_bn": 28.0,
            "national_flagship_schemes": [
                {"name": "National Infrastructure Plan 2050 (NIP 2050)", "target_sectors": ["Electricity & Power", "Water Supply & Sanitation", "Roads & Transportation"], "budget_usd_bn": 130.0},
                {"name": "Energy Action Plan & Eskom Grid Transformation", "target_sectors": ["Electricity & Power"], "budget_usd_bn": 28.0},
                {"name": "National Water & Sanitation Master Plan", "target_sectors": ["Water Supply & Sanitation"], "budget_usd_bn": 45.0},
                {"name": "SA Connect Broadband Expansion", "target_sectors": ["Digital Infrastructure"], "budget_usd_bn": 4.5},
                {"name": "Strategic Integrated Projects (SIPs) Gazetted Portfolio", "target_sectors": ["Housing", "Healthcare"], "budget_usd_bn": 20.0}
            ],
            "sector_budgets_usd_bn": {
                "Roads & Transportation": 7.5,
                "Water Supply & Sanitation": 3.8,
                "Healthcare": 8.2,
                "Education": 9.5,
                "Electricity & Power": 6.8,
                "Digital Infrastructure": 2.1,
                "Housing": 3.5,
                "Agriculture Support": 3.0,
                "Public Safety": 4.8,
                "Environmental": 1.5,
            },
            "funding_mechanism": "Development Bank of Southern Africa (DBSA) & Just Energy Transition Investment"
        }
    }
}

SDG_CATEGORY_MAPPING = {
    "Roads & Transportation": {
        "sdgs": [9, 11],
        "sdg_names": ["SDG 9: Industry, Innovation & Infrastructure", "SDG 11: Sustainable Cities & Communities"],
        "target": "Affordable and sustainable transport access for all"
    },
    "Water Supply & Sanitation": {
        "sdgs": [6],
        "sdg_names": ["SDG 6: Clean Water & Sanitation"],
        "target": "Universal and equitable access to safe and affordable drinking water"
    },
    "Healthcare": {
        "sdgs": [3],
        "sdg_names": ["SDG 3: Good Health & Well-being"],
        "target": "Universal health coverage, including financial risk protection and primary care access"
    },
    "Education": {
        "sdgs": [4],
        "sdg_names": ["SDG 4: Quality Education"],
        "target": "Upgrade education facilities child-, disability- and gender-sensitive"
    },
    "Electricity & Power": {
        "sdgs": [7],
        "sdg_names": ["SDG 7: Affordable & Clean Energy"],
        "target": "Universal access to affordable, reliable and modern energy services"
    },
    "Digital Infrastructure": {
        "sdgs": [9],
        "sdg_names": ["SDG 9: Industry, Innovation & Infrastructure"],
        "target": "Significantly increase access to information and communications technology"
    },
    "Housing": {
        "sdgs": [11],
        "sdg_names": ["SDG 11: Sustainable Cities & Communities"],
        "target": "Access for all to adequate, safe and affordable housing and basic services"
    },
    "Agriculture Support": {
        "sdgs": [2],
        "sdg_names": ["SDG 2: Zero Hunger"],
        "target": "Support small-scale food producers with resilient agricultural infrastructure"
    },
    "Public Safety": {
        "sdgs": [16],
        "sdg_names": ["SDG 16: Peace, Justice & Strong Institutions"],
        "target": "Significantly reduce all forms of violence and crime in urban habitats"
    },
    "Environmental": {
        "sdgs": [13, 15],
        "sdg_names": ["SDG 13: Climate Action", "SDG 15: Life on Land"],
        "target": "Strengthen resilience and adaptive capacity to climate-related hazards"
    }
}


def get_all_national_data() -> Dict[str, Any]:
    """Return complete in-memory demographic, index, and budget data for all BRICS nations."""
    return BRICS_NATIONAL_DATA


def get_national_data_for_country(country: str) -> Optional[Dict[str, Any]]:
    """Return demographic, index, and budget data for a specific BRICS nation."""
    return BRICS_NATIONAL_DATA.get(country)


def get_sdg_mapping() -> Dict[str, Any]:
    """Return UN SDG mapping for all 10 infrastructure categories."""
    return SDG_CATEGORY_MAPPING


def format_national_context_for_llm(focus_country: Optional[str] = None) -> str:
    """
    Format national demographics, infrastructure deficits, and public investment plans
    into a structured text block for Groq LLaMA prompt injection.
    """
    lines = []
    countries = [focus_country] if (focus_country and focus_country in BRICS_NATIONAL_DATA) else list(BRICS_NATIONAL_DATA.keys())
    
    for country in countries:
        cdata = BRICS_NATIONAL_DATA[country]
        demo = cdata["demographics"]
        indices = cdata["infrastructure_indices"]
        plans = cdata["public_investment_plans"]
        
        # Identify acute deficit sectors (index < 60)
        deficits = [f"{cat} (Index: {val}/100)" for cat, val in indices.items() if val < 60]
        flagships = [f"{p['name']} (${p['budget_usd_bn']}B)" for p in plans["national_flagship_schemes"][:3]]
        
        lines.append(f"""### {country}:
- Demographics: Population {demo['population']:,}, Urbanization {demo['urbanization_pct']}%, HDI {demo['hdi']}, Internet Penetration {demo['internet_penetration_pct']}%.
- Critical Infrastructure Deficits (Index < 60): {', '.join(deficits) if deficits else 'Moderate baseline'}.
- Key Public Investment Plans: {'; '.join(flagships)}.
- Total Annual Infrastructure CapEx: ${plans['annual_capex_usd_bn']} Billion.""")

    return "\n\n".join(lines)


def calculate_priority_score(demand_count: int, avg_urgency: float, infra_index: int, sector_budget_bn: float) -> Dict[str, Any]:
    """
    Calculate Priority Deficit Score:
    Higher score means greater urgency to intervene:
    - High citizen complaint volume & urgency
    - Low existing infrastructure index (high deficit)
    - Low current public expenditure relative to need
    """
    # Deficit factor: 0-100 (inverted index)
    deficit_factor = max(1.0, 100.0 - infra_index)
    # Urgency weight
    urgency_factor = max(1.0, avg_urgency)
    # Budget gap multiplier: sectors with < $10B annual budget get higher priority factor
    budget_gap_weight = 1.5 if sector_budget_bn < 8.0 else (1.2 if sector_budget_bn < 15.0 else 0.9)
    
    raw_score = (demand_count * 0.4 + urgency_factor * 8) * (deficit_factor / 30.0) * budget_gap_weight
    normalized_score = min(100.0, round(raw_score, 1))
    
    if normalized_score >= 75:
        tier = "Critical (Immediate Intervention)"
    elif normalized_score >= 50:
        tier = "High Priority (Budget Reallocation)"
    elif normalized_score >= 30:
        tier = "Medium Priority"
    else:
        tier = "Low / Monitoring"
        
    return {
        "score": normalized_score,
        "tier": tier,
        "deficit_index": deficit_factor,
        "sector_budget_usd_bn": sector_budget_bn,
        "baseline_index": infra_index
    }

