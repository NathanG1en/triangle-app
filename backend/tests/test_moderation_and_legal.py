from datetime import datetime
import pytest
from app.models.events import Event, User

@pytest.fixture(autouse=True)
def setup_data():
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    db.query(Event).filter(Event.created_by_user_id == "user_spammer").delete()
    db.query(User).filter(User.id == "user_1").delete()
    event = Event(
        title="Test Durham Gathering",
        city="Durham",
        start_at=datetime.utcnow(),
        created_by_user_id="user_spammer",
    )
    user = User(
        id="user_1",
        email="test@example.com",
        name="Test User"
    )
    db.add(event)
    db.add(user)
    db.commit()
    db.close()


def test_submit_report(client):
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    event = db.query(Event).filter(Event.created_by_user_id == "user_spammer").first()
    event_id = event.id
    db.close()

    response = client.post(
        "/api/v1/moderation/report",
        json={
            "reporter_user_id": "user_1",
            "target_event_id": event_id,
            "reason": "SPAM",
            "details": "This event is suspicious"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["reason"] == "SPAM"
    assert data["status"] == "PENDING"
    assert data["target_user_id"] == "user_spammer"


def test_block_user_and_filter_events(client):
    # Block user_spammer
    block_resp = client.post(
        "/api/v1/moderation/block",
        json={
            "blocker_user_id": "user_1",
            "blocked_user_id": "user_spammer"
        }
    )
    assert block_resp.status_code == 200

    # Get events for user_1 (should filter out event from user_spammer)
    events_resp = client.get("/api/v1/events?current_user_id=user_1")
    assert events_resp.status_code == 200
    events = events_resp.json()
    spammer_events = [e for e in events if e.get("created_by_user_id") == "user_spammer"]
    assert len(spammer_events) == 0


def test_delete_account(client):
    del_resp = client.delete("/api/v1/users/me?user_id=user_1")
    assert del_resp.status_code == 200
    assert "deleted" in del_resp.json()["message"]


def test_privacy_and_support_pages(client):
    priv_resp = client.get("/privacy")
    assert priv_resp.status_code == 200
    assert "Privacy Policy" in priv_resp.text

    supp_resp = client.get("/support")
    assert supp_resp.status_code == 200
    assert "Support & Assistance" in supp_resp.text
