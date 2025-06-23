import asyncio
from proxy import OxylabsProxy
from driver import PlaywrightDriver
from scraper import WebScraper
import logging
from urllib.parse import urlparse
import re
import os
import sys
from datetime import datetime

class scraperManager:
    def __init__(self, concurrentScrapers: int, urls: list, proxyEnable: bool = False):
        """
        Initialize the scraper manager with a list of URLs and an optional proxy.
        """
        self.urls = urls
        self.proxyEnable = proxyEnable
        self.semaphore = asyncio.Semaphore(concurrentScrapers)
        self.scrapers: list[WebScraper] = []

        # Logger Setup
        logger_name = "Scraper Manager"
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        log_dir = os.path.join(os.getcwd(), "src/webscraper/logs")
        log_file = os.path.join(log_dir, f"WebScraper_{timestamp}.log")
        os.makedirs(log_dir, exist_ok=True)
        self.logger = logging.getLogger(logger_name)
        self.logger.setLevel(logging.DEBUG)

        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

        # Console Handler
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.INFO)
        ch.setFormatter(formatter)

        # File Handler (unique per scraper)
        fh = logging.FileHandler(log_file)
        fh.setLevel(logging.DEBUG)
        fh.setFormatter(formatter)

        self.logger.addHandler(ch)
        self.logger.addHandler(fh)

        for url in urls:
            # LOGGER SETUP
            parsed_url = urlparse(url)
            domain = parsed_url.netloc.replace("www.", "")
            safe_name = re.sub(r'[^\w\-_.]', '_', domain)  # Just in case
            logger_name = f"Scraper[{safe_name}]"

            individualLogger = logging.getLogger(logger_name)
            individualLogger.setLevel(logging.DEBUG)
            individualLogger.addHandler(ch)
            individualLogger.addHandler(fh)

            # SCRAPER SETUP
            if self.proxyEnable:
                proxy = OxylabsProxy("joetest_NnHg5", "tihWFo4+gp36", 50)
                self.driver = PlaywrightDriver(individualLogger, headless=True, proxy=proxy)
            else:
                self.driver = PlaywrightDriver(individualLogger, headless=True)
            scraper = WebScraper(driver=self.driver, rootUrl=url, maxPages=10, sleepTime=1, logger=individualLogger)
            self.scrapers.append(scraper)
        
        self.logger.info(f"Scraper Manager Initialized, concurrentScrapers: {concurrentScrapers}, urls: {urls}, url count: {len(urls)}, proxy: {self.proxyEnable}")
            

    async def crawlWithSemaphore(self, semaphore, scraper):
        """Ensures only X scrapers run at a time using a semaphore."""
        async with semaphore:  # Limits number of concurrent scrapers
            # return await scraper.crawlMultiEventPage()
            return await scraper.crawlSite()
    
    async def concurrentCrawl(self):
        await asyncio.gather(*(scraper.start() for scraper in self.scrapers))

        async def crawlAndClose(scraper:WebScraper):
            await self.crawlWithSemaphore(self.semaphore, scraper)
            await scraper.close()

        await asyncio.gather(*(crawlAndClose(scraper) for scraper in self.scrapers))


    async def crawlWithSemaphore(self, semaphore, scraper):
        """Ensures only X scrapers run at a time using a semaphore."""
        async with semaphore:  # Limits number of concurrent scrapers
            # return await scraper.crawlMultiEventPage()
            return await scraper.crawlMultiEventPage()

    async def concurrentCrawlMulti(self):
        await asyncio.gather(*(scraper.start() for scraper in self.scrapers))

        async def crawlAndClose(scraper:WebScraper):
            await self.crawlWithSemaphore(self.semaphore, scraper)
            await scraper.close()

        await asyncio.gather(*(crawlAndClose(scraper) for scraper in self.scrapers))

        