import asyncio
from proxy import OxylabsProxy
from driver import PlaywrightDriver
from scraper import WebScraper
import utils
import logging
from urllib.parse import urlparse
import re
import os
import sys
from datetime import datetime
from org import Org

class scraperManager:
    def __init__(self, concurrentScrapers: int, orgs: list[Org], userId: str, proxyEnable: bool = True, testMode: bool = False):
        """
        Initialize the scraper manager with a list of organizations and an optional proxy.
        Test mode is used for debugging purposes, does not use any cloud systems.
        """
        self.userId = userId
        self.orgs = orgs
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

        # Cleanup: keep only the last 10 log files
        log_files = sorted(
            [f for f in os.listdir(log_dir) if f.startswith("WebScraper_") and f.endswith(".log")],
            key=lambda x: os.path.getmtime(os.path.join(log_dir, x))
        )
        for old_log in log_files[:-10]:  # Keep the last 10
            os.remove(os.path.join(log_dir, old_log))

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

        for org in orgs:
            # LOGGER SETUP
            logger_name = f"ORG[{org.id}]"

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
            scraper = WebScraper(driver=self.driver, org=org, userId=self.userId, maxPages=50, sleepTime=1, logger=individualLogger, testMode=testMode)
            self.scrapers.append(scraper)

        self.logger.info(f"Scrape Request From USER: {userId}, concurrentScrapers: {concurrentScrapers}, org count: {len(orgs)}, proxy: {self.proxyEnable}")
        self.logger.info(f"Scrape Request Orgs:{orgs}")


    async def concurrentCrawl(self):
        async def crawlTask(scraper):
            async with self.semaphore:
                startResponse = await scraper.start()

                if startResponse is None:
                    self.logger.error(f"Precheck failed for org {scraper.org.id}, skipping.")
                    await scraper.close()
                    return

                if startResponse == 404:
                    self.logger.error(f"Invalid URL for org {scraper.org.id}: {scraper.org.url}")
                    await scraper.close()
                    return
                

                await scraper.crawlSite()
                await scraper.close()

        # Create tasks lazily with generator expression (no coroutine created yet)
        tasks = (crawlTask(scraper) for scraper in self.scrapers)

        # Now asyncio.gather will create & run coroutines *one by one* respecting semaphore
        await asyncio.gather(*tasks)



    async def crawlMultiWithSemaphore(self, semaphore, scraper):
        """Ensures only X scrapers run at a time using a semaphore."""
        async with semaphore:  # Limits number of concurrent scrapers
            # return await scraper.crawlMultiEventPage()
            return await scraper.crawlMultiEventPage()

    async def concurrentCrawlMulti(self):
        await asyncio.gather(*(scraper.start() for scraper in self.scrapers))

        async def crawlAndClose(scraper:WebScraper):
            await self.crawlMultiWithSemaphore(self.semaphore, scraper)
            await scraper.close()

        await asyncio.gather(*(crawlAndClose(scraper) for scraper in self.scrapers))