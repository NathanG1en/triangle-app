import re
from datetime import datetime, timedelta
from typing import List
from bs4 import BeautifulSoup
from app.ingestion.scrapers.base import BaseScraper
from app.schemas.events import EventCandidate

class MotorcoScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="Motorco Music Hall",
            base_url="https://motorcomusic.com"
        )

    def scrape(self) -> List[EventCandidate]:
        candidates: List[EventCandidate] = []
        html = self.fetch_html(self.base_url)
        if not html:
            return candidates

        soup = BeautifulSoup(html, "html.parser")
        event_cards = soup.find_all(['div', 'article'], class_=re.compile(r'event|show|card|title', re.I))

        for card in event_cards[:15]:
            text = self.clean_text(card.get_text())
            if len(text) < 10 or "copyright" in text.lower():
                continue

            lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 3]
            if not lines:
                continue

            title = lines[0]
            if len(title) > 5 and not any(w in title.lower() for w in ['copyright', 'privacy', 'motorco', 'menu', 'contact']):
                min_p, max_p, is_free = self.parse_price(text)
                
                event_date = datetime.now() + timedelta(days=4)
                month_match = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})', text, re.I)
                if month_match:
                    try:
                        month_str, day_str = month_match.group(1), month_match.group(2)
                        month_num = datetime.strptime(month_str[:3], "%b").month
                        event_date = datetime(2026, month_num, int(day_str), 20, 30)
                    except Exception:
                        pass

                candidates.append(
                    EventCandidate(
                        title=f"{title} @ Motorco",
                        description=f"Live performance & Parts & Labor food hall at Motorco Music Hall. {text[:200]}",
                        venue_name="Motorco Music Hall",
                        address="723 Rigsbee Ave",
                        city="Durham",
                        start_at=event_date,
                        category="Arts & Music",
                        is_free=is_free,
                        price_min=min_p or 12.0,
                        price_max=max_p or 20.0,
                        source_name=self.source_name,
                        source_url=self.base_url,
                        image_url="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
                        external_id=f"motorco_{hash(title)}"
                    )
                )

        print(f"[{self.source_name}] Extracted {len(candidates)} event candidates")
        return candidates
