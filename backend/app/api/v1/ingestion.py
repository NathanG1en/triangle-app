from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.ingestion.manager import IngestionManager

router = APIRouter()

@router.post("/trigger")
def trigger_ingestion(db: Session = Depends(get_db)):
    """Triggers real-time scraping and ingestion across all configured Triangle sources."""
    manager = IngestionManager(db)
    result = manager.run_all()
    return result

@router.get("/sources")
def get_ingestion_sources(db: Session = Depends(get_db)):
    """Returns list of connected publication sources with health status and event counts."""
    manager = IngestionManager(db)
    sources = manager.get_source_statuses()
    return {"sources": sources}
