from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.core.database import get_db
from app.models.events import Event, Attendance, User, Notification, UserBlock
from app.schemas.events import EventResponse, EventCreate, AttendanceRequest, EventCandidate, EventPhotoUpdate
from app.ingestion.pipeline import parse_durham_lowdown_sample, IngestionPipeline

router = APIRouter()

def advance_recurring_events(db: Session):
    """Automatically roll forward recurring events whose start_at date has passed."""
    now = datetime.utcnow()
    past_recurring = db.query(Event).filter(
        and_(
            Event.recurrence_rule.isnot(None),
            Event.start_at < now - timedelta(hours=2)
        )
    ).all()

    for event in past_recurring:
        rule = (event.recurrence_rule or "").upper()
        if "WEEKLY" in rule:
            days_step = 7
        elif "BIWEEKLY" in rule:
            days_step = 14
        elif "MONTHLY" in rule:
            days_step = 28
        else:
            days_step = 7

        while event.start_at < now:
            event.start_at = event.start_at + timedelta(days=days_step)
            if event.end_at:
                event.end_at = event.end_at + timedelta(days=days_step)

    if past_recurring:
        db.commit()

def build_event_response(event: Event, db: Session, current_user_id: str = "user_1") -> EventResponse:
    attendances = db.query(Attendance).filter(Attendance.event_id == event.id).all()
    
    interested_count = sum(1 for a in attendances if a.status == "INTERESTED")
    going_count = sum(1 for a in attendances if a.status == "GOING")
    
    user_status = None
    for a in attendances:
        if a.user_id == current_user_id:
            user_status = a.status
            break
            
    attendees_summary = [
        {
            "user_id": a.user_id,
            "user_name": a.user_name,
            "user_avatar": a.user_avatar,
            "status": a.status
        }
        for a in attendances
    ]
    
    res = EventResponse.model_validate(event)
    res.interested_count = interested_count
    res.going_count = going_count
    res.user_attendance_status = user_status
    res.attendees = attendees_summary
    return res

@router.get("/events", response_model=List[EventResponse])
def get_events(
    city: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    date_filter: Optional[str] = Query(default=None),
    free_only: bool = Query(default=False),
    time_type: Optional[str] = Query(default=None),
    include_past: bool = Query(default=False),
    current_user_id: str = Query(default="user_1"),
    db: Session = Depends(get_db)
):
    advance_recurring_events(db)

    query = db.query(Event)

    # Filter out events from blocked users
    blocked_user_ids = [b.blocked_user_id for b in db.query(UserBlock).filter(UserBlock.blocker_user_id == current_user_id).all()]
    if blocked_user_ids:
        query = query.filter(or_(Event.created_by_user_id.is_(None), Event.created_by_user_id.notin_(blocked_user_ids)))

    # Exclude past timed events unless include_past=True (2-hour grace period for ongoing events)
    now = datetime.utcnow()
    if not include_past:
        grace_period = now - timedelta(hours=2)
        query = query.filter(
            or_(
                Event.is_suggestion == True,
                Event.recurrence_rule.isnot(None),
                Event.start_at >= grace_period,
                and_(Event.end_at.isnot(None), Event.end_at >= grace_period)
            )
        )

    if city and city != "All":
        query = query.filter(Event.city.ilike(f"%{city}%"))

    if category and category != "All":
        query = query.filter(Event.category.ilike(f"%{category}%"))

    if free_only:
        query = query.filter(Event.is_free == True)

    if time_type == "timed":
        query = query.filter(or_(Event.is_suggestion == False, Event.is_suggestion == None))
    elif time_type == "untimed":
        query = query.filter(Event.is_suggestion == True)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Event.title.ilike(s),
                Event.venue_name.ilike(s),
                Event.description.ilike(s)
            )
        )

    if date_filter == "today":
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        if time_type == "timed":
            query = query.filter(and_(Event.start_at >= today_start, Event.start_at <= today_end))
        else:
            query = query.filter(
                or_(
                    and_(Event.start_at >= today_start, Event.start_at <= today_end),
                    Event.is_suggestion == True
                )
            )
    elif date_filter == "weekend":
        weekday = now.weekday()
        if weekday < 4:
            fri_start = (now + timedelta(days=(4 - weekday))).replace(hour=17, minute=0, second=0, microsecond=0)
        else:
            fri_start = (now - timedelta(days=(weekday - 4))).replace(hour=17, minute=0, second=0, microsecond=0)
            
        sun_end = (fri_start + timedelta(days=2)).replace(hour=23, minute=59, second=59, microsecond=999999)

        if time_type == "timed":
            query = query.filter(and_(Event.start_at >= fri_start, Event.start_at <= sun_end))
        else:
            query = query.filter(
                or_(
                    and_(Event.start_at >= fri_start, Event.start_at <= sun_end),
                    Event.is_suggestion == True
                )
            )

    events = query.order_by(Event.start_at.asc()).all()
    return [build_event_response(e, db, current_user_id) for e in events]


