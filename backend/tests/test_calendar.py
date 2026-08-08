from datetime import datetime, timedelta
import pytest
from app.models.events import Event

@pytest.fixture(autouse=True)
def seed_calendar_test_events():
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
        external_id="ext_cary_cal_01"
    )
    db.add(e1)
    db.commit()
    db.close()

def test_export_event_ics(client):
    res = client.get("/api/v1/events?city=Cary")
    assert res.status_code == 200
    events = res.json()
    assert len(events) >= 1
    event_id = events[0]["id"]

    response = client.get(f"/api/v1/calendar/events/{event_id}/export.ics")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/calendar")
    content = response.text
    assert "BEGIN:VCALENDAR" in content
    assert "BEGIN:VEVENT" in content
    assert "SUMMARY:" in content
    assert "END:VCALENDAR" in content

def test_get_google_calendar_url(client):
    res = client.get("/api/v1/events?city=Cary")
    events = res.json()
    event_id = events[0]["id"]

    response = client.get(f"/api/v1/calendar/events/{event_id}/google-url")
    assert response.status_code == 200
    data = response.json()
    assert "google_calendar_url" in data
    assert "https://calendar.google.com/calendar/render" in data["google_calendar_url"]

def test_export_user_calendar_feed(client):
    response = client.get("/api/v1/calendar/users/user_1/feed.ics")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/calendar")
    content = response.text
    assert "BEGIN:VCALENDAR" in content
    assert "X-WR-CALNAME:Triangle Social Cohort Feed" in content
