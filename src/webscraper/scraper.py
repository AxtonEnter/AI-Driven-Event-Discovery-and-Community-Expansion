from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


def init_driver():
    # Webdriver Option using Chrome
    chrome_options = Options()
    chrome_options.add_argument("--log-level=0")                # Set log level
    chrome_options.add_argument("--headless")                   # Run Chrome in headless mode (no window)
    chrome_options.add_argument("--disable-gpu")                # Disable GPU acceleration
    chrome_options.add_argument("--use-gl=swiftshader")         # Use software rendering
    chrome_options.add_argument("--disable-webgl")              # Disable WebGL
    chrome_options.add_argument("--disable-webgl2")             # Disable WebGL2
    chrome_options.add_argument("--disable-dev-shm-usage")      # Prevent memory issues
    chrome_options.add_argument("--no-sandbox")                 # Required for some environments
    chrome_options.add_argument("--disable-software-rasterizer")# Avoid WebGL errors

    # Set up the WebDriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver


def crawlSiteSeq(url, rootUrl, visited=None, driver=None, maxPages=100, sleepTime=1):
    """
    Crawls a website recursivley using Selenium and returns a list of visited URLs.
    """
    # Initialize visited set
    if visited is None:  
        visited = set()
    
    # Page Limit Check
    if len(visited) >= maxPages:
        return []
    
    # Return on already visited url (before attempting to connect)
    if url in visited:  
        return []

    # Sleep before each connection
    time.sleep(sleepTime)

    # Debug
    print(url)

    # Add url to visited
    visited.add(url)
    
    # Connect to page and return html using Selenium (runs js)
    driver.get(url)         
    html = driver.page_source
    
    if html is None:
        return []
    
    # Parse html with BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')

    # Find all image urls
    # image_tags = soup.find_all('img')
    # image_urls = [img['src'] for img in image_tags]

    # For each link, convert partial urls to full and check if its on root site
    # If so: create a recursive call to crawl the url
    for link in soup.find_all('a', href=True):
        href = link['href']
        full_url = urljoin(rootUrl, href)

        if full_url.startswith(rootUrl) and full_url not in visited:
            crawlSiteSeq(full_url, rootUrl, visited, driver, maxPages, sleepTime)
    
    return visited



def main(start_url, root_url):
    """Entry point to start crawling the website using Selenium."""
    driver = init_driver()  # Initialize Selenium WebDriver
    try:
        pages = crawlSiteSeq(start_url, root_url, driver=driver, maxPages=100, sleepTime=0.1) # Seq
        print(f"\nTotal pages found: {len(pages)}")
        return pages
    finally:
        driver.quit()


if __name__ == "__main__":
    url_examples = [
        "https://www.punsonline.com/",
        "https://shortsvillereindeer.com/",
        "https://recordarchive.com/",
        "https://rochester.kidsoutandabout.com/"]

    # These example sites have a low amount of pages (7-30)
    # Example 3 (https://rochester.kidsoutandabout.com/) will often put too much load on the server
    example = 0
    main(url_examples[example], url_examples[example])