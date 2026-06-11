import requests
import re
import logging
from typing import List, Dict
from functools import lru_cache

logger = logging.getLogger(__name__)

class WebSearchService:
    @lru_cache(maxsize=16)
    def search(self, query: str) -> List[Dict[str, str]]:
        if not query or not query.strip():
            return []
            
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        url = "https://lite.duckduckgo.com/lite/"
        data = {"q": query}
        
        try:
            logger.info(f"Performing real-time web search for query: {query}")
            response = requests.post(url, headers=headers, data=data, timeout=10)
            if response.status_code != 200:
                logger.error(f"DuckDuckGo search failed with status code: {response.status_code}")
                return []
                
            html = response.text
            results = []
            
            # Sequence pattern to grab link/title and snippet in DuckDuckGo Lite HTML format
            pattern = re.compile(
                r"<a\s+rel=\"nofollow\"\s+href=\"([^\"]+)\"\s+class='result-link'[^>]*>(.*?)</a>"
                r".*?"
                r"<td\s+class='result-snippet'[^>]*>(.*?)</td>",
                re.DOTALL
            )
            
            for match in pattern.finditer(html):
                link = match.group(1).strip()
                title = match.group(2).strip()
                snippet = match.group(3).strip()
                
                # Strip HTML tags
                title = re.sub(r'<[^>]+>', '', title)
                snippet = re.sub(r'<[^>]+>', '', snippet)
                
                # Decode HTML entities
                entities = {
                    "&quot;": '"',
                    "&amp;": "&",
                    "&lt;": "<",
                    "&gt;": ">",
                    "&#39;": "'",
                    "&rsquo;": "'",
                    "&nbsp;": " "
                }
                for entity, replacement in entities.items():
                    title = title.replace(entity, replacement)
                    snippet = snippet.replace(entity, replacement)
                
                results.append({
                    "title": title.strip(),
                    "link": link.strip(),
                    "snippet": snippet.strip()
                })
                
            logger.info(f"Successfully retrieved {len(results)} search results.")
            return results
            
        except Exception as e:
            logger.error(f"Exception occurred during DuckDuckGo search: {e}", exc_info=True)
            return []

    def fetch_pages_content(self, urls: List[str]) -> Dict[str, str]:
        """
        Fetch the full markdown content of the given URLs using TinyFish Fetch API.
        Returns a mapping of url -> markdown content.
        Uses a cached internal method to avoid redundant network requests.
        """
        if not urls:
            return {}
        return self._fetch_pages_content_cached(tuple(urls))

    @lru_cache(maxsize=16)
    def _fetch_pages_content_cached(self, urls_tuple: tuple) -> Dict[str, str]:
        from app.config import settings
        api_key = settings.TINYFISH_API_KEY
        if not api_key:
            logger.warning("TINYFISH_API_KEY is not configured. Skipping TinyFish fetch.")
            return {}

        # Limit to first 3 URLs to save resources and avoid huge LLM context
        urls_to_fetch = list(urls_tuple)[:4]
        if not urls_to_fetch:
            return {}
        
        headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }
        payload = {
            "urls": urls_to_fetch,
            "format": "markdown",
            "links": False,
            "image_links": False
        }
        url = "https://api.fetch.tinyfish.ai"
        
        try:
            logger.info(f"Invoking TinyFish Fetch API for URLs: {urls_to_fetch}")
            response = requests.post(url, headers=headers, json=payload, timeout=20)
            if response.status_code != 200:
                logger.error(f"TinyFish Fetch API failed with status code {response.status_code}: {response.text}")
                return {}
                
            data = response.json()
            results = data.get("results", [])
            content_map = {}
            for res in results:
                target_url = res.get("url")
                text_content = res.get("text", "")
                if target_url and text_content:
                    # Truncate content to keep it concise for the prompt
                    content_map[target_url] = text_content[:1500]
            return content_map
        except Exception as e:
            logger.error(f"Error fetching pages with TinyFish: {e}", exc_info=True)
            return {}

web_search_service = WebSearchService()
