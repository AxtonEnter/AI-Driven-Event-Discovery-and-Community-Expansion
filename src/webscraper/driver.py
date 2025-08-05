# from playwright.sync_api import sync_playwright
from playwright.async_api import async_playwright
from playwright_stealth import Stealth
from urllib.parse import urljoin
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
        self.context = None
        self.page = None
        self.USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        self.logger = logger
        self.lastRequestTime = 0
        self.governementSite = False

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
        
        self.context = await self.browser.new_context(
            user_agent=self.USER_AGENT,
            viewport={"width": 1920, "height": 1080},
            ignore_https_errors=True
        )

        # custom_languages = ("en-US",)
        # stealth = Stealth(
        #     navigator_languages_override=custom_languages,
        #     init_scripts_only=True
        # )
        # await stealth.apply_stealth_async(self.context)

        self.page = await self.context.new_page()
    

    async def precheck(self, url: str):
        """
        Precheck the page to see if it redirects. 
        Check for .gov and turn off proxy if it does.
        Check for 404.
        """
        self.logger.info(f"Starting Driver Precheck")
        if not self.page:
            print("Error: Playwright not started. Call `await start()` first.")
            return None
        
        startUrl = url
        try:
            self.logger.info(f"Prechecking URL: {url}")
            async with async_playwright() as p:
                requestContext = await p.request.new_context()
                currentUrl = startUrl
                visitedUrls = [currentUrl]

                MAX_REDIRECTS = 5  # Limit to prevent infinite loops
                for _ in range(MAX_REDIRECTS):
                    response = await requestContext.get(currentUrl, max_redirects=0)
                    status = response.status
                    headers = response.headers

                    # Check for redirect status codes
                    if 300 <= status < 400:
                        location = headers.get("location")
                        if not location:
                            break

                        # Resolve relative redirects
                        nextUrl = urljoin(currentUrl, location)
                        visitedUrls.append(nextUrl)
                        currentUrl = nextUrl
                    else:
                        break  # Reached final URL (not a redirect)

                await requestContext.dispose()
        except Exception as e:
            self.logger.error(f"Error during precheck: {e}")
            return None

        finalUrl = visitedUrls[-1]
        
        if status == 404:
            self.logger.warning(f"404 Not Found at {finalUrl}")
            return 404
    
        if finalUrl == startUrl:
            self.logger.info(f"No redirects, final URL is the same as start URL: {startUrl}")
        else:
            self.logger.info(f"Redirects followed, from {startUrl} to {finalUrl}")

        if ".gov" in finalUrl:
            self.logger.warning(f".gov site detected, disabling proxy: {finalUrl}")
            self.governementSite = True
            self.proxy = None  # Disable proxy for .gov sites
        
        return finalUrl




    async def interceptRequest(self, route, request, targetUrl):
        """Block specific resource types from loading. Also blocks routing to other pages."""
        normalizedUrl = utils.normalize_url(request.url)

        # Dont allow .gov sites with proxy
        if self.proxy is not None and ".gov" in normalizedUrl:
            self.logger.warning(f".gov site blocked by proxy: {normalizedUrl}")
            await route.abort()
            return

        if request.resource_type in ["image", "stylesheet", "font", "media"]:
            await route.abort()  # Block unwanted resource types
        else:
            # self.logger.info(f"Allowing: {normalizedUrl}")
            await route.continue_()  # Allow other requests for the main URL

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
            
            self.context = await self.browser.new_context(
                user_agent=self.USER_AGENT,
                viewport={"width": 1920, "height": 1080},
                ignore_https_errors=True
            )
            custom_languages = ("en-US",)
            stealth = Stealth(
                navigator_languages_override=custom_languages,
                init_scripts_only=True
            )
            await stealth.apply_stealth_async(self.context)
            self.page = await self.context.new_page()


    async def getHtml(self, url: str) -> str | None:
        """Fetch the HTML content of a webpage if it's an HTML page."""
        if not self.page:
            print("Error: Playwright not started. Call `await start()` first.")
            return None

        # await self.page.route("**/*", lambda route, request: self.interceptRequest(route, request, url))

        try:
            # First, check the Content-Type using a HEAD request
            if self.proxy:
                while True:
                    bannedPortCount = len(self.proxy.getBannedPorts())
                    if bannedPortCount >= 5:
                        self.logger.critical("Max Blocked IPs Reached (5)")
                        return False
                    
                    await self.rotateProxy()
                    self.logger.info(f"Rotated Proxy to Port: {self.proxy.getCurrentPort()}")
                    self.logger.info("Requesting Head")

                    responseHead = await self.page.request.fetch(
                        url,
                        method="HEAD"
                    )
    
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

            await self.page.route("**/*", lambda route, request: self.interceptRequest(route, request, url))
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