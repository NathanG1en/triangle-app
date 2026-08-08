from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app.core.database import get_db
from app.models.events import Event, Attendance
from app.schemas.events import EventResponse, EventCreate, AttendanceRequest, AttendeeSummary
from app.ingestion.pipeline import IngestionPipeline, parse_durham_lowdown_sample

router = APIRouter(prefix="/events", tags=["Events"])

def build_event_response(event: Event, db: Session, current_user_id: Optional[str] = None) -> EventResponse:
    attendances = db.query(Attendance).filter(Attendance.event_id == event.id).all()
    
    interested_count = sum(1 for a in attendances if a.status == "INTERESTED")
    going_count = sum(1 for a in attendances if a.status == "GOING")
    
    user_status = None
    if current_user_id:
        user_att = next((a for a in attendances if a.user_id == current_user_id), None)
        if user_att:
            user_status = user_att.status

    attendees_summary = [
        AttendeeSummary(
            user_id=a.user_id,
            user_name=a.user_name,
            user_avatar=a.user_avatar,
            status=a.status
        )
        for a in attendances
    ]

    return EventResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        venue_name=event.venue_name,
        address=event.address,
        city=event.city,
        start_at=event.start_at,
        end_at=event.end_at,
        category=event.category,
        price_min=event.price_min,
        price_max=event.price_max,
        is_free=event.is_free,
        image_url=event.image_url,
        source_name=event.source_name,
        source_url=event.source_url,
        source_type=event.source_type,
        external_id=event.external_id,
        created_at=event.created_at,
        interested_count=interested_count,
        going_count=going_count,
        user_attendance_status=user_status,
        attendees=attendees_summary
    )


@router.get("", response_model=List[EventResponse])
def get_events(
    city: Optional[str] = Query(None, description="Filter by Triangle city (Cary, Morrisville, Raleigh, Durham, Chapel Hill)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search keyword in title, venue, or description"),
    free_only: Optional[bool] = Query(False, description="Filter free events only"),
    date_filter: Optional[str] = Query(None, description="today, weekend, all"),
    current_user_id: Optional[str] = Query("user_1", description="Current mock user ID"),
    db: Session = Depends(get_db)
):
    query = db.query(Event)

    if city and city != "All":
        query = query.filter(Event.city.ilike(f"%{city}%"))

    if category and category != "All":
        query = query.filter(Event.category.ilike(f"%{category}%"))

    if free_only:
        query = query.filter(Event.is_free == True)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Event.title.ilike(s),
                Event.venue_name.ilike(s),
                Event.description.ilike(s)
            )
        )

    now = datetime.utcnow()
    if date_filter == "today":
        end_of_today = now.replace(hour=23, minute=59, second=59)
        query = query.filter(and_(Event.start_at >= now.replace(hour=0, minute=0, second=0), Event.start_at <= end_of_today))
    elif date_filter == "weekend":
        days_until_saturday = (5 - now.weekday()) % 7
        saturday_start = (now + timedelta(days=days_until_saturday)).replace(hour=0, minute=0, second=0)
        sunday_end = (saturday_start + timedelta(days=1)).replace(hour=23, minute=59, second=59)
        query = query.filter(and_(Event.start_at >= saturday_start, Event.start_at <= sunday_end))

    # Order upcoming events by start_at ascending
    events = query.order_by(Event.start_at.asc()).all()

    return [build_event_response(e, db, current_user_id) for e in events]


@router.get("/{event_id}", response_model=EventResponse)
def get_event_detail(
    event_id: int,
    current_user_id: Optional[str] = Query("user_1"),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return build_event_response(event, db, current_user_id)


@router.post("/{event_id}/attendance", response_model=EventResponse)
def toggle_attendance(
    event_id: int,
    req: AttendanceRequest,
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    existing = db.query(Attendance).filter(
        Attendance.event_id == event_id,
        Attendance.user_id == req.user_id
    ).first()

    if req.status == "NONE":
        if existing:
            db.delete(existing)
            db.commit()
    else:
        if existing:
            existing.status = req.status
            existing.user_name = req.user_name
            if req.user_avatar:
                existing.user_avatar = req.user_avatar
            existing.updated_at = datetime.utcnow()
        else:
            new_att = Attendance(
                event_id=event_id,
                user_id=req.user_id,
                user_name=req.user_name,
                user_avatar=req.user_avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                status=req.status,
                updated_at=datetime.utcnow()
            )
            db.add(new_att)
        db.commit()

    return build_event_response(event, db, req.user_id)


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_community_event(
    payload: EventCreate,
    current_user_id: Optional[str] = Query("user_1"),
    db: Session = Depends(get_db)
):
    new_event = Event(
        title=payload.title,
        description=payload.description,
        venue_name=payload.venue_name or "Triangle Location",
        address=payload.address,
        city=payload.city,
        start_at=payload.start_at,
        end_at=payload.end_at,
        category=payload.category,
        price_min=payload.price_min,
        price_max=payload.price_max,
        is_free=payload.is_free,
        source_name=payload.source_name or "Community Member",
        source_url=payload.source_url,
        source_type="COMMUNITY",
        created_by_user_id=current_user_id,
        created_at=datetime.utcnow()
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    # Auto-add creator as GOING
    creator_att = Attendance(
        event_id=new_event.id,
        user_id=current_user_id or "user_1",
        user_name="Alex Chen",
        user_avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        status="GOING"
    )
    db.add(creator_att)
    db.commit()

    return build_event_response(new_event, db, current_user_id)


@router.post("/ingest/sample-durham-newsletter", response_model=List[EventResponse])
def trigger_sample_ingestion(db: Session = Depends(get_db)):
    pipeline = IngestionPipeline(db)
    candidates = parse_durham_lowdown_sample()
    ingested = []
    for c in candidates:
        event = pipeline.process_candidate(c)
        ingested.append(build_event_response(event, db))
    return ingested
