import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from typing import List
from bs4 import BeautifulSoup
from app.ingestion.scrapers.base import BaseScraper
from app.schemas.events import EventCandidate

class EyeOnTheTrianglePodcastScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="Eye on the Triangle Podcast",
            base_url="https://feeds.transistor.fm/eyeonthetriangle"
        )

    def scrape(self) -> List[EventCandidate]:
        candidates: List[EventCandidate] = []
        xml_content = self.fetch_html(self.base_url)
        if not xml_content:
            return candidates

        try:
            root = ET.fromstring(xml_content.encode('utf-8'))
            items = root.findall('.//item')

            for item in items[:15]:  # Process recent podcast episodes
                title = item.findtext('title') or ""
                link = item.findtext('link') or self.base_url
                desc_raw = item.findtext('description') or ""
                pub_date_str = item.findtext('pubDate') or ""

                if not title:
                    continue

                soup = BeautifulSoup(desc_raw, 'html.parser')
                clean_desc = self.clean_text(soup.get_text())

                # Guess city
                city = "Raleigh"
                lower = (title + " " + clean_desc).lower()
                if "durham" in lower:
                    city = "Durham"
                elif "cary" in lower:
                    city = "Cary"
                elif "chapel hill" in lower:
                    city = "Chapel Hill"

                # Free podcast / community spotlight
                candidate = EventCandidate(
                    title=f"🎙️ {title}"[:150],
                    description=clean_desc,
                    start_at=datetime.now() + timedelta(days=1),
                    city=city,
                    venue_name="WKNC 88.1 FM Broadcast",
                    source_name=self.source_name,
                    source_url=link,
                    category="COMMUNITY",
                    is_free=True,
                    price_min=0.0,
                    price_max=0.0
                )
                candidates.append(candidate)

        except Exception as e:
            print(f"[{self.source_name}] RSS XML parse error: {e}")

        print(f"[{self.source_name}] Extracted {len(candidates)} podcast event candidates")
        return candidates
