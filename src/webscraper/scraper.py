from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time

from playwright.sync_api import sync_playwright

import hashlib

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
        """Close the browser and stop Playwright."""
        self.browser.close()
        self.playwright.stop()


class WebScraper:
    def __init__(self, driver, maxPages=100, sleepTime=1):
        self.driver = driver
        self.maxPages = maxPages
        self.sleepTime = sleepTime

    def crawlSiteSeq(self, url, rootUrl, visited=None):
        """
        Crawls a website recursivley using Selenium and returns a list of visited URLs.
        """
        # Initialize visited set
        if visited is None:  
            visited = set()
        
        # Page Limit Check
        if len(visited) >= self.maxPages:
            return []
        
        # Return on already visited url (before attempting to connect)
        if url in visited:  
            return []

        # Sleep before each connection
        time.sleep(self.sleepTime)

        # Debug
        print(url)

        # Add url to visited
        visited.add(url)
        
        # Connect to page and return html using Selenium (runs js)
        html = self.driver.get_html(url)         
        
        if html is None:
            return []
        
        # Parse html with BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')

        # Check page hash
        soup_hash = self.hashSoup(soup)
        print("SHA-256 Hash:", soup_hash)
        if soup_hash == self.getSoupHash(url):
            # Page has not changed (dont send to event queue)
            pass
        else:
            # Page has changed (send to event queue)
            pass

        
        # Find all image urls
        # image_tags = soup.find_all('img')
        # image_urls = [img['src'] for img in image_tags]

        # For each link, convert partial urls to full and check if its on root site
        # If so: create a recursive call to crawl the url
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(rootUrl, href)

            if full_url.startswith(rootUrl) and full_url not in visited:
                self.crawlSiteSeq(full_url, rootUrl, visited)
        
        return visited

    def hashSoup(self, soup: BeautifulSoup) -> str:
        """Convert BeautifulSoup object to string and return its SHA-256 hash."""
        soup_str = str(soup)
        return hashlib.sha256(soup_str.encode()).hexdigest()

    def getSoupHash(self, url):
        """Returns the hash of the Soup for a given url stored in the database, returns False if url not previously hashed"""
        # Stored in database
        return False



def main(start_url, root_url):
    """Entry point to start crawling the website using Selenium."""
    # driver = initSeleniumDriver()  # Initialize Selenium WebDriver
    driver = PlaywrightDriver(headless=True)
    try:
        scraper = WebScraper(driver, 100, 1)  # Initialize WebScraper
        pages = scraper.crawlSiteSeq(start_url, root_url) # Seq
        print(f"\nTotal pages found: {len(pages)}")
        return pages
    finally:
        driver.close()


if __name__ == "__main__":
    url_examples = [
        "https://www.punsonline.com/",
        "https://shortsvillereindeer.com/",
        "https://recordarchive.com/",
        "https://rochester.kidsoutandabout.com/"]

    # These example sites have a low amount of pages (7-30)
    # Example 3 (https://rochester.kidsoutandabout.com/) will often put too much load on the server
    example = 0
    main(url_examples[example], url_examples[example])