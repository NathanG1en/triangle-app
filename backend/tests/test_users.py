from datetime import datetime
import pytest
from app.models.events import User, Event, Attendance

def test_get_and_update_my_profile(client):
    # GET /users/me (auto-creates default profile)
    resp = client.get("/api/v1/users/me?user_id=user_test_profile")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "user_test_profile"
    assert data["cohort_year"] == "2026"

    # PUT /users/me (update bio, name, city, instagram)
    update_resp = client.put(
        "/api/v1/users/me?user_id=user_test_profile",
        json={
            "name": "Jordan Alex",
            "bio": "UNC Grad Student & Triangle Explorer",
            "city": "Chapel Hill",
            "instagram_handle": "jordan_unc"
        }
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["name"] == "Jordan Alex"
    assert updated["city"] == "Chapel Hill"
    assert updated["instagram_handle"] == "jordan_unc"


def test_get_public_user_profile(client):
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()

    # Create event created by user_creator
    ev = Event(
        title="Chapel Hill Coffee Meetup",
        city="Chapel Hill",
        start_at=datetime.utcnow(),
        created_by_user_id="user_creator"
    )
    db.add(ev)
    db.commit()
    db.close()

    resp = client.get("/api/v1/users/user_creator")
    assert resp.status_code == 200
    profile = resp.json()
    assert profile["user"]["id"] == "user_creator"
    assert len(profile["created_events"]) >= 1
