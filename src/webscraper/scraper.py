from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time
import zlib
import asyncio

import utils



class WebScraper:
    def __init__(self, driver, maxPages=100, sleepTime=1):
        self.driver = driver
        self.maxPages = maxPages
        self.sleepTime = sleepTime
        self.visited = set()  # Keep track of visited URLs
    
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
        for footer in soup.find_all("footer"):
            footer.decompose()
        text = soup.get_text(separator=" ", strip=True)
        return text

    async def crawlSite(self, url, rootUrl, visited=None):
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
        await asyncio.sleep(self.sleepTime)

        # Debug
        print(url)

        # Add url to visited
        visited.add(url)
        
        # Connect to page and return html using Selenium (runs js)
        soup = await self.getSoup(url)        
        
        if soup is None:
            return []
        
        # Get the visible text
        text = await self.soupToText(soup)

        # Check page hash
        textHash = utils.hashText(text)
        # print("SHA-256 Hash:", textHash)
        if textHash == utils.getHash(url):
            # Page has not changed (dont send to event queue)
            pass
        else:
            # Page has changed (send to event queue)
            compressed = zlib.compress(text.encode('utf-8'), level=-1)
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
                await self.crawlSite(full_url, rootUrl, visited)
        
        return visited
    
    async def close(self):
        """Close the browser when done."""
        await self.driver.close()