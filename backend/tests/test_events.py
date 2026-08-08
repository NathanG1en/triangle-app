from datetime import datetime, timedelta
import pytest
from app.models.events import Event

@pytest.fixture(autouse=True)
def seed_test_events():
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    e1 = Event(
        title="Cary Outdoor Concert",
        description="Great music in Cary",
        venue_name="Downtown Cary Park",
        city="Cary",
        start_at=datetime.utcnow() + timedelta(days=1),
        category="Arts & Music",
        is_free=True,
        source_name="Town of Cary",
        external_id="ext_cary_01"
    )
    e2 = Event(
        title="Durham Food Truck Rally",
        description="Tasty trucks in Durham",
        venue_name="Fullsteam Brewery",
        city="Durham",
        start_at=datetime.utcnow() + timedelta(days=2),
        category="Food & Drink",
        is_free=False,
        price_min=10.0,
        source_name="Durham Lowdown",
        external_id="ext_durham_02"
    )
    db.add(e1)
    db.add(e2)
    db.commit()
    db.close()

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_events_list(client):
    response = client.get("/api/v1/events")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

def test_city_filter(client):
    response = client.get("/api/v1/events?city=Cary")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    cary_events = [e for e in data if e["city"] == "Cary"]
    assert len(cary_events) >= 1

def test_attendance_toggle(client):
    res = client.get("/api/v1/events?city=Cary")
    event_id = res.json()[0]["id"]

    att_res = client.post(
        f"/api/v1/events/{event_id}/attendance",
        json={
            "user_id": "user_1",
            "user_name": "Test User",
            "user_avatar": "https://example.com/avatar.jpg",
            "status": "GOING"
        }
    )
    assert att_res.status_code == 200
    updated = att_res.json()
    assert updated["going_count"] >= 1
    assert updated["user_attendance_status"] == "GOING"

def test_trigger_sample_ingestion(client):
    response = client.post("/api/v1/events/ingest/sample-durham-newsletter")
    assert response.status_code == 200
    ingested = response.json()
    assert len(ingested) >= 2
