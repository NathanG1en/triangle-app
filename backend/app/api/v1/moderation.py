from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.database import get_db
from app.models.events import Report, UserBlock, Event
from app.schemas.events import ReportCreate, ReportResponse, UserBlockCreate

router = APIRouter()


@router.post("/moderation/report", response_model=ReportResponse)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db)
):
    """Submits a report for objectionable event content or abusive user behavior."""
    if payload.target_event_id:
        event = db.query(Event).filter(Event.id == payload.target_event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        # Auto-set target user if event was created by a user
        if not payload.target_user_id and event.created_by_user_id:
            payload.target_user_id = event.created_by_user_id

    report = Report(
        reporter_user_id=payload.reporter_user_id,
        target_event_id=payload.target_event_id,
        target_user_id=payload.target_user_id,
        reason=payload.reason,
        details=payload.details,
        status="PENDING",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.post("/moderation/block")
def block_user(
    payload: UserBlockCreate,
    db: Session = Depends(get_db)
):
    """Blocks a user so their posts and interactions will no longer be visible."""
    if payload.blocker_user_id == payload.blocked_user_id:
        raise HTTPException(status_code=400, detail="Cannot block yourself")

    existing = db.query(UserBlock).filter(
        and_(
            UserBlock.blocker_user_id == payload.blocker_user_id,
            UserBlock.blocked_user_id == payload.blocked_user_id,
        )
    ).first()

    if not existing:
        block = UserBlock(
            blocker_user_id=payload.blocker_user_id,
            blocked_user_id=payload.blocked_user_id,
        )
        db.add(block)
        db.commit()

    return {"status": "ok", "message": f"User {payload.blocked_user_id} blocked successfully"}


@router.get("/moderation/blocked")
def get_blocked_users(
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Retrieves list of user IDs blocked by the given user."""
    blocks = db.query(UserBlock).filter(UserBlock.blocker_user_id == user_id).all()
    return {"blocked_user_ids": [b.blocked_user_id for b in blocks]}