@router.post("/events/cleanup-past")
def cleanup_past_events(
    days_old: int = Query(default=30, ge=1),
    db: Session = Depends(get_db)
):
    """Clean up old single-instance timed events that passed more than `days_old` days ago."""
    now = datetime.utcnow()
    cutoff = now - timedelta(days=days_old)

    expired = db.query(Event).filter(
        and_(
            or_(Event.is_suggestion == False, Event.is_suggestion.is_(None)),
            Event.recurrence_rule.is_(None),
            Event.start_at < cutoff
        )
    ).all()

    count = len(expired)
    for e in expired:
        db.delete(e)
    db.commit()

    return {
        "status": "ok",
        "cleaned_count": count,
        "cutoff_date": cutoff.isoformat()
    }


@router.post("/events/ingest/sample-durham-newsletter", response_model=List[EventResponse])
def trigger_sample_ingestion(
    current_user_id: str = "user_1",
    db: Session = Depends(get_db)
):
    candidates = parse_durham_lowdown_sample()
    pipeline = IngestionPipeline(db)
    results = [pipeline.process_candidate(c) for c in candidates]
    return [build_event_response(e, db, current_user_id) for e in results]

@router.get("/events/{event_id}", response_model=EventResponse)
def get_event_detail(
    event_id: int,
    current_user_id: str = "user_1",
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return build_event_response(event, db, current_user_id)

@router.post("/events", response_model=EventResponse)
def create_event(
    payload: EventCreate,
    current_user_id: str = "user_1",
    db: Session = Depends(get_db)
):
    new_event = Event(
        title=payload.title,
        description=payload.description,
        venue_name=payload.venue_name,
        address=payload.address,
        city=payload.city,
        start_at=payload.start_at,
        end_at=payload.end_at,
        category=payload.category,
        price_min=payload.price_min,
        price_max=payload.price_max,
        is_free=payload.is_free,
        is_suggestion=payload.is_suggestion,
        image_url=payload.image_url or "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
        source_name=payload.source_name or "Cohort Member",
        source_url=payload.source_url,
        source_type="COMMUNITY",
        created_by_user_id=current_user_id,
        recurrence_rule=payload.recurrence_rule,
        recurrence_parent_id=None,
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    # If recurring, mark it as its own series root, then create next 3 occurrences
    if payload.recurrence_rule:
        new_event.recurrence_parent_id = new_event.id
        db.commit()
        db.refresh(new_event)

        if payload.recurrence_rule == "WEEKLY":
            deltas = [timedelta(weeks=i) for i in range(1, 4)]
        elif payload.recurrence_rule == "BIWEEKLY":
            deltas = [timedelta(weeks=i * 2) for i in range(1, 4)]
        elif payload.recurrence_rule == "MONTHLY":
            deltas = [timedelta(days=30 * i) for i in range(1, 4)]
        else:
            deltas = []

        for delta in deltas:
            occurrence = Event(
                title=new_event.title,
                description=new_event.description,
                venue_name=new_event.venue_name,
                address=new_event.address,
                city=new_event.city,
                start_at=new_event.start_at + delta,
                end_at=(new_event.end_at + delta) if new_event.end_at else None,
                category=new_event.category,
                price_min=new_event.price_min,
                price_max=new_event.price_max,
                is_free=new_event.is_free,
                is_suggestion=False,
                image_url=new_event.image_url,
                source_name=new_event.source_name,
                source_url=new_event.source_url,
                source_type="COMMUNITY",
                created_by_user_id=current_user_id,
                recurrence_rule=payload.recurrence_rule,
                recurrence_parent_id=new_event.id,
            )
            db.add(occurrence)
        db.commit()

    return build_event_response(new_event, db, current_user_id)


@router.post("/events/{event_id}/attendance", response_model=EventResponse)
def toggle_user_attendance(
    event_id: int,
    payload: AttendanceRequest,
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    existing = db.query(Attendance).filter(
        and_(Attendance.event_id == event_id, Attendance.user_id == payload.user_id)
    ).first()

    if payload.status == "NONE":
        if existing:
            db.delete(existing)
            db.commit()
    else:
        if existing:
            existing.status = payload.status
            existing.user_name = payload.user_name
            existing.user_avatar = payload.user_avatar
            existing.updated_at = datetime.utcnow()
        else:
            new_att = Attendance(
                event_id=event_id,
                user_id=payload.user_id,
                user_name=payload.user_name,
                user_avatar=payload.user_avatar,
                status=payload.status
            )
            db.add(new_att)
        db.commit()

    # Generate FRIEND_RSVP notifications for other attendees
    if payload.status != "NONE":
        other_attendees = db.query(Attendance).filter(
            and_(Attendance.event_id == event_id, Attendance.user_id != payload.user_id)
        ).all()
        for other_att in other_attendees:
            notif = Notification(
                user_id=other_att.user_id,
                notif_type="FRIEND_RSVP",
                title=f"{payload.user_name} is {payload.status.lower()} for {event.title}!",
                body=f"{payload.user_name} just RSVP'd {payload.status} to {event.title}. Your cohort is showing up!",
                event_id=event_id,
            )
            db.add(notif)
        db.commit()

    return build_event_response(event, db, payload.user_id)


@router.patch("/events/{event_id}/photo", response_model=EventResponse)
def update_event_photo(
    event_id: int,
    payload: EventPhotoUpdate,
    current_user_id: str = Query(default="user_1"),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.image_url = payload.image_url.strip()
    db.commit()
    db.refresh(event)
    return build_event_response(event, db, current_user_id)
