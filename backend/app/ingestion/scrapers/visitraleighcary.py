import re
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from typing import List, Optional
from bs4 import BeautifulSoup
from app.ingestion.scrapers.base import BaseScraper
from app.schemas.events import EventCandidate

class VisitRaleighCaryScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="Visit Raleigh Cary RSS",
            base_url="https://www.visitraleigh.com/event/rss/"
        )

    def scrape(self) -> List[EventCandidate]:
        candidates: List[EventCandidate] = []
        xml_content = self.fetch_html(self.base_url)
        if not xml_content:
            return candidates

        try:
            root = ET.fromstring(xml_content.encode('utf-8'))
            items = root.findall('.//item')

            for item in items:
                title = item.findtext('title') or ""
                link = item.findtext('link') or self.base_url
                desc_raw = item.findtext('description') or ""
                pub_date_str = item.findtext('pubDate') or ""

                if not title:
                    continue

                # Parse clean text description
                soup = BeautifulSoup(desc_raw, 'html.parser')
                clean_desc = self.clean_text(soup.get_text())

                # Guess city (Cary, Raleigh, etc.)
                city = "Cary" if "cary" in title.lower() or "cary" in link.lower() else "Raleigh"

                # Parse start date
                start_at = datetime.now() + timedelta(days=1)
                date_match = re.search(r'(\d{2}/\d{2}/\d{4})', clean_desc)
                if date_match:
                    try:
                        start_at = datetime.strptime(date_match.group(1), "%m/%d/%Y")
                        start_at = start_at.replace(hour=18, minute=0)
                    except Exception:
                        pass

                min_p, max_p, is_free = self.parse_price(clean_desc)

                candidate = EventCandidate(
                    title=title[:150],
                    description=clean_desc,
                    start_at=start_at,
                    city=city,
                    venue_name=f"{city} Venue",
                    source_name=self.source_name,
                    source_url=link,
                    category="ARTS & MUSIC" if "art" in title.lower() or "music" in title.lower() else "COMMUNITY",
                    is_free=is_free,
                    price_min=min_p,
                    price_max=max_p
                )
                candidates.append(candidate)

        except Exception as e:
            print(f"[{self.source_name}] RSS XML parse error: {e}")

        print(f"[{self.source_name}] Extracted {len(candidates)} event candidates")
        return candidates
