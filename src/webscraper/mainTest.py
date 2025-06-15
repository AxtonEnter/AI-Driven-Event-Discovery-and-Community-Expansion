from scraperManager import scraperManager
import asyncio

URLs = [
    "https://shortsvillereindeer.com/",
    "https://recordarchive.com/",
    "https://www.codeninjas.com/tx-san-antonio-stone-oak-1",
    "https://rgmc.ticketleap.com/",
    "https://www.punsonline.com/",
    "https://www.pumcny.org/",
    "https://www.stjohnsliving.org/"]

async def testScraperManager():
    manager = scraperManager(concurrentScrapers=7, urls=URLs, proxyEnable=True)
    await manager.concurrentCrawl()

async def testScraperManagerNoProxy():
    manager = scraperManager(concurrentScrapers=7, urls=URLs, proxyEnable=False)
    await manager.concurrentCrawl()

async def testScraperManagerSingle():
    urls = ["https://www.punsonline.com/"]
    manager = scraperManager(concurrentScrapers=1, urls=urls, proxyEnable=True)
    await manager.concurrentCrawl()

async def testScraperManagerSetup():
    urls = [""]
    manager = scraperManager(concurrentScrapers=1, urls=urls, proxyEnable=True)
    await manager.concurrentCrawl()

async def main():
    # await testScraperManager()
    # await testScraperManagerNoProxy()
    await testScraperManagerSingle()
    # await testScraperManagerSetup()


if __name__ == "__main__":
    asyncio.run(main())