import asyncio
from proxy import OxylabsProxy
from driver import PlaywrightDriver
from scraper import WebScraper


class scraperManager:
    def __init__(self, concurrentScrapers: int, urls: list, proxy: OxylabsProxy = None):
        """
        Initialize the scraper manager with a list of URLs and an optional proxy.
        """
        self.urls = urls
        self.proxy = proxy
        self.semaphore = asyncio.Semaphore(concurrentScrapers)
        self.scrapers: list[WebScraper] = []
        for url in urls:
            if self.proxy is not None:
                self.driver = PlaywrightDriver(headless=True, proxy=self.proxy)
            else:
                self.driver = PlaywrightDriver(headless=True)
            scraper = WebScraper(driver=self.driver, rootUrl=url, maxPages=100, sleepTime=1)
            self.scrapers.append(scraper)
            

    async def crawlWithSemaphore(self, semaphore, scraper):
        """Ensures only X scrapers run at a time using a semaphore."""
        async with semaphore:  # Limits number of concurrent scrapers
            return await scraper.crawlSite()

    async def concurrentCrawl(self):
        await asyncio.gather(*(scraper.start() for scraper in self.scrapers))
        tasks = [self.crawlWithSemaphore(self.semaphore, self.scrapers[i]) for i in range(len(self.scrapers))]
        await asyncio.gather(*tasks)