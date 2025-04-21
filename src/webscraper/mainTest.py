from scraperManager import scraperManager
import asyncio

URLs = [
    "https://shortsvillereindeer.com/",
    "https://recordarchive.com/",
    "https://www.codeninjas.com/tx-san-antonio-stone-oak-1",
    "https://rgmc.ticketleap.com/",
    "https://www.punsonline.com/",
    "http://www.roccitybottoms.org/",
    "https://www.pumcny.org/",
    "https://www.stjohnsliving.org/"]


async def testScraperManager():
    manager = scraperManager(concurrentScrapers=5, urls=URLs)
    await manager.concurrentCrawl()



async def main():
    await testScraperManager()


if __name__ == "__main__":
    asyncio.run(main())