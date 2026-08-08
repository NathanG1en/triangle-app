from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.events import Event, Attendance

router = APIRouter()

def format_utc_ics_time(dt: datetime) -> str:
    return dt.strftime('%Y%m%dT%H%M%SZ')

def build_single_vevent(event: Event) -> list[str]:
    start_str = format_utc_ics_time(event.start_at)
    end_dt = event.end_at if event.end_at else (event.start_at + timedelta(hours=2))
    end_str = format_utc_ics_time(end_dt)
    
    location = f"{event.venue_name or ''}, {event.address or ''}, {event.city}, NC".strip(", ")
    clean_desc = (event.description or '').replace('\n', ' ')
    
    return [
        "BEGIN:VEVENT",
        f"SUMMARY:{event.title}",
        f"DESCRIPTION:Organized via Triangle Social Cohort App.\\n\\n{clean_desc}",
        f"LOCATION:{location}",
        f"DTSTART:{start_str}",
        f"DTEND:{end_str}",
        f"URL:{event.source_url or 'http://localhost:8081'}",
        f"UID:triangle-event-{event.id}-{start_str}@trianglesocial.org",
        "STATUS:CONFIRMED",
        "END:VEVENT"
    ]

@router.get("/events/{event_id}/export.ics")
def export_event_ics(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Triangle Social Events//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ]
    ics_lines.extend(build_single_vevent(event))
    ics_lines.append("END:VCALENDAR")
    
    content = "\r\n".join(ics_lines)
    filename = f"triangle_event_{event_id}.ics"
    
    return Response(
        content=content,
        media_type="text/calendar",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/events/{event_id}/google-url")
def get_google_calendar_url(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    start_str = format_utc_ics_time(event.start_at)
    end_dt = event.end_at if event.end_at else (event.start_at + timedelta(hours=2))
    end_str = format_utc_ics_time(end_dt)
    
    import urllib.parse
    title = urllib.parse.quote(event.title)
    details = urllib.parse.quote(f"Triangle Social Event\n\n{event.description or ''}\n\nVenue: {event.venue_name}")
    location = urllib.parse.quote(f"{event.venue_name or ''}, {event.city}, NC")
    
    gcal_url = f"https://calendar.google.com/calendar/render?action=TEMPLATE&text={title}&dates={start_str}/{end_str}&details={details}&location={location}"
    
    return {"google_calendar_url": gcal_url}

@router.get("/users/{user_id}/feed.ics")
def export_user_calendar_feed(user_id: str = "user_1", db: Session = Depends(get_db)):
    attendances = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.status.in_(["GOING", "INTERESTED"])
    ).all()
    
    event_ids = [a.event_id for a in attendances]
    events = db.query(Event).filter(Event.id.in_(event_ids)).all() if event_ids else []
    
    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Triangle Social Events Feed//EN",
        "CALSCALE:GREGORIAN",
        "X-WR-CALNAME:Triangle Social Cohort Feed",
        "METHOD:PUBLISH"
    ]
    
    for ev in events:
        ics_lines.extend(build_single_vevent(ev))
        
    ics_lines.append("END:VCALENDAR")
    content = "\r\n".join(ics_lines)
    
    return Response(
        content=content,
        media_type="text/calendar",
        headers={"Content-Disposition": 'attachment; filename="triangle_social_feed.ics"'}
    )
