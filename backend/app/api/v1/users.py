from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.database import get_db
from app.models.events import User, Attendance, Event, Notification, Report, UserBlock
from app.schemas.events import UserResponse, UserUpdate, UserProfilePublicResponse, EventResponse

router = APIRouter()

def _build_event_response_simple(event: Event, db: Session, current_user_id: str) -> EventResponse:
    from app.api.v1.events import build_event_response
    return build_event_response(event, db, current_user_id)

@router.get("/users/me", response_model=UserResponse)
def get_current_user_profile(
    user_id: str = Query(default="user_1"),
    db: Session = Depends(get_db)
):
    """Retrieves current user profile. Auto-creates default profile if not exists."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(
            id=user_id,
            email=f"{user_id}@duke.edu",
            name="Jordan Miller",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            cohort_year="2026",
            company="Duke Grad / RTP Tech",
            bio="Building social events for RTP grad students. Love morning 5K runs and Durham coffee spots!",
            city="Durham",
            interests="Outdoors, Food & Drink, Running, Tech",
            instagram_handle="jordan_rtp",
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.put("/users/me", response_model=UserResponse)
def update_current_user_profile(
    payload: UserUpdate,
    user_id: str = Query(default="user_1"),
    db: Session = Depends(get_db)
):
    """Updates profile attributes for current user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Create user if missing
        user = User(
            id=user_id,
            email=f"{user_id}@duke.edu",
            name=payload.name or "Cohort Member",
            avatar_url=payload.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            cohort_year=payload.cohort_year or "2026",
            company=payload.company,
            bio=payload.bio,
            city=payload.city or "Durham",
            interests=payload.interests or "Outdoors, Food & Drink",
            instagram_handle=payload.instagram_handle,
            created_at=datetime.utcnow()
        )
        db.add(user)
    else:
        if payload.name is not None:
            user.name = payload.name.strip()
        if payload.avatar_url is not None:
            user.avatar_url = payload.avatar_url.strip()
        if payload.cohort_year is not None:
            user.cohort_year = payload.cohort_year.strip()
        if payload.company is not None:
            user.company = payload.company.strip()
        if payload.bio is not None:
            user.bio = payload.bio.strip()
        if payload.city is not None:
            user.city = payload.city.strip()
        if payload.interests is not None:
            user.interests = payload.interests.strip()
        if payload.instagram_handle is not None:
            user.instagram_handle = payload.instagram_handle.strip()

    db.commit()
    db.refresh(user)
    return user


@router.get("/users/{target_user_id}", response_model=UserProfilePublicResponse)
def get_public_user_profile(
    target_user_id: str,
    current_user_id: str = Query(default="user_1"),
    db: Session = Depends(get_db)
):
    """Returns public profile details, created events, and attending events for any user."""
    user = db.query(User).filter(User.id == target_user_id).first()
    if not user:
        user = User(
            id=target_user_id,
            email=f"{target_user_id}@cohort.edu",
            name=target_user_id.replace("_", " ").title(),
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            cohort_year="2026",
            bio="Cohort member in the Triangle area.",
            city="Durham",
            interests="Social, Outdoors",
            created_at=datetime.utcnow()
        )

    # Fetch created events
    created_events_db = db.query(Event).filter(Event.created_by_user_id == target_user_id).order_by(Event.start_at.desc()).all()
    created_events = [_build_event_response_simple(e, db, current_user_id) for e in created_events_db]

    # Fetch attending events
    attendances = db.query(Attendance).filter(
        and_(Attendance.user_id == target_user_id, Attendance.status != "NONE")
    ).all()
    event_ids = [a.event_id for a in attendances]

    attending_events_db = db.query(Event).filter(Event.id.in_(event_ids)).order_by(Event.start_at.asc()).all() if event_ids else []
    attending_events = [_build_event_response_simple(e, db, current_user_id) for e in attending_events_db]

    return UserProfilePublicResponse(
        user=user,
        created_events=created_events,
        attending_events=attending_events
    )


@router.delete("/users/me")
def delete_account(
    user_id: str = Query(..., description="The user ID of the account to delete"),
    db: Session = Depends(get_db)
):
    """
    Permanently deletes the user's account and purges associated personal data
    to strictly comply with Apple App Review Guideline 5.1.1(v).
    """
    # Delete attendances
    db.query(Attendance).filter(Attendance.user_id == user_id).delete(synchronize_session=False)

    # Delete notifications
    db.query(Notification).filter(Notification.user_id == user_id).delete(synchronize_session=False)

    # Delete user blocks
    db.query(UserBlock).filter(
        (UserBlock.blocker_user_id == user_id) | (UserBlock.blocked_user_id == user_id)
    ).delete(synchronize_session=False)

    # Delete reports created by user
    db.query(Report).filter(Report.reporter_user_id == user_id).delete(synchronize_session=False)

    # Delete events created by user
    db.query(Event).filter(Event.created_by_user_id == user_id).delete(synchronize_session=False)

    # Delete user record if exists
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)

    db.commit()
    return {
        "status": "ok",
        "message": f"Account '{user_id}' and all associated personal data have been permanently deleted."
    }
