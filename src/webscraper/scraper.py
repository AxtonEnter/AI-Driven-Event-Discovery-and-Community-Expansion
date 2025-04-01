from bs4 import BeautifulSoup
from urllib.parse import urljoin
import zlib
import asyncio
import utils

class WebScraper:
    def __init__(self, driver, rootUrl, maxPages=100, sleepTime=1):
        self.driver = driver
        self.maxPages = maxPages
        self.sleepTime = sleepTime
        self.visited = set()
        self.visitedCount = 0
        self.rootUrl = rootUrl
    
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
        
        if url is None:
            url = self.rootUrl
        
        # Page Limit Check
        if len(visited) >= self.maxPages:
            return []
        
        # Return on already visited url (before attempting to connect)
        if url in visited:  
            return []
        
        # Debug
        print(url)
        
        # Check if URL contains date and disallow past dates
        dates = utils.urlDateCheck(url)
        if len(dates) == 1:
            isPast = utils.isPastDate(dates[0])
            if isPast == None:
                print("Date Error")
            elif isPast == True:
                print("URL Contains Past Date")
                return[]
            else:
                print("URL Contains Current or Future Date")

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
    
    async def close(self):
        """Close the browser when done."""
        await self.driver.close()
        ToalMb = self.driver.getTotalTraffic()
        return [self.rootUrl, self.visitedCount, ToalMb, ToalMb / self.visitedCount]