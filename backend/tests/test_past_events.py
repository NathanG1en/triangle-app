from datetime import datetime, timedelta
import pytest
from app.models.events import Event

def test_past_event_filtering(client):
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()

    now = datetime.utcnow()

    # Past event (3 days ago)
    past_ev = Event(
        title="Old Durham Farmers Market",
        city="Durham",
        start_at=now - timedelta(days=3),
        category="Food & Drink",
        is_free=True,
        external_id="past_01"
    )

    # Future event (2 days from now)
    future_ev = Event(
        title="Upcoming Raleigh Rooftop Party",
        city="Raleigh",
        start_at=now + timedelta(days=2),
        category="Nightlife",
        is_free=False,
        external_id="future_01"
    )

    # Anytime spot in the past
    spot_ev = Event(
        title="Eno River Quarry Spot",
        city="Durham",
        start_at=now - timedelta(days=10),
        is_suggestion=True,
        external_id="spot_01"
    )

    db.add(past_ev)
    db.add(future_ev)
    db.add(spot_ev)
    db.commit()
    db.close()

    # Default GET /events (include_past=False)
    resp = client.get("/api/v1/events")
    assert resp.status_code == 200
    events = resp.json()

    titles = [e["title"] for e in events]
    assert "Upcoming Raleigh Rooftop Party" in titles
    assert "Eno River Quarry Spot" in titles
    assert "Old Durham Farmers Market" not in titles

    # Explicit GET /events?include_past=true
    resp_all = client.get("/api/v1/events?include_past=true")
    assert resp_all.status_code == 200
    all_titles = [e["title"] for e in resp_all.json()]
    assert "Old Durham Farmers Market" in all_titles


def test_recurring_event_auto_advance(client):
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()

    now = datetime.utcnow()
    past_date = now - timedelta(days=7)

    # Recurring weekly event whose initial start_at is in the past
    rec_ev = Event(
        title="Weekly Chapel Hill Board Game Night",
        city="Chapel Hill",
        start_at=past_date,
        recurrence_rule="WEEKLY",
        category="Social",
        external_id="rec_01"
    )

    db.add(rec_ev)
    db.commit()
    rec_id = rec_ev.id
    db.close()

    # Call GET /events which triggers advance_recurring_events
    resp = client.get("/api/v1/events")
    assert resp.status_code == 200

    # Verify event start_at in DB was rolled forward into the future
    db2 = TestingSessionLocal()
    updated_rec = db2.query(Event).filter(Event.id == rec_id).first()
    assert updated_rec is not None
    assert updated_rec.start_at >= now
    db2.close()


def test_cleanup_past_endpoint(client):
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()

    now = datetime.utcnow()

    # Event 40 days old
    very_old = Event(
        title="Very Old Durham Art Walk",
        city="Durham",
        start_at=now - timedelta(days=40),
        category="Arts & Music",
        external_id="old_40"
    )
    db.add(very_old)
    db.commit()
    db.close()

    cleanup_resp = client.post("/api/v1/events/cleanup-past?days_old=30")
    assert cleanup_resp.status_code == 200
    result = cleanup_resp.json()
    assert result["status"] == "ok"
    assert result["cleaned_count"] >= 1
