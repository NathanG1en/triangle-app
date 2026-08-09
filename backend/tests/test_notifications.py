import pytest
from datetime import datetime, timedelta
from app.models.events import Event, Attendance, Notification
from tests.conftest import TestingSessionLocal

def test_notification_endpoints(client):
    db = TestingSessionLocal()

    # 1. Create a timed event starting in 2 hours
    event = Event(
        title="Testing Notifications Event",
        city="Durham",
        start_at=datetime.utcnow() + timedelta(hours=2),
        category="Social",
        source_name="Test"
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # 2. Add attendance for user_1
    att = Attendance(
        event_id=event.id,
        user_id="user_1",
        user_name="Alex Chen",
        status="GOING"
    )
    db.add(att)
    db.commit()
    db.close()

    # 3. Trigger reminder generation
    res = client.post("/api/v1/notifications/generate-reminders?user_id=user_1")
    assert res.status_code == 200
    assert res.json()["generated_count"] >= 1

    # 4. Check unread count
    res_count = client.get("/api/v1/notifications/unread-count?user_id=user_1")
    assert res_count.status_code == 200
    assert res_count.json()["unread_count"] >= 1

    # 5. Fetch notification list
    res_list = client.get("/api/v1/notifications?user_id=user_1")
    assert res_list.status_code == 200
    items = res_list.json()
    assert len(items) >= 1
    notif_id = items[0]["id"]

    # 6. Mark read
    res_read = client.post(f"/api/v1/notifications/{notif_id}/read")
    assert res_read.status_code == 200
    assert res_read.json()["is_read"] is True
