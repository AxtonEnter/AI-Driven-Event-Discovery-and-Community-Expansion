from bs4 import BeautifulSoup
from urllib.parse import urljoin
import zlib
import asyncio
import utils
import logging


class WebScraper:
    def __init__(self, driver, rootUrl, logger: logging.Logger, maxPages=100, sleepTime=1):
        self.driver = driver
        self.maxPages = maxPages
        self.sleepTime = sleepTime
        self.visited = set()
        self.visitedCount = 0
        self.rootUrl = rootUrl
        self.emails = []
        self.logger = logger

        self.logger.info(f"Initialized Scraper")
    
    async def start(self):
        """
        Start the Playwright browser for this scraper.
        """
        await self.driver.start()

    async def getSoup(self, url):
        """
        From a URL, get the soup object with some dynamic elements removed.
        """
        html = await self.driver.getHtml(url)

        # returns false upon IP ban limit
        if html is False:
            return None

        if html is None:
            return None
        
        # Parse html with BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')
        for tag in soup(["script", "style", "meta", "head", "title", "noscript"]):
            tag.decompose()  # Remove from the tree
        return soup
    
    async def soupToText(self, soup):
        """
        Given a soup, extract visible text in the core of the page to be used for any text based process (model & hashing)
        Always use this function to maintain continuity with text processing
        """
        text = soup.get_text(separator=" ", strip=True)
        return text

    async def crawlSite(self, url=None, visited=None):
        """
        Crawls a website recursivley using the given driver and returns a list of visited URLs.
        """
        # Initialize visited set
        if visited is None:
            visited = set()
            self.logger.info(f"Starting Crawl")
        
        if url is None:
            url = self.rootUrl
        
        # Page Limit Check
        if len(visited) >= self.maxPages:
            return []
        
        # Return on already visited url (before attempting to connect)
        if url in visited:  
            return []
        
        # Debug
        self.logger.info(f"Visiting: {url}")
        # print(url)
        
        # Check if URL contains date and disallow past dates
        dates = utils.stringDateCheck(url)
        if len(dates) == 1:
            isPast = utils.isPastDate(dates[0])
            if isPast == None:
                self.logger.warning("Date Error")
            elif isPast == True:
                self.logger.info("URL Contains Past Date")
                return[]
            else:
                self.logger.info("URL Contains Current or Future Date")

        # Add url to visited
        visited.add(url)
        self.visitedCount += 1

        # Sleep before each connection
        await asyncio.sleep(self.sleepTime)
        
        # Connect to page and return html using Selenium (runs js)
        soup = await self.getSoup(url)
        
        if soup is None:
            return []
        
        # Get the visible text
        text = await self.soupToText(soup)

        # Check for emails
        words = text.split(" ")
        for word in words:
            if "@" in word:
                if word not in self.emails:
                    self.emails.append(word)

        """
        This block will be incomplete until database and message system implemented
        """
        # Check page hash
        textHash = utils.hashText(text)
        if textHash == utils.getHash(url):
            # Page has not changed (dont send to event queue)
            pass
        else:
            # Page has changed (send to event queue)
            compressed = zlib.compress(text.encode('utf-8'), level=-1)
            pass
        """
        Done
        """

        # For each link, convert partial urls to full and check if its on root site
        # If so: create a recursive call to crawl the url
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(self.rootUrl, href)

            if full_url.startswith(self.rootUrl) and full_url not in visited:
                await self.crawlSite(full_url, visited)
        
        return visited
    
    """
    New methods specifically for getting data to train the model
    """
    async def extractStructuredEventAndFullText(self, soup):
        """
        Extract structured event content + full page text.
        Returns:
            (event_blocks, full_text)
        """
        event_selectors = [
            ".entry", ".event", ".event-item", ".event-block",
            ".event-container", ".event-listing",
            "[id*=event]", "[class*=event]"
        ]

        event_blocks = []
        seen_texts = set()

        for selector in event_selectors:
            matches = soup.select(selector)
            for match in matches:
                block_text = match.get_text(separator=" ", strip=True)
                if block_text and block_text not in seen_texts and len(block_text.split()) >= 10:
                    seen_texts.add(block_text)
                    event_blocks.append(block_text)

        full_text = await self.soupToText(soup)
        return event_blocks, full_text

    async def extractFullPageTextOnly(self, soup):
        """
        Get the full visible text of a page, used for NON-EVENT pages.
        """
        return await self.soupToText(soup)
    
    async def crawlMultiEventPage(self, url):
        """
        Crawls a known multi event page for several events.
        """
        # Debug
        print(url)

        soup = await self.getSoup(url)
        if soup is None:
            return []
        
        # Get the visible text
        text = await self.soupToText(soup)

        # Check page hash
        textHash = utils.hashText(text)
        if textHash == utils.getHash(url):
            return []
        else:
            # Update Page Hash in DB
            pass
        
        

    async def close(self):
        """Close the browser when done."""
        await self.driver.close()
        self.logger.info("Closed Driver - Scraper")
