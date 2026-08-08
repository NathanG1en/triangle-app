from datetime import datetime
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models.events import Event
from app.ingestion.pipeline import IngestionPipeline
from app.ingestion.scrapers.durhamlowdown import DurhamLowdownScraper
from app.ingestion.scrapers.indyweek import IndyWeekScraper
from app.ingestion.scrapers.raleighmag import RaleighMagScraper
from app.ingestion.scrapers.triangleonthecheap import TriangleOnCheapScraper
from app.ingestion.scrapers.visitraleigh import VisitRaleighScraper
from app.ingestion.scrapers.ncma import NCMAArtScraper
from app.ingestion.scrapers.trianglesportsandparks import TriangleSportsAndParksScraper

class IngestionManager:
    def __init__(self, db: Session):
        self.db = db
        self.pipeline = IngestionPipeline(db)
        self.scrapers = [
            DurhamLowdownScraper(),
            IndyWeekScraper(),
            RaleighMagScraper(),
            TriangleOnCheapScraper(),
            VisitRaleighScraper(),
            NCMAArtScraper(),
            TriangleSportsAndParksScraper()
        ]

    def get_source_statuses(self) -> List[Dict[str, Any]]:
        results = []
        for scraper in self.scrapers:
            count = self.db.query(Event).filter(Event.source_name == scraper.source_name).count()
            results.append({
                "source_name": scraper.source_name,
                "base_url": scraper.base_url,
                "status": "HEALTHY",
                "last_run": datetime.utcnow().isoformat(),
                "events_count": count
            })
        return results

    def run_all(self) -> Dict[str, Any]:
        start_time = datetime.utcnow()
        total_extracted = 0
        processed_events = []

        for scraper in self.scrapers:
            try:
                candidates = scraper.scrape()
                total_extracted += len(candidates)
                for candidate in candidates:
                    event = self.pipeline.process_candidate(candidate)
                    processed_events.append(event)
            except Exception as e:
                print(f"[IngestionManager] Error executing {scraper.source_name}: {e}")

        duration_sec = (datetime.utcnow() - start_time).total_seconds()

        return {
            "status": "SUCCESS",
            "total_extracted": total_extracted,
            "total_ingested": len(processed_events),
            "sources_scraped": len(self.scrapers),
            "duration_seconds": round(duration_sec, 2),
            "timestamp": datetime.utcnow().isoformat()
        }
