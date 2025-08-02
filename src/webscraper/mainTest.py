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
    # Org(1, "https://shortsvillereindeer.com/"),
    # Org(2, "https://recordarchive.com/"),
    # Org(3, "https://www.codeninjas.com/tx-san-antonio-stone-oak-1"),
    # Org(4, "https://rgmc.ticketleap.com/"),
    Org(5, "https://www.punsonline.com/"),
    # Org(6, "https://www.pumcny.org/"),
    # Org(7, "https://www.stjohnsliving.org/")
]

# "Indoor Play","Kids Empire Houston Edgebrook","https://www.kidsempire.com/park/edgebrook"
# "Indoor Play","Cidercade Houston","https://www.cidercade.com/houston/","(346) 241-7524"
# INSTEAD DO > https://cidercade.com/houston/
# "Birthday parties","Immersive Gamebox","https://www.immersivegamebox.com/venues/htx-the-highlight-houston-texas"
ChrisOrgs = [
    # Org(11, "https://www.kidsempire.com/park/edgebrook"),
    # Org(12, "https://www.cidercade.com/houston/"),
    Org(13, "https://www.immersivegamebox.com/venues/htx-the-highlight-houston-texas")
]

testUrls = []

try:
    with open("src/webscraper/urls.txt", "r") as f:
        for line in f:
            testUrls.append(line.strip())
except:
    with open("urls.txt", "r") as f:
        for line in f:
            testUrls.append(line.strip())

testUrls = testUrls[20:40]
testOrgs = [Org(i, url) for i, url in enumerate(testUrls, start=1)]

async def testOrgList():
    manager = scraperManager(concurrentScrapers=10, orgs=testOrgs, proxyEnable=True, testMode=False)
    await manager.concurrentCrawl()

async def testScraperManager():
    manager = scraperManager(concurrentScrapers=7, orgs=Orgs, proxyEnable=False, testMode=True)
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

async def ChrisTest():
    manager = scraperManager(concurrentScrapers=3, orgs=ChrisOrgs, proxyEnable=True, testMode=True)
    await manager.concurrentCrawl()

async def main():
    await testScraperManager()
    # await testScraperManagerNoProxy()
    # await testScraperManagerSingle()
    # await ChrisTest()
    # await testOrgList()
    # await testScraperManagerSetup()
    # await multiEventPageTest()


if __name__ == "__main__":
    asyncio.run(main())