import hashlib

# A list of helper functions used in the webscraper

def hashText(text):
    """Return a strings SHA-256 hash."""
    return hashlib.sha256(text.encode()).hexdigest()

def getHash(url):
    """Returns the hash of the text for a given url stored in the database, returns False if url not previously hashed"""
    # Stored in database
    return False



