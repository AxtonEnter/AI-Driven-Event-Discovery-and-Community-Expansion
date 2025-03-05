from bs4 import BeautifulSoup
from driver import PlaywrightDriver
from scraper import WebScraper


def textTest(url):
    driver = PlaywrightDriver(headless=True)
    try:
        html = driver.get_html(url)
        soup = BeautifulSoup(html, 'html.parser')
        for tag in soup(["script", "style", "meta", "head", "title", "noscript"]):
            tag.decompose()  # Remove from the tree
        # Get the visible text
        text = soup.get_text(separator=" ", strip=True)
        print(text)

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
    textTest("https://shortsvillereindeer.com/events")