from bs4 import BeautifulSoup
from urllib.parse import urljoin
from urllib.parse import urlparse
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
    async def extractEventPageTextFromUrl(self, url, soup):
        """
        Return full page text if the URL path suggests it's an event page.
        Prioritizes exact match in first path segment, then partial keyword presence.
        """
        event_keywords = ['event', 'calendar', 'schedule', 'activities', 'upcoming', 'events', 'calendars']
        parsed = urlparse(url.lower())
        path_segments = [seg for seg in parsed.path.strip("/").split("/") if seg]

        if not path_segments:
            return None

        first_segment = path_segments[0]

        # 1. Exact match
        if first_segment in event_keywords:
            return await self.soupToText(soup)

        # 2. Keyword exists inside first segment
        if any(keyword in first_segment for keyword in event_keywords):
            return await self.soupToText(soup)

        return None

    
    async def extractNonEventPageTextFromUrl(self, url, soup):
        """
        Returns full page text only if the first URL path segment exactly matches a known non-event keyword.
        """
        non_event_keywords = ['about-us', 'contact-us', 'faq', 'contact', 'volunteer', 'our-mission', 'support', 'history', 'policies', 'news', 'sponsor', 'blog']
        parsed = urlparse(url.lower())
        path_segments = [seg for seg in parsed.path.strip("/").split("/") if seg]

        if not path_segments:
            return None

        first_segment = path_segments[0]

        if first_segment in non_event_keywords:
            return await self.soupToText(soup)

        return None
    
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
