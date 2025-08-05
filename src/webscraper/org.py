import utils

class Org:
    def __init__(self, id: int, url: str, eventurl: str = None):
        self.id = id
        self.url = url
        self.finalUrl = None
        self.governmentSite = False
        self.normalizedUrl = utils.normalize_url(url)
        self.normalizedFinalUrl = None
        self.eventurl = eventurl

    def setFinalUrl(self, finalUrl: str):
        self.finalUrl = finalUrl
        self.normalizedFinalUrl = utils.normalize_url(finalUrl)

    def __repr__(self):
        return f"Org(id={self.id}, url='{self.url}', eventurl='{self.eventurl}')"