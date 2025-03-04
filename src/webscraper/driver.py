from playwright.sync_api import sync_playwright

class PlaywrightDriver:
    def __init__(self, headless: bool = True):
        """Initialize the Playwright driver with a browser instance."""
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=headless)
        self.page = self.browser.new_page()

    def get_html(self, url: str) -> str | None:
        """Fetch the HTML content of a webpage if it's an HTML page."""
        
        # First, check the Content-Type using a HEAD request
        response = self.page.request.fetch(url, method="HEAD")

        if response:
            content_type = response.headers.get("content-type", "").lower()
            if "text/html" not in content_type:
                print(f"URL is not an HTML page. Detected Content-Type: {content_type}")
                return None

        # Now actually navigate to the page
        response = self.page.goto(url, timeout=60000)

        # Validate response exists
        if not response:
            print("Failed to load the URL.")
            return None

        # Fallback check: Ensure the page contains an <html> tag
        page_content = self.page.content()
        if "<html" not in page_content.lower():
            print(f"URL is not an HTML page (fallback check).")
            return None

        return page_content  # Return HTML content
    
    def close(self):
        self.browser.close()