from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.database import get_db
from app.models.events import Event, Attendance, Notification
from app.schemas.events import NotificationResponse

router = APIRouter()


@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    user_id: str = Query(default="user_1"),
    unread_only: bool = Query(default=False),
    db: Session = Depends(get_db)
):
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()
    return notifications


@router.get("/notifications/unread-count")
def get_unread_count(
    user_id: str = Query(default="user_1"),
    db: Session = Depends(get_db)
):
    count = db.query(Notification).filter(
        and_(Notification.user_id == user_id, Notification.is_read == False)
    ).count()
    return {"unread_count": count}


@router.post("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/notifications/read-all")
def mark_all_read(
    user_id: str = Query(default="user_1"),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        and_(Notification.user_id == user_id, Notification.is_read == False)
    ).update({"is_read": True})
    db.commit()
    return {"status": "ok"}


@router.post("/notifications/generate-reminders")
def generate_reminders(
    user_id: str = Query(default="user_1"),
    db: Session = Depends(get_db)
):
    """Generate reminder notifications for events the user is attending.
    Call this periodically (e.g. every 30 min) or on app open."""
    now = datetime.utcnow()
    
    # Find events the user is GOING to in the next 24 hours
    attendances = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.status == "GOING"
    ).all()
    
    generated = []
    
    for att in attendances:
        event = db.query(Event).filter(Event.id == att.event_id).first()
        if not event or event.is_suggestion:
            continue
        
        hours_until = (event.start_at - now).total_seconds() / 3600
        
        # 24-hour reminder
        if 23 <= hours_until <= 25:
            existing = db.query(Notification).filter(
                and_(
                    Notification.user_id == user_id,
                    Notification.event_id == event.id,
                    Notification.notif_type == "EVENT_REMINDER_24H"
                )
            ).first()
            if not existing:
                notif = Notification(
                    user_id=user_id,
                    notif_type="EVENT_REMINDER_24H",
                    title=f"Tomorrow: {event.title}",
                    body=f"You're going to {event.title} at {event.venue_name or 'the venue'} tomorrow. Don't forget!",
                    event_id=event.id,
                )
                db.add(notif)
                generated.append(notif)
        
        # 2-hour reminder
        if 1.5 <= hours_until <= 2.5:
            existing = db.query(Notification).filter(
                and_(
                    Notification.user_id == user_id,
                    Notification.event_id == event.id,
                    Notification.notif_type == "EVENT_REMINDER_2H"
                )
            ).first()
            if not existing:
                venue_label = event.venue_name or event.title
                notif = Notification(
                    user_id=user_id,
                    notif_type="EVENT_REMINDER_2H",
                    title=f"⏰ {event.title} starts in 2 hours!",
                    body=f"Your plan at {venue_label} is coming up soon. Time to head out!",
                    event_id=event.id,
                )
                db.add(notif)
                generated.append(notif)
    
    db.commit()
    return {"generated_count": len(generated)}
