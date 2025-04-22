from scraperManager import scraperManager
import asyncio
from proxy import OxylabsProxy

URLs = [
    "https://shortsvillereindeer.com/",
    "https://recordarchive.com/",
    "https://www.codeninjas.com/tx-san-antonio-stone-oak-1",
    "https://rgmc.ticketleap.com/",
    "https://www.punsonline.com/",
    "https://www.pumcny.org/",
    "https://www.stjohnsliving.org/"]

# URLs = ["https://www.punsonline.com/"]

async def testScraperManager():
    manager = scraperManager(concurrentScrapers=10, urls=URLs, proxyEnable=True)
    await manager.concurrentCrawl()

async def testScraperManagerSingle():
    urls = ["https://www.punsonline.com/"]
    manager = scraperManager(concurrentScrapers=5, urls=urls, proxyEnable=True)
    await manager.concurrentCrawl()



async def main():
    await testScraperManager()
    # await testScraperManagerSingle()


if __name__ == "__main__":
    asyncio.run(main())