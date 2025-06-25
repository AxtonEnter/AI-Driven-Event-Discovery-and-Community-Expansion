from bs4 import BeautifulSoup
from urllib.parse import urljoin
import zlib
import asyncio
import utils
import logging
import boto3
import psycopg2
import json
from collections import Counter
import hashlib

QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/522167229147/main-queue"

DB_HOST = "test-database-jdb.c8v60oyuezl3.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "username123"
DB_PASSWORD = "password123"
DB_PORT = 5432


class WebScraper:
    def __init__(self, driver, rootUrl, logger: logging.Logger, maxPages=100, sleepTime=1, isMultiEvent=False):
        self.driver = driver
        self.maxPages = maxPages
        self.sleepTime = sleepTime
        self.visited = set()
        self.visitedCount = 0
        self.rootUrl = rootUrl
        self.isMultiEvent = isMultiEvent
        self.emails = []
        self.logger = logger

        # SNS Link
        self.sqs = boto3.client('sqs', region_name='us-east-1')
        # for queue in self.sqs.queues.all():
        #     print(queue.url)

        # Database Link
        self.conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        self.cur = self.conn.cursor()
        self.cur.execute("SELECT version();")
        self.logger.info(f"DB Connection: {self.cur.fetchone()}")

        self.logger.info(f"Initialized Scraper")
    
    async def start(self):
        """
        Start the Playwright browser for this scraper.
        """
        await self.driver.start()
    
    async def getHtml(self, url):
        """
        Get the HTML content of a page using the driver.
        """
        html = await self.driver.getHtml(url)
        # returns false upon IP ban limit
        if html is False:
            return None

        if html is None:
            return None
        
        return html

    async def getSoup(self, html):
        """
        From a URL, get the soup object with some dynamic elements removed.
        """
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

        # Connect to page and return html
        html = await self.getHtml(url)
        soup = await self.getSoup(html)
        
        if soup is None:
            return []
        
        # Get the visible text
        text = await self.soupToText(soup)

        images = soup.find_all('img')
        imageUrls = [img['data-image'] for img in images]
        self.logger.info(f"Found {len(imageUrls)} image(s) on the page.")
        # print(images)

        messageRequired = False

        # Check page hash
        textHash = utils.hashText(text)
        sql = "SELECT * FROM url_hashes WHERE url=%s"
        self.cur.execute(sql, (url,))
        response = self.cur.fetchone()

        if response == None or response == []: # New Page (No Hash)
            self.logger.info("New Page - No Hash Stored: Sending to Model")
            messageRequired = True
            sql = "INSERT INTO url_hashes VALUES (%s, %s);"
            self.cur.execute(sql, (url, textHash,))
            self.conn.commit()
        else:
            if response[1] != textHash: # Page has changed
                self.logger.info("Page has changed - Updating Hash: Sending to Model")
                messageRequired = True
                sql = "UPDATE url_hashes SET textHash = %s WHERE url = %s;"
                self.cur.execute(sql, (textHash, url,))
                self.conn.commit()

                # Page has changed (send to event queue)
                compressed = zlib.compress(text.encode('utf-8'), level=-1)
                pass
            else: # Page has not changed
                self.logger.info("Page has not changed")
                pass
        
        if messageRequired:
            # Send SNS Message
            orgId = 52
            messageInfo = [orgId, url, html, imageUrls]
            message = json.dumps(messageInfo)
            self.logger.info(f"Message: [OrgId:{orgId}, URL:{url}, HTML:{html[:50]}..., Images:{len(imageUrls)}]")
            response = self.sqs.send_message(
                QueueUrl=QUEUE_URL,
                MessageBody=message
            )
            self.logger.info(f"Message Sent: {response['MessageId']}")


        # For each link, convert partial urls to full and check if its on root site
        # If so: create a recursive call to crawl the url
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(self.rootUrl, href)

            if full_url.startswith(self.rootUrl) and full_url not in visited:
                await self.crawlSite(full_url, visited)
        
        return visited
    
    """
    New method specifically for getting data to train the model
    """
    async def extractStructuredEventBlocks(self, soup):
        """
        Extract structured event-related sections from known HTML patterns (e.g., .entry, .event).
        Returns:
            (event_blocks, full_page_text)
        """
        event_selectors = [
            ".entry",               # Lucky Ladd, WordPress common
            ".event",               # Generic catch-all
            ".event-item",          # Calendar plugins
            ".event-block",         # Custom CMS
            ".event-container",     # Another variation
            ".event-listing",
            "[id*=event]",
            "[class*=event]"
        ]

        event_blocks = []
        seen_texts = set()

        for selector in event_selectors:
            matches = soup.select(selector)
            for match in matches:
                block_text = match.get_text(separator=" ", strip=True)
                # This if statement will help to filter out very short or duplicate blocks
                if block_text and block_text not in seen_texts and len(block_text.split()) >= 10:
                    seen_texts.add(block_text)
                    event_blocks.append(block_text)

        full_text = await self.soupToText(soup)
        return event_blocks, full_text
    

    async def crawlMultiEventPage(self):
        url = self.rootUrl

        soup = await self.getSoup(url)
        if soup is None:
            return []

        main = soup.body or soup

        excluded_tags = {'header', 'footer'}
        excluded_ids = {'header', 'footer'}
        excluded_classes = {'header', 'footer'}

        def is_excluded(block):
            if block.name in excluded_tags:
                return True
            if block.get('id') and block.get('id').lower() in excluded_ids:
                return True
            classes = block.get('class') or []
            if any(c.lower() in excluded_classes for c in classes):
                return True
            return False

        candidates = main.find_all(['div', 'li', 'article', 'section', 'p'], recursive=True)
        candidates = [block for block in candidates if not is_excluded(block)]

        # Step 1: Keep only the deepest (leaf) blocks
        leafBlocks = []
        for i, block in enumerate(candidates):
            if not any(other is not block and block in other.parents for other in candidates):
                leafBlocks.append(block)

        # Step 2: Filtering and deduplication
        seenHashes = set()
        filteredBlocks = []

        for block in leafBlocks:
            text = await self.soupToText(block)
            if len(text.strip()) < 30:
                continue
            h = hashlib.sha1(text.strip().lower().encode()).hexdigest()
            if h in seenHashes:
                continue
            seenHashes.add(h)

            # Find Images
            images = list(block.find_all('img'))
            if block.parent:
                for sibling in block.parent.find_all(recursive=False):
                    if sibling is not block:
                        images.extend(sibling.find_all('img'))

            if block.parent:
                images.extend(block.parent.find_all('img', recursive=False))

            imageUrls = []
            seen = set()
            for img in images:
                src = img.get('src')
                if src:
                    full_url = urljoin(url, src)
                    if full_url not in seen:
                        seen.add(full_url)
                        imageUrls.append(full_url)

            filteredBlocks.append((block, text, imageUrls))

        # Step 3: Scoring and logging
        for block, text, imageUrls in filteredBlocks:
            score = utils.score_event_block(text)
            self.logger.info(f"[TAG: {block.name}, Score:{score}] {text[:100]}")
            self.logger.info(f"Images: {imageUrls}")

        # # Check page hash
        # textHash = utils.hashText(text)
        # if textHash == utils.getHash(url):
        #     return []
        # else:
        #     # Update Page Hash in DB
        #     pass

    async def close(self):
        """Close the browser when done."""
        await self.driver.close()
        self.logger.info("Closed Driver - Scraper")
