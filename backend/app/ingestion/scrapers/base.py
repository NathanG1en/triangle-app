import re
import urllib.parse
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import List, Optional
import httpx
from bs4 import BeautifulSoup
from app.schemas.events import EventCandidate

class BaseScraper(ABC):
    def __init__(self, source_name: str, base_url: str):
        self.source_name = source_name
        self.base_url = base_url

    def fetch_html(self, url: str, timeout: float = 10.0) -> Optional[str]:
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            with httpx.Client(timeout=timeout, follow_redirects=True) as client:
                response = client.get(url, headers=headers)
                if response.status_code == 200:
                    return response.text
        except Exception as e:
            print(f"[{self.source_name}] Error fetching {url}: {e}")
        return None

    def clean_text(self, text: Optional[str]) -> str:
        if not text:
            return ""
        # Remove extra whitespace and newlines
        cleaned = re.sub(r'\s+', ' ', text).strip()
        return cleaned

    def parse_price(self, text: str) -> tuple[float, float, bool]:
        if not text:
            return 0.0, 0.0, True
        lower = text.lower()
        if "free" in lower or "no cover" in lower or "free admission" in lower:
            return 0.0, 0.0, True
        
        matches = re.findall(r'\$(\d+(?:\.\d{2})?)', text)
        if matches:
            prices = [float(m) for m in matches]
            min_p = min(prices)
            max_p = max(prices)
            return min_p, max_p, min_p == 0.0
        return 0.0, 0.0, True

    @abstractmethod
    def scrape(self) -> List[EventCandidate]:
        """Subclasses implement scraping logic and return a list of EventCandidates."""
        pass
