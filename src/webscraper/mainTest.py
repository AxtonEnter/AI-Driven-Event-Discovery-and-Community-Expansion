from scraperManager import scraperManager
import asyncio
from org import Org

URLs = [
    "https://shortsvillereindeer.com/",
    "https://recordarchive.com/",
    "https://www.codeninjas.com/tx-san-antonio-stone-oak-1",
    "https://rgmc.ticketleap.com/",
    "https://www.punsonline.com/",
    "https://www.pumcny.org/",
    "https://www.stjohnsliving.org/"]

Orgs = [
    Org(1, "https://shortsvillereindeer.com/"),
    Org(2, "https://recordarchive.com/"),
    Org(3, "https://www.codeninjas.com/tx-san-antonio-stone-oak-1"),
    Org(4, "https://rgmc.ticketleap.com/"),
    Org(5, "https://www.punsonline.com/"),
    Org(6, "https://www.pumcny.org/"),
    Org(7, "https://www.stjohnsliving.org/")
]

async def testScraperManager():
    manager = scraperManager(concurrentScrapers=7, orgs=Orgs, proxyEnable=True)
    await manager.concurrentCrawl()

async def testScraperManagerNoProxy():
    manager = scraperManager(concurrentScrapers=7, orgs=Orgs, proxyEnable=False)
    await manager.concurrentCrawl()

async def testScraperManagerSingle():
    org = Org(5, "https://www.punsonline.com/")
    manager = scraperManager(concurrentScrapers=1, orgs=[org], proxyEnable=True)
    await manager.concurrentCrawl()

async def testScraperManagerSetup():
    org = Org(1, "https://shortsvillereindeer.com/")
    manager = scraperManager(concurrentScrapers=1, orgs=[org], proxyEnable=True)
    await manager.concurrentCrawl()

async def multiEventPageTest():
    org = Org(2, "https://recordarchive.com/events-calendar/")
    manager = scraperManager(concurrentScrapers=1, orgs=[org], proxyEnable=True)
    await manager.concurrentCrawlMulti()

async def main():
    await testScraperManager()
    # await testScraperManagerNoProxy()
    # await testScraperManagerSingle()
    # await testScraperManagerSetup()
    # await multiEventPageTest()


if __name__ == "__main__":
    asyncio.run(main())