import re
from datetime import datetime, timedelta
from typing import List
from bs4 import BeautifulSoup
from app.ingestion.scrapers.base import BaseScraper
from app.schemas.events import EventCandidate

class RaleighwoodScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="The Raleighwood Inbox",
            base_url="https://theraleighwoodinbox.com/raleigh-events-calendar"
        )

    def scrape(self) -> List[EventCandidate]:
        candidates: List[EventCandidate] = []
        html = self.fetch_html(self.base_url)
        if not html:
            return candidates

        soup = BeautifulSoup(html, "html.parser")

        # Find posts linked from the calendar page
        post_links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if '/p/' in href:
                full_url = href if href.startswith('http') else f"https://theraleighwoodinbox.com{href}"
                if full_url not in post_links:
                    post_links.append(full_url)

        # Scrape top weekly posts
        for post_url in post_links[:3]:
            post_html = self.fetch_html(post_url)
            if not post_html:
                continue

            post_soup = BeautifulSoup(post_html, "html.parser")
            elements = post_soup.find_all(['p', 'li', 'h2', 'h3'])

            for el in elements:
                text = self.clean_text(el.get_text())
                if len(text) < 15 or "subscribe" in text.lower() or "copyright" in text.lower():
                    continue

                # Look for event-like statements (mentioning times, venues, or activities)
                if any(kw in text.lower() for kw in ['pm', 'am', 'downtown', 'hall', 'club', 'street', 'park', 'live', 'festival', 'party', 'concert']):
                    min_p, max_p, is_free = self.parse_price(text)
                    
                    # Clean title
                    parts = text.split('—')
                    title = parts[0].strip() if parts else text[:100]

                    if len(title) > 5:
                        candidate = EventCandidate(
                            title=title[:150],
                            description=text,
                            start_at=datetime.now() + timedelta(days=2),
                            city="Raleigh",
                            venue_name="Raleighwood Spot",
                            source_name=self.source_name,
                            source_url=post_url,
                            category="SOCIAL",
                            is_free=is_free,
                            price_min=min_p,
                            price_max=max_p
                        )
                        candidates.append(candidate)

        print(f"[{self.source_name}] Extracted {len(candidates)} event candidates")
        return candidates
