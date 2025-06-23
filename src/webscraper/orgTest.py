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


async def testScraperOrg():
    urls = ["https://www.punsonline.com/"]
    manager = scraperManager(concurrentScrapers=1, urls=urls, proxyEnable=True, orgScraper=True)
    await manager.concurrentOrgCrawl()

async def main():
    await testScraperOrg()


if __name__ == "__main__":
    asyncio.run(main())