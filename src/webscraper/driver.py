from playwright.sync_api import sync_playwright
from playwright.async_api import async_playwright
from proxy import OxylabsProxy
import time
import asyncio

class PlaywrightDriver:
    def __init__(self, headless: bool = True, proxy: OxylabsProxy = None):
        """
        Initialize the Playwright driver with a browser instance.
        If given a list of ports, the driver will rotate IP addresses using a proxy.
        """
        self.headless = headless
        self.currentPort = None
        self.proxy = proxy
        self.playwright = None
        self.browser = None
        self.page = None
        self.context = None
        self.session = None
        self.totalBytes = 0
        self.currentBytes = 0
    
    async def start(self):
        """Start the Playwright session asynchronously."""
        self.playwright = await async_playwright().start()

        self.browser = await self.playwright.chromium.launch(headless=self.headless)

        self.page = await self.browser.new_page()

        # Block images, media, and fonts
        await self.page.route("**/*", lambda route, request: route.abort() if request.resource_type in ["image", "stylesheet", "font", "media"] else route.continue_())

        # Set up CDP session to capture network traffic
        self.context = self.page.context
        self.session = await self.context.new_cdp_session(self.page)

        if self.proxy:
            self.context = await self.browser.new_context(proxy={"server": self.proxy.getServer() + ":" + self.proxy.getCurrentPort(),
                                                                 "username": self.proxy.getUsername(),
                                                                 "password": self.proxy.getPassword()})

        # Track network responses
        async def log_traffic(event):
            if "encodedDataLength" in event:
                self.totalBytes += event["encodedDataLength"]
                self.currentBytes += event["encodedDataLength"]
        
        await self.session.send("Network.enable")
        self.session.on("Network.loadingFinished", log_traffic)


    def rotateProxy(self):
        """Rotate the proxy IP address."""
        if self.proxy:
            # Rotate the proxy IP address
            self.proxy.nextPort()
            self.context = self.browser.new_context(proxy={"server": self.proxy.getServer() + ":" + self.proxy.getCurrentPort(),
                                                           "username": self.proxy.getUsername(),
                                                           "password": self.proxy.getPassword()})
            pass

    async def getHtml(self, url: str) -> str | None:
        """Fetch the HTML content of a webpage if it's an HTML page."""
        if not self.page:
            print("Error: Playwright not started. Call `await start()` first.")
            return None
        
        if self.proxy:
            self.rotateProxy(self)
        
        self.currentBytes = 0
        
        try:
            # First, check the Content-Type using a HEAD request
            responseHead = await self.page.request.head(url)
            if responseHead:
                content_type = responseHead.headers.get("content-type", "").lower()
                if "text/html" not in content_type:
                    print(f"URL is not an HTML page. Detected Content-Type: {content_type}")
                    return None

            # Navigate to the page
            responseBody = await self.page.goto(url, timeout=20000)
            try:
                await self.page.wait_for_load_state("load", timeout=10000)  # Wait for load trigger
            except:
                await self.page.wait_for_load_state("networkidle", timeout=20000)  # If timeout, wait for network idle

            if not responseBody or responseBody.status != 200:
                print(f"Failed to load the URL. Status code: {responseBody.status if responseBody else 'Unknown'}")
                return None

            # Ensure the page contains an <html> tag
            pageContent = await self.page.content()
            if "<html" not in pageContent.lower():
                print(f"URL is not an HTML page (fallback check).")
                return None
            
            return pageContent  # Return HTML content
        
        except Exception as e:
            print(f"Error fetching URL {url}: {e}")
            return None
        
    async def close(self):
        """Close the browser and stop Playwright."""
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    def getCurrentTraffic(self):
        """Return the current network traffic (in MB) for the last page."""
        currentMb = self.currentBytes / (1024 * 1024)  # Convert bytes to MB
        return currentMb

    def getTotalTraffic(self):
        """Return the total network traffic (in MB)."""
        totalMb = self.totalBytes / (1024 * 1024)  # Convert bytes to MB
        return totalMb