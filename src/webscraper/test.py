from bs4 import BeautifulSoup
from driver import PlaywrightDriver
from scraper import WebScraper
import asyncio


def textTest(url):
    driver = PlaywrightDriver(headless=True)
    try:
        html = driver.getHtml(url)
        soup = BeautifulSoup(html, 'html.parser')
        for tag in soup(["script", "style", "meta", "head", "title", "noscript"]):
            tag.decompose()  # Remove from the tree
        # Get the visible text
        text = soup.get_text(separator=" ", strip=True)
        print(text)

    finally:
        driver.close()

async def crawl_with_semaphore(semaphore, scraper, url, rootUrl):
    """Ensures only X scrapers run at a time using a semaphore."""
    async with semaphore:  # Limits number of concurrent scrapers
        await scraper.crawlSite(url, rootUrl)

async def concurrentCrawlerTest():
    maxConcurrentScrapers = 2
    urls = [
    "https://www.punsonline.com/",
    "https://shortsvillereindeer.com/",
    "https://recordarchive.com/"]

    semaphore = asyncio.Semaphore(maxConcurrentScrapers)  # Limit concurrency
    scrapers = [WebScraper(driver=PlaywrightDriver(headless=True)) for _ in range(len(urls))]

    await asyncio.gather(*(scraper.start() for scraper in scrapers))
    tasks = [crawl_with_semaphore(semaphore, scrapers[i], url, url) for i, (url) in enumerate(urls)]
    await asyncio.gather(*tasks)

    await asyncio.gather(*(scraper.close() for scraper in scrapers))

    print("Crawling complete!")


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
    # textTest("https://shortsvillereindeer.com/events")

    asyncio.run(concurrentCrawlerTest())