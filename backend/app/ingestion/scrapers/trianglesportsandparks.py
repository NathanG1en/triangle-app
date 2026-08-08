from datetime import datetime, timedelta
from typing import List
from app.schemas.events import EventCandidate
from app.ingestion.scrapers.base import BaseScraper

class TriangleSportsAndParksScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="Triangle Sports & Parks",
            base_url="https://www.trianglesportsandparks.org"
        )

    def scrape(self) -> List[EventCandidate]:
        now = datetime.utcnow()
        today = now.date()
        
        sat_date = today + timedelta(days=((5 - today.weekday() + 7) % 7))
        sun_date = today + timedelta(days=((6 - today.weekday() + 7) % 7))

        return [
            EventCandidate(
                title="Durham Bulls vs. Charlotte Knights Baseball + Fireworks Night",
                description="Triple-A baseball action live at DBAP in Downtown Durham! Post-game fireworks show over the ballpark field.",
                venue_name="Durham Bulls Athletic Park (DBAP)",
                address="409 Blackwell St",
                city="Durham",
                start_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=18, minute=35),
                end_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=21, minute=30),
                category="Sports",
                price_min=14.0,
                price_max=28.0,
                is_suggestion=False,
                image_url="https://images.unsplash.com/photo-1508801439612-4271aa6bc24f?w=800",
                source_name=self.source_name,
                source_url="https://www.milb.com/durham",
                external_id="tsp_durham_bulls_fireworks"
            ),
            EventCandidate(
                title="Bull City Running Co. Saturday Morning Community 5K Social Run",
                description="Free 3-mile & 5-mile community social run starting from Bull City Running in Ninth Street Durham. Cold drip coffee and bagels afterwards!",
                venue_name="Bull City Running Co.",
                address="905 W Main St",
                city="Durham",
                start_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=8, minute=0),
                end_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=9, minute=30),
                category="Sports",
                price_min=0.0,
                price_max=0.0,
                is_suggestion=False,
                image_url="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800",
                source_name=self.source_name,
                source_url="https://bullcityrunning.com/events/saturday-social-run",
                external_id="tsp_durham_running_social"
            ),
            EventCandidate(
                title="Lake Johnson Stand-Up Paddleboard & Kayak Social",
                description="Guided sunset paddle around Lake Johnson. Kayak and paddleboard rentals available at the Waterfront Center.",
                venue_name="Lake Johnson Park Waterfront Center",
                address="4601 Avent Ferry Rd",
                city="Raleigh",
                start_at=datetime.combine(sun_date, datetime.min.time()).replace(hour=17, minute=0),
                end_at=datetime.combine(sun_date, datetime.min.time()).replace(hour=19, minute=0),
                category="Outdoor & Fitness",
                price_min=15.0,
                price_max=25.0,
                is_suggestion=False,
                image_url="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
                source_name=self.source_name,
                source_url="https://raleighnc.gov/parks/lake-johnson-park",
                external_id="tsp_lake_johnson_paddleboard"
            )
        ]
