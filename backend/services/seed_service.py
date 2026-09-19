"""
Seed realistic BRICS citizen feedback data for demo purposes.
Covers all 5 BRICS nations with diverse infrastructure issues.
"""
import random
from datetime import datetime, timedelta

SEED_DATA = [
    # ============ INDIA ============
    {"text": "Our village road in Rajasthan has been completely destroyed by monsoon rains. Vehicles cannot pass, children cannot reach school.", "category": "Roads & Transportation", "country": "India", "region": "Rajasthan", "city": "Jaipur", "lat": 26.9124, "lng": 75.7873, "urgency_score": 8, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "हमारे गांव में पानी की भारी कमी है। पिछले तीन महीनों से नल में पानी नहीं आया।", "category": "Water Supply & Sanitation", "country": "India", "region": "Uttar Pradesh", "city": "Lucknow", "lat": 26.8467, "lng": 80.9462, "urgency_score": 9, "sentiment": "negative", "original_language": "hi", "source": "voice"},
    {"text": "The nearest government hospital is 80 kilometers away. We desperately need a primary health center in our taluka.", "category": "Healthcare", "country": "India", "region": "Maharashtra", "city": "Pune", "lat": 18.5204, "lng": 73.8567, "urgency_score": 9, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "School has no proper classrooms, students sit under trees during monsoon season. This is unacceptable.", "category": "Education", "country": "India", "region": "West Bengal", "city": "Kolkata", "lat": 22.5726, "lng": 88.3639, "urgency_score": 7, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "Power cuts happen 10-12 hours daily. Businesses are shutting down, patients on medical equipment are at risk.", "category": "Electricity & Power", "country": "India", "region": "Andhra Pradesh", "city": "Hyderabad", "lat": 17.3850, "lng": 78.4867, "urgency_score": 9, "sentiment": "negative", "original_language": "en", "source": "whatsapp"},
    {"text": "Internet speed in rural Maharashtra is less than 1 Mbps. Students cannot attend online classes, remote work is impossible.", "category": "Digital Infrastructure", "country": "India", "region": "Maharashtra", "city": "Mumbai", "lat": 19.0760, "lng": 72.8777, "urgency_score": 7, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "बाढ़ के कारण हमारी झोपड़ियां टूट गई हैं। सरकार से आवास की मांग है।", "category": "Housing", "country": "India", "region": "Bihar", "city": "Patna", "lat": 25.5941, "lng": 85.1376, "urgency_score": 10, "sentiment": "negative", "original_language": "hi", "source": "voice"},
    {"text": "Farmers in our district have no access to cold storage facilities. Crops worth millions rot every year.", "category": "Agriculture Support", "country": "India", "region": "Punjab", "city": "Amritsar", "lat": 31.6340, "lng": 74.8723, "urgency_score": 8, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "The new digital health portal launched by the government is excellent! We can now book appointments online.", "category": "Digital Infrastructure", "country": "India", "region": "Karnataka", "city": "Bangalore", "lat": 12.9716, "lng": 77.5946, "urgency_score": 3, "sentiment": "positive", "original_language": "en", "source": "web"},
    {"text": "Sewage system in our ward has been overflowing for weeks. Disease is spreading rapidly.", "category": "Water Supply & Sanitation", "country": "India", "region": "Tamil Nadu", "city": "Chennai", "lat": 13.0827, "lng": 80.2707, "urgency_score": 9, "sentiment": "negative", "original_language": "en", "source": "whatsapp"},
    {"text": "Road connectivity between tribal villages and main city needs urgent improvement in Jharkhand.", "category": "Roads & Transportation", "country": "India", "region": "Jharkhand", "city": "Ranchi", "lat": 23.3441, "lng": 85.3096, "urgency_score": 8, "sentiment": "negative", "original_language": "en", "source": "sms"},
    {"text": "Gujarat water project has transformed our village! Clean water at our doorstep now.", "category": "Water Supply & Sanitation", "country": "India", "region": "Gujarat", "city": "Ahmedabad", "lat": 23.0225, "lng": 72.5714, "urgency_score": 2, "sentiment": "positive", "original_language": "en", "source": "web"},
    {"text": "ग्रामीण क्षेत्रों में मोबाइल नेटवर्क बिल्कुल नहीं है। डिजिटल इंडिया कब आएगा?", "category": "Digital Infrastructure", "country": "India", "region": "Madhya Pradesh", "city": "Bhopal", "lat": 23.2599, "lng": 77.4126, "urgency_score": 7, "sentiment": "negative", "original_language": "hi", "source": "voice"},
    {"text": "Public safety infrastructure in Delhi outskirts needs massive improvement. Street lights non-functional.", "category": "Public Safety", "country": "India", "region": "Delhi", "city": "New Delhi", "lat": 28.6139, "lng": 77.2090, "urgency_score": 7, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "New metro line in Delhi has reduced commute time drastically. Great infrastructure investment!", "category": "Roads & Transportation", "country": "India", "region": "Delhi", "city": "New Delhi", "lat": 28.7041, "lng": 77.1025, "urgency_score": 2, "sentiment": "positive", "original_language": "en", "source": "web"},

    # ============ BRAZIL ============
    {"text": "As estradas da nossa comunidade no interior do Nordeste estão completamente destruídas. A chuva acabou com tudo.", "category": "Roads & Transportation", "country": "Brazil", "region": "Ceará", "city": "Fortaleza", "lat": -3.7172, "lng": -38.5433, "urgency_score": 8, "sentiment": "negative", "original_language": "pt", "source": "web"},
    {"text": "Precisamos urgentemente de postos de saúde na periferia de São Paulo. A espera por atendimento é de 6 horas.", "category": "Healthcare", "country": "Brazil", "region": "São Paulo", "city": "São Paulo", "lat": -23.5505, "lng": -46.6333, "urgency_score": 8, "sentiment": "negative", "original_language": "pt", "source": "whatsapp"},
    {"text": "Falta de saneamento básico no Rio é uma crise de saúde pública. Esgoto a céu aberto no bairro.", "category": "Water Supply & Sanitation", "country": "Brazil", "region": "Rio de Janeiro", "city": "Rio de Janeiro", "lat": -22.9068, "lng": -43.1729, "urgency_score": 9, "sentiment": "negative", "original_language": "pt", "source": "web"},
    {"text": "As escolas públicas do Amazonas não têm energia elétrica suficiente. Aulas canceladas frequentemente.", "category": "Education", "country": "Brazil", "region": "Amazonas", "city": "Manaus", "lat": -3.1190, "lng": -60.0217, "urgency_score": 7, "sentiment": "negative", "original_language": "pt", "source": "web"},
    {"text": "A falta de internet de qualidade no interior da Bahia impede o desenvolvimento econômico da região.", "category": "Digital Infrastructure", "country": "Brazil", "region": "Bahia", "city": "Salvador", "lat": -12.9714, "lng": -38.5014, "urgency_score": 7, "sentiment": "negative", "original_language": "pt", "source": "voice"},
    {"text": "Famílias sem teto em Recife após enchentes. Necessitamos habitação de emergência com urgência.", "category": "Housing", "country": "Brazil", "region": "Pernambuco", "city": "Recife", "lat": -8.0476, "lng": -34.8770, "urgency_score": 10, "sentiment": "negative", "original_language": "pt", "source": "sms"},
    {"text": "O sistema de transporte público em Belo Horizonte melhorou muito com o BRT. Parabéns ao governo.", "category": "Roads & Transportation", "country": "Brazil", "region": "Minas Gerais", "city": "Belo Horizonte", "lat": -19.9167, "lng": -43.9345, "urgency_score": 2, "sentiment": "positive", "original_language": "pt", "source": "web"},
    {"text": "Apagões frequentes em Brasília afetam serviços essenciais. Hospitais operam com geradores.", "category": "Electricity & Power", "country": "Brazil", "region": "Distrito Federal", "city": "Brasília", "lat": -15.8267, "lng": -47.9218, "urgency_score": 8, "sentiment": "negative", "original_language": "pt", "source": "web"},
    {"text": "Agricultores do Paraná precisam de suporte tecnológico e infraestrutura para irrigação.", "category": "Agriculture Support", "country": "Brazil", "region": "Paraná", "city": "Curitiba", "lat": -25.4284, "lng": -49.2733, "urgency_score": 6, "sentiment": "negative", "original_language": "pt", "source": "web"},
    {"text": "Violência nas periferias de São Paulo está fora de controle. Precisamos de mais segurança pública.", "category": "Public Safety", "country": "Brazil", "region": "São Paulo", "city": "São Paulo", "lat": -23.6505, "lng": -46.7333, "urgency_score": 9, "sentiment": "negative", "original_language": "pt", "source": "whatsapp"},
    {"text": "A qualidade da água em Porto Alegre piorou muito. Análises mostram contaminação.", "category": "Water Supply & Sanitation", "country": "Brazil", "region": "Rio Grande do Sul", "city": "Porto Alegre", "lat": -30.0346, "lng": -51.2177, "urgency_score": 9, "sentiment": "negative", "original_language": "pt", "source": "web"},
    {"text": "Desmatamento na Amazônia está destruindo nosso meio ambiente. Precisamos de políticas ambientais urgentes.", "category": "Environmental", "country": "Brazil", "region": "Pará", "city": "Belém", "lat": -1.4558, "lng": -48.5044, "urgency_score": 9, "sentiment": "negative", "original_language": "pt", "source": "web"},

    # ============ RUSSIA ============
    {"text": "Дороги в нашем районе Сибири требуют срочного ремонта. Весной они становятся непроходимыми.", "category": "Roads & Transportation", "country": "Russia", "region": "Siberia", "city": "Novosibirsk", "lat": 54.9833, "lng": 82.8964, "urgency_score": 8, "sentiment": "negative", "original_language": "ru", "source": "web"},
    {"text": "Нехватка медицинских учреждений в отдалённых районах Урала. Ближайшая больница в 100 км.", "category": "Healthcare", "country": "Russia", "region": "Ural", "city": "Yekaterinburg", "lat": 56.8380, "lng": 60.6054, "urgency_score": 9, "sentiment": "negative", "original_language": "ru", "source": "voice"},
    {"text": "Качество воды в Нижнем Новгороде ухудшилось. Жители вынуждены покупать бутилированную воду.", "category": "Water Supply & Sanitation", "country": "Russia", "region": "Nizhny Novgorod Oblast", "city": "Nizhny Novgorod", "lat": 56.2965, "lng": 43.9361, "urgency_score": 8, "sentiment": "negative", "original_language": "ru", "source": "web"},
    {"text": "Школы в Казани испытывают острую нехватку учителей и современного оборудования.", "category": "Education", "country": "Russia", "region": "Tatarstan", "city": "Kazan", "lat": 55.7887, "lng": 49.1221, "urgency_score": 7, "sentiment": "negative", "original_language": "ru", "source": "web"},
    {"text": "Интернет-инфраструктура в сельских районах Омской области крайне слабая.", "category": "Digital Infrastructure", "country": "Russia", "region": "Omsk Oblast", "city": "Omsk", "lat": 54.9884, "lng": 73.3242, "urgency_score": 7, "sentiment": "negative", "original_language": "ru", "source": "web"},
    {"text": "Перебои с электроснабжением в Челябинске участились. Промышленные предприятия несут убытки.", "category": "Electricity & Power", "country": "Russia", "region": "Chelyabinsk Oblast", "city": "Chelyabinsk", "lat": 55.1599, "lng": 61.4022, "urgency_score": 8, "sentiment": "negative", "original_language": "ru", "source": "web"},
    {"text": "Программа реновации жилья в Москве работает эффективно! Получили новую квартиру.", "category": "Housing", "country": "Russia", "region": "Moscow", "city": "Moscow", "lat": 55.7558, "lng": 37.6173, "urgency_score": 2, "sentiment": "positive", "original_language": "ru", "source": "web"},
    {"text": "Экологическая обстановка в промышленных районах Екатеринбурга вызывает серьёзные опасения.", "category": "Environmental", "country": "Russia", "region": "Ural", "city": "Yekaterinburg", "lat": 56.9380, "lng": 60.7054, "urgency_score": 8, "sentiment": "negative", "original_language": "ru", "source": "web"},
    {"text": "Санкт-Петербург - отличный пример современной городской инфраструктуры в России.", "category": "Roads & Transportation", "country": "Russia", "region": "Saint Petersburg", "city": "Saint Petersburg", "lat": 59.9343, "lng": 30.3351, "urgency_score": 2, "sentiment": "positive", "original_language": "ru", "source": "web"},
    {"text": "Сельскохозяйственная инфраструктура в Краснодарском крае нуждается в модернизации.", "category": "Agriculture Support", "country": "Russia", "region": "Krasnodar", "city": "Krasnodar", "lat": 45.0355, "lng": 38.9753, "urgency_score": 6, "sentiment": "negative", "original_language": "ru", "source": "web"},

    # ============ CHINA ============
    {"text": "农村地区网络基础设施急需改善。很多学生无法参加网络课程。", "category": "Digital Infrastructure", "country": "China", "region": "Sichuan", "city": "Chengdu", "lat": 30.5728, "lng": 104.0668, "urgency_score": 8, "sentiment": "negative", "original_language": "zh", "source": "web"},
    {"text": "我们村庄的道路状况非常差，尤其是雨季无法通行。请求修建硬化道路。", "category": "Roads & Transportation", "country": "China", "region": "Hubei", "city": "Wuhan", "lat": 30.5928, "lng": 114.3055, "urgency_score": 7, "sentiment": "negative", "original_language": "zh", "source": "voice"},
    {"text": "偏远地区农村的医疗设施严重不足，看病难、看病贵的问题亟需解决。", "category": "Healthcare", "country": "China", "region": "Shaanxi", "city": "Xi'an", "lat": 34.3416, "lng": 108.9398, "urgency_score": 9, "sentiment": "negative", "original_language": "zh", "source": "web"},
    {"text": "农村学校教育设施落后，缺少实验室和图书馆，影响教育质量。", "category": "Education", "country": "China", "region": "Zhejiang", "city": "Hangzhou", "lat": 30.2741, "lng": 120.1551, "urgency_score": 7, "sentiment": "negative", "original_language": "zh", "source": "web"},
    {"text": "城市空气污染问题严重，工厂排放超标，居民健康受到威胁。", "category": "Environmental", "country": "China", "region": "Beijing", "city": "Beijing", "lat": 39.9042, "lng": 116.4074, "urgency_score": 8, "sentiment": "negative", "original_language": "zh", "source": "web"},
    {"text": "上海公共交通系统非常完善，是其他城市学习的榜样。", "category": "Roads & Transportation", "country": "China", "region": "Shanghai", "city": "Shanghai", "lat": 31.2304, "lng": 121.4737, "urgency_score": 2, "sentiment": "positive", "original_language": "zh", "source": "web"},
    {"text": "重庆山区农民缺乏现代农业技术支持和灌溉设施，影响农业生产。", "category": "Agriculture Support", "country": "China", "region": "Chongqing", "city": "Chongqing", "lat": 29.4316, "lng": 106.9123, "urgency_score": 7, "sentiment": "negative", "original_language": "zh", "source": "web"},
    {"text": "广州部分老城区供水管道老化，经常发生爆管，影响居民生活。", "category": "Water Supply & Sanitation", "country": "China", "region": "Guangdong", "city": "Guangzhou", "lat": 23.1291, "lng": 113.2644, "urgency_score": 8, "sentiment": "negative", "original_language": "zh", "source": "web"},
    {"text": "深圳5G网络覆盖全面，数字化基础设施建设走在全国前列，值得推广。", "category": "Digital Infrastructure", "country": "China", "region": "Guangdong", "city": "Shenzhen", "lat": 22.5431, "lng": 114.0579, "urgency_score": 2, "sentiment": "positive", "original_language": "zh", "source": "web"},
    {"text": "农村住房质量差，危房改造工程推进缓慢，需要加快进度。", "category": "Housing", "country": "China", "region": "Hunan", "city": "Changsha", "lat": 28.2282, "lng": 112.9388, "urgency_score": 7, "sentiment": "negative", "original_language": "zh", "source": "web"},

    # ============ SOUTH AFRICA ============
    {"text": "Our township has been without water for three weeks. Children are getting sick. This is a humanitarian crisis.", "category": "Water Supply & Sanitation", "country": "South Africa", "region": "Gauteng", "city": "Johannesburg", "lat": -26.2041, "lng": 28.0473, "urgency_score": 10, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "Load shedding stage 6 is destroying small businesses in Cape Town. We lose millions daily. Government must act.", "category": "Electricity & Power", "country": "South Africa", "region": "Western Cape", "city": "Cape Town", "lat": -33.9249, "lng": 18.4241, "urgency_score": 9, "sentiment": "negative", "original_language": "en", "source": "whatsapp"},
    {"text": "Imigwaqo yasemakhaya iyashaywa kabi futhi idinga ukuphashwa ngokushesha.", "category": "Roads & Transportation", "country": "South Africa", "region": "KwaZulu-Natal", "city": "Durban", "lat": -29.8587, "lng": 31.0218, "urgency_score": 8, "sentiment": "negative", "original_language": "zu", "source": "voice"},
    {"text": "Rural hospitals in Limpopo are severely understaffed and undersupplied. Maternal mortality is rising.", "category": "Healthcare", "country": "South Africa", "region": "Limpopo", "city": "Polokwane", "lat": -23.9045, "lng": 29.4689, "urgency_score": 10, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "Schools in townships lack basic sanitation facilities. Students are learning in deplorable conditions.", "category": "Education", "country": "South Africa", "region": "Eastern Cape", "city": "East London", "lat": -33.0153, "lng": 27.9116, "urgency_score": 8, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "Informal settlements need urgent upgrading. Floods destroy homes every winter. People need permanent housing.", "category": "Housing", "country": "South Africa", "region": "Gauteng", "city": "Pretoria", "lat": -25.7461, "lng": 28.1881, "urgency_score": 9, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "Internet connectivity in rural areas of Free State is non-existent. Youth cannot access online jobs.", "category": "Digital Infrastructure", "country": "South Africa", "region": "Free State", "city": "Bloemfontein", "lat": -29.0852, "lng": 26.1596, "urgency_score": 7, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "Crime rate in Port Elizabeth is alarming. More police stations and community safety programs needed.", "category": "Public Safety", "country": "South Africa", "region": "Eastern Cape", "city": "Port Elizabeth", "lat": -33.9608, "lng": 25.6022, "urgency_score": 8, "sentiment": "negative", "original_language": "en", "source": "web"},
    {"text": "Drought conditions are devastating small-scale farmers. Irrigation support infrastructure is urgently needed.", "category": "Agriculture Support", "country": "South Africa", "region": "Northern Cape", "city": "Kimberley", "lat": -28.7282, "lng": 24.7499, "urgency_score": 9, "sentiment": "negative", "original_language": "en", "source": "sms"},
    {"text": "Cape Town's water management after the Day Zero crisis is exemplary. Excellent conservation infrastructure!", "category": "Water Supply & Sanitation", "country": "South Africa", "region": "Western Cape", "city": "Cape Town", "lat": -33.8249, "lng": 18.5241, "urgency_score": 2, "sentiment": "positive", "original_language": "en", "source": "web"},
    {"text": "Johannesburg's new BRT system is reducing traffic congestion significantly.", "category": "Roads & Transportation", "country": "South Africa", "region": "Gauteng", "city": "Johannesburg", "lat": -26.1041, "lng": 28.0973, "urgency_score": 3, "sentiment": "positive", "original_language": "en", "source": "web"},
    {"text": "Waste management in Durban townships is a disaster. Mountains of garbage, disease risks everywhere.", "category": "Water Supply & Sanitation", "country": "South Africa", "region": "KwaZulu-Natal", "city": "Durban", "lat": -29.9587, "lng": 30.9218, "urgency_score": 9, "sentiment": "negative", "original_language": "en", "source": "whatsapp"},

    # Additional spread data for richer heatmap
    {"text": "Bridge in Assam has collapsed, entire district is cut off from supplies and medical care.", "category": "Roads & Transportation", "country": "India", "region": "Assam", "city": "Guwahati", "lat": 26.1445, "lng": 91.7362, "urgency_score": 10, "sentiment": "negative", "original_language": "en", "source": "sms"},
    {"text": "E-governance initiative in Telangana is working exceptionally well! Services delivered at doorstep.", "category": "Digital Infrastructure", "country": "India", "region": "Telangana", "city": "Hyderabad", "lat": 17.4850, "lng": 78.5867, "urgency_score": 2, "sentiment": "positive", "original_language": "en", "source": "web"},
    {"text": "Falta de coleta de lixo sistemática em Salvador causa problemas de saúde pública.", "category": "Water Supply & Sanitation", "country": "Brazil", "region": "Bahia", "city": "Salvador", "lat": -13.0714, "lng": -38.4014, "urgency_score": 8, "sentiment": "negative", "original_language": "pt", "source": "web"},
    {"text": "Проблема загрязнения реки Волги требует немедленного вмешательства государства.", "category": "Environmental", "country": "Russia", "region": "Volga Region", "city": "Samara", "lat": 53.1959, "lng": 50.1602, "urgency_score": 8, "sentiment": "negative", "original_language": "ru", "source": "web"},
    {"text": "内蒙古牧区缺乏基本医疗和教育设施，牧民生活条件亟需改善。", "category": "Healthcare", "country": "China", "region": "Inner Mongolia", "city": "Hohhot", "lat": 40.8414, "lng": 111.7519, "urgency_score": 8, "sentiment": "negative", "original_language": "zh", "source": "voice"},
    {"text": "The new solar energy project in Northern Cape is transforming our community's electricity access!", "category": "Electricity & Power", "country": "South Africa", "region": "Northern Cape", "city": "Upington", "lat": -28.4478, "lng": 21.2561, "urgency_score": 2, "sentiment": "positive", "original_language": "en", "source": "web"},
]


