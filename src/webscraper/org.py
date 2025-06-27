class Org:
    def __init__(self, id: int, url: str, eventurl: str = None):
        self.id = id
        self.url = url
        self.eventurl = eventurl

    def __repr__(self):
        return f"Org(id={self.id}, url='{self.url}', eventurl='{self.eventurl}')"