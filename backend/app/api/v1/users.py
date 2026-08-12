from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.events import User, Attendance, Event, Notification, Report, UserBlock

router = APIRouter()


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