async def seed_database(db) -> int:
    """Insert seed data if collection is empty, return count inserted"""
    count = await db.feedback.count_documents({})
    if count > 0:
        print(f"[INFO] Database already has {count} records, skipping seed.")
        return 0

    now = datetime.utcnow()
    docs = []
    for i, item in enumerate(SEED_DATA):
        # Spread created_at over last 90 days for realistic timeline
        days_ago = random.randint(0, 90)
        hours_ago = random.randint(0, 23)
        created = now - timedelta(days=days_ago, hours=hours_ago)

        # Assign statuses based on age
        if days_ago > 60:
            status = random.choice(["implemented", "in_review"])
        elif days_ago > 30:
            status = random.choice(["in_review", "approved"])
        else:
            status = random.choice(["pending", "in_review", "pending"])

        doc = {
            "text": item["text"],
            "translated_text": item["text"] if item["original_language"] == "en" else f"[AI Translation] {item['text'][:80]}...",
            "original_language": item["original_language"],
            "category": item["category"],
            "sentiment": item["sentiment"],
            "urgency_score": item["urgency_score"],
            "keywords": [],
            "location": {
                "country": item["country"],
                "region": item["region"],
                "city": item["city"],
                "lat": item["lat"] + random.uniform(-0.15, 0.15),
                "lng": item["lng"] + random.uniform(-0.15, 0.15),
            },
            "status": status,
            "source": item["source"],
            "created_at": created,
            "updated_at": created,
        }
        docs.append(doc)

    result = await db.feedback.insert_many(docs)
    print(f"[OK] Seeded {len(result.inserted_ids)} feedback records.")
    return len(result.inserted_ids)
