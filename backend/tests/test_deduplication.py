import pytest
from datetime import datetime, timedelta
from app.models.events import Event
from app.schemas.events import EventCandidate
from app.ingestion.pipeline import IngestionPipeline, calculate_text_similarity, is_same_event
from tests.conftest import TestingSessionLocal

def test_text_similarity():
    # Exact match
    assert calculate_text_similarity("Durham Bulls Game", "Durham Bulls Game") == 1.0
    
    # Substring / variant title match
    sim1 = calculate_text_similarity("Durham Bulls vs Charlotte Knights", "Durham Bulls Baseball Game")
    assert sim1 > 0.45

    # Completely different titles
    sim2 = calculate_text_similarity("Durham Bulls Game", "Cat's Cradle Concert")
    assert sim2 < 0.3

def test_smart_deduplication_pipeline(client):
    db = TestingSessionLocal()
    pipeline = IngestionPipeline(db)

    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0) + timedelta(days=5)

    # 1. Ingest event candidate from Source A (Visit Raleigh)
    cand_a = EventCandidate(
        title="Durham Bulls vs Charlotte Knights",
        description="Triple-A baseball action at the DBAP with post-game fireworks.",
        venue_name="Durham Bulls Athletic Park",
        address="409 Blackwell St",
        city="Durham",
        start_at=now,
        category="Sports",
        price_min=15.0,
        price_max=35.0,
        is_suggestion=False,
        source_name="Visit Raleigh",
        source_url="https://visitraleigh.com/events/bulls-game",
        image_url="https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800",
        external_id="vr_bulls_101"
    )

    event_a = pipeline.process_candidate(cand_a)
    assert event_a.id is not None
    assert event_a.source_name == "Visit Raleigh"

    # 2. Ingest duplicate candidate from Source B (Indy Week) with slightly different title & venue phrasing
    cand_b = EventCandidate(
        title="Durham Bulls Baseball Game & Fireworks",
        description="Triple-A baseball action at the DBAP with post-game fireworks. Bring the whole family for friday night lights!",
        venue_name="Durham Bulls Athletic Park (DBAP)",
        address="409 Blackwell St",
        city="Durham",
        start_at=now + timedelta(minutes=30),  # Slightly different start time (30 min difference)
        category="Sports",
        price_min=15.0,
        price_max=35.0,
        is_suggestion=False,
        source_name="Indy Week",
        source_url="https://indyweek.com/events/bulls-game-fireworks",
        external_id="indy_bulls_999"  # Different source-specific external_id!
    )

    event_b = pipeline.process_candidate(cand_b)
    
    # Should merge into existing event!
    assert event_b.id == event_a.id
    assert "Visit Raleigh" in event_b.source_name
    assert "Indy Week" in event_b.source_name
    # Should keep longer description
    assert "Bring the whole family" in event_b.description

    db.close()
