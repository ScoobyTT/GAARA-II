from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["mock_mode"] is True

def test_kpi_summary_brasil():
    response = client.get("/api/v1/kpi/summary?uf=Todos&ano_inicio=2014&ano_fim=2026")
    assert response.status_code == 200
    data = response.json()
    assert data["uf"] == "Todos"
    assert data["total_notificados"] > 0
    assert data["total_confirmados"] > 0
    assert data["taxa_letalidade"] >= 0.0

def test_kpi_summary_uf():
    response = client.get("/api/v1/kpi/summary?uf=SP&ano_inicio=2020&ano_fim=2024")
    assert response.status_code == 200
    data = response.json()
    assert data["uf"] == "SP"
    assert data["ano_inicio"] == 2020
    assert data["ano_fim"] == 2024

def test_temporal_evolution():
    response = client.get("/api/v1/temporal/evolution?uf=Todos&ano_inicio=2024&ano_fim=2024")
    assert response.status_code == 200
    data = response.json()
    assert data["uf"] == "Todos"
    assert len(data["dados"]) == 12  # 12 meses em 2024
    assert data["dados"][0]["casos_notificados"] > 0

def test_age_pyramid():
    response = client.get("/api/v1/demography/pyramid?uf=Todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data["dados"]) == 20  # 10 faixas etárias * 2 sexos (M/F)

def test_control_diagram():
    response = client.get("/api/v1/epidemiology/control-diagram?uf=BA")
    assert response.status_code == 200
    data = response.json()
    assert data["uf"] == "BA"
    assert len(data["dados"]) == 52  # 52 semanas epidemiológicas
    assert data["dados"][0]["q1"] <= data["dados"][0]["mediana"] <= data["dados"][0]["q3"]

def test_spatial_map():
    response = client.get("/api/v1/spatial/map?uf=Todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data["estados"]) == 27  # 27 UFs do Brasil
    assert len(data["municipios"]) > 0

def test_alerts_summary():
    response = client.get("/api/v1/alerts/summary?uf=Todos")
    assert response.status_code == 200
    data = response.json()
    assert data["total_alertas_ativos"] >= 0
    assert len(data["alertas"]) > 0

def test_simulation_predict():
    payload = {
        "uf": "Todos",
        "delta_temperatura": 1.5,
        "delta_precipitacao": 20.0,
        "delta_umidade": 10.0,
        "semanas_projecao": 8
    }
    response = client.post("/api/v1/simulation/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["aumento_medio_casos_pct"] > 0
    assert len(data["curva_projecao"]) == 8
