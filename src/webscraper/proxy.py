class OxylabsProxy:
    def __init__(self, username: str, password: str, ips: int):
        self.server = "isp.oxylabs.io"
        self.username = username
        self.password = password
        self.currentPort = 8001
        self.maxPort = (8001 + ips - 1)

        self.ipCheck = "https://ip.oxylabs.io/location" # The url to check proxy's IP

    def getServer(self):
        return self.server
    
    def getUsername(self):
        return self.username
    
    def getPassword(self):
        return self.password

    def getIPCheckURL(self):
        return self.ipCheck

    def getCurrentPort(self):
        return self.currentPort

    def nextPort(self):
        """Moves proxy to the next port (IP)"""
        if self.currentPort == self.maxPort:
            self.currentPort = 8001
        else:
            self.currentPort += 1
        return self.currentPort
    