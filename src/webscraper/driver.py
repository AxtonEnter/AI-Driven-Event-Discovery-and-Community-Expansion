from playwright.sync_api import sync_playwright
from playwright.async_api import async_playwright
import time
import asyncio

class PlaywrightDriver:
    def __init__(self, headless: bool = True, proxy: bool = False):
        """Initialize the Playwright driver with a browser instance."""
        self.headless = headless
        self.proxy = proxy
        self.playwright = None
        self.browser = None
        self.page = None
    
    async def start(self):
        """Start the Playwright session asynchronously."""
        self.playwright = await async_playwright().start()

        if self.proxy:
            AUTH = "brd-customer-hl_c2040da7-zone-scraping_browser2:16iugatzsi52"
            SBR_WS_CDP = f"wss://{AUTH}@brd.superproxy.io:9222"
            self.browser = await self.playwright.chromium.connect_over_cdp(SBR_WS_CDP)
        else:
            self.browser = await self.playwright.chromium.launch(headless=self.headless)

        self.page = await self.browser.new_page()

    async def getHtml(self, url: str) -> str | None:
        """Fetch the HTML content of a webpage if it's an HTML page."""
        if not self.page:
            print("Error: Playwright not started. Call `await start()` first.")
            return None
        
        try:
            # First, check the Content-Type using a HEAD request
            response = await self.page.request.fetch(url, method="HEAD")
            if response:
                content_type = response.headers.get("content-type", "").lower()
                if "text/html" not in content_type:
                    print(f"URL is not an HTML page. Detected Content-Type: {content_type}")
                    return None

            # Navigate to the page
            response = await self.page.goto(url, timeout=60000)
            await self.page.wait_for_load_state('networkidle', timeout=60000)
            if not response or response.status != 200:
                print(f"Failed to load the URL. Status code: {response.status if response else 'Unknown'}")
                return None

            # Ensure the page contains an <html> tag
            page_content = await self.page.content()
            if "<html" not in page_content.lower():
                print(f"URL is not an HTML page (fallback check).")
                return None
            return page_content  # Return HTML content
        
        except Exception as e:
            print(f"Error fetching URL {url}: {e}")
            return None
        
    async def close(self):
        """Close the browser and stop Playwright."""
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()