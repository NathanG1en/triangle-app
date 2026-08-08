import pytest

def test_get_ingestion_sources(client):
    response = client.get("/api/v1/ingestion/sources")
    assert response.status_code == 200
    data = response.json()
    assert "sources" in data
    assert len(data["sources"]) >= 3
    source_names = [s["source_name"] for s in data["sources"]]
    assert "Durham Lowdown Newsletter" in source_names
    assert "Indy Week Events" in source_names
    assert "Raleigh Magazine" in source_names

def test_trigger_live_ingestion(client):
    response = client.post("/api/v1/ingestion/trigger")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["sources_scraped"] >= 3
    assert data["total_ingested"] >= 1
