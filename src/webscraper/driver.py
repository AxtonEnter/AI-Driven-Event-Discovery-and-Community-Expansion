# from playwright.sync_api import sync_playwright
from playwright.async_api import async_playwright
from proxy import OxylabsProxy
import utils
import logging
import time
import asyncio

class PlaywrightDriver:
    def __init__(self, logger: logging.Logger, headless: bool = True, proxy: OxylabsProxy = None):
        """
        Initialize the Playwright driver with a browser instance.
        If given a proxy, the driver will rotate IP addresses.
        """
        self.headless = headless
        self.proxy = proxy
        self.playwright = None
        self.browser = None
        self.page = None
        self.USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        self.logger = logger
        self.lastRequestTime = 0

        self.logger.info(f"Initialized Driver")

    async def start(self):
        """Start the Playwright session asynchronously."""
        self.playwright = await async_playwright().start()

        if self.proxy is not None:
            self.browser = await self.playwright.chromium.launch(proxy={
                                            "server": str(self.proxy.getServer()) + ":" + str(self.proxy.getCurrentPort()),
                                            "username": self.proxy.getUsername(),
                                            "password": self.proxy.getPassword()},
                                            headless=self.headless)
        else:
            self.browser = await self.playwright.chromium.launch(headless=self.headless)
        
        self.page = await self.browser.new_page()
    
    async def interceptRequest(self, route, request, targetUrl):
        """Block specific resource types from loading. Also blocks routing to other pages."""
        normalizedUrl = utils.normalize_url(request.url)
        normalizedTargetUrl = utils.normalize_url(targetUrl)
        if normalizedUrl == normalizedTargetUrl:
            if request.resource_type in ["image", "stylesheet", "font", "media"]:
                await route.abort()  # Block unwanted resource types
            else:
                await route.continue_()  # Allow other requests for the main URL
        else:
            # self.logger.info(f"Intercepted: {normalizedUrl}")
            await route.abort()  # Block all other domains

    async def rotateProxy(self):
        """Rotates the proxy IP address."""
        if self.proxy is not None:
            self.proxy.nextPort()
            await self.page.close()
            await self.browser.close()
            self.browser = await self.playwright.chromium.launch(proxy={
                                        "server": str(self.proxy.getServer()) + ":" + str(self.proxy.getCurrentPort()),
                                        "username": self.proxy.getUsername(),
                                        "password": self.proxy.getPassword()},
                                        headless=self.headless)
            self.page = await self.browser.new_page()

    async def getHtml(self, url: str) -> str | None:
        """Fetch the HTML content of a webpage if it's an HTML page."""
        if not self.page:
            print("Error: Playwright not started. Call `await start()` first.")
            return None

        await self.page.route("**/*", lambda route, request: self.interceptRequest(route, request, url))

        try:
            # First, check the Content-Type using a HEAD request
            if self.proxy:
                while True:
                    bannedPortCount = len(self.proxy.getBannedPorts())
                    if bannedPortCount >= 5:
                        self.logger.critical("Max Blocked IPs Reached (5)")
                        return None
                    
                    await self.rotateProxy()
                    self.logger.info(f"Rotated Proxy to Port: {self.proxy.getCurrentPort()}")
                    await self.page.route("**/*", lambda route, request: self.interceptRequest(route, request, url))
                    self.logger.info("Requesting Head")
                    responseHead = await self.page.request.head(url)
                    self.logger.info("Head Done")
                    if responseHead.status == 403:
                        self.logger.error("Port Banned")
                        self.proxy.currentPortBanned()
                        continue
                    else:
                        if responseHead:
                            content_type = responseHead.headers.get("content-type", "").lower()
                            if "text/html" not in content_type:
                                self.logger.warning(f"URL is not an HTML page. Detected Content-Type: {content_type}")
                                return None
                            else:
                                break
                        else:
                            self.logger.warning("No Response Head")
                            return None

            # Ensure its been at least 1 second since last body request.
            currentTime = time.time()
            timeElapsed = currentTime - self.lastRequestTime
            if (timeElapsed < 1):
                await asyncio.sleep(1 - timeElapsed)
                timeElapsed = 1
            self.lastRequestTime = currentTime

            # Navigate to the page
            self.logger.info(f"Requesting Body. Last Request: {timeElapsed:.1f} Sec")
            responseBody = await self.page.goto(url, wait_until="domcontentloaded", timeout=20000)
            self.logger.info("Body Done")
            # try:
            #     await self.page.wait_for_load_state("load", timeout=10000)  # Wait for load trigger
            # except:
            #     await self.page.wait_for_load_state("networkidle", timeout=20000)  # If timeout, wait for network idle

            if not responseBody or responseBody.status != 200:
                self.logger.warning(f"Failed to load the URL. Status code: {responseBody.status if responseBody else 'Unknown'}")
                return None

            # Ensure the page contains an <html> tag
            pageContent = await self.page.content()
            if "<html" not in pageContent.lower():
                self.logger.warning(f"URL is not an HTML page (fallback check).")
                return None
            
            return pageContent  # Return HTML content
        
        except Exception as e:
            self.logger.warning(f"Error fetching URL {url}: {e}")
            return None
        
    async def close(self):
        """Close the browser and stop Playwright."""
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        self.logger.info("Closed Driver")