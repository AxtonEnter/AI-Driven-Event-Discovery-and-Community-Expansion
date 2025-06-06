from bs4 import BeautifulSoup
from driver import PlaywrightDriver
from scraper import WebScraper
import tensorflow as tf
import re

def likely_event(text):
    patterns = [
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}',  # Month Day
        r'\b\d{1,2}:\d{2}\s*(?:AM|PM)?',                                           # Time
        r'\b\d{4}\b',                                                              # Year
        r'event|tour|festival|meeting|brunch|concert|presents|hunt|walk|talk|social|parade|market',
    ]
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def classify_blocks(raw_text):
    blocks = raw_text.split('\n')
    blocks = [b.strip() for b in blocks if b.strip()]

    for block in blocks:
        label = "EVENT" if likely_event(block) else "NON-EVENT"
        print(f"[{label}] {block}")

def textTest(url):
    driver = PlaywrightDriver(headless=True)
    try:
        html = driver.get_html(url)
        soup = BeautifulSoup(html, 'html.parser')
        for tag in soup(["script", "style", "meta", "head", "title", "noscript"]):
            tag.decompose()  # Remove from the tree
        # Get the visible text
        text = soup.get_text(separator="\n", strip=True)
        print(text, "\n")
        classify_blocks(text)

    finally:
        driver.close()

def main(start_url, root_url):
    """Entry point to start crawling the website using Selenium."""
    # driver = initSeleniumDriver()  # Initialize Selenium WebDriver
    driver = PlaywrightDriver(headless=True)
    try:
        scraper = WebScraper(driver, 100, 0.5)  # Initialize WebScraper
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
    # main(url_examples[example], url_examples[example])
    textTest("https://www.historicpalmyrany.com/")