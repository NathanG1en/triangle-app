import os
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.services.seed_data import seed_database

# Use in-memory SQLite database with StaticPool for test isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    # Seed data
    db = TestingSessionLocal()
    from app.models.events import Event, Attendance
    db.query(Attendance).delete()
    db.query(Event).delete()
    
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
    yield
    Base.metadata.drop_all(bind=engine)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_events_list():
    response = client.get("/api/v1/events")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_city_filter():
    response = client.get("/api/v1/events?city=Cary")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["city"] == "Cary"
    assert data[0]["title"] == "Cary Outdoor Concert"

def test_attendance_toggle():
    # Fetch first event
    res = client.get("/api/v1/events?city=Cary")
    event_id = res.json()[0]["id"]

    # Mark user_1 as GOING
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
    assert updated["going_count"] == 1
    assert updated["user_attendance_status"] == "GOING"
    assert len(updated["attendees"]) == 1
    assert updated["attendees"][0]["user_name"] == "Test User"

def test_trigger_sample_ingestion():
    response = client.post("/api/v1/events/ingest/sample-durham-newsletter")
    assert response.status_code == 200
    ingested = response.json()
    assert len(ingested) >= 2
