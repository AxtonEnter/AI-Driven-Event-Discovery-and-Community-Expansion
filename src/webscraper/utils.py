import hashlib
import re
from datetime import datetime

# A list of helper functions used in the webscraper

def hashText(text):
    """Return a string's SHA-256 hash."""
    return hashlib.sha256(text.encode()).hexdigest()

def getHash(url):
    """Returns the hash of the text for a given url stored in the database, returns False if url not previously hashed"""
    # Stored in database
    return False

def urlDateCheck(url):
    """Find date formats in a url (or any string)"""
    datePattern = re.compile(r'\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\b')
    dates = datePattern.findall(url)
    return dates

def isPastDate(dateString):
    """Checks if the given date is in the past."""
    try:
        # Determine the correct format
        if re.match(r'^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$', dateString):  # YYYY-MM-DD or YYYY/M/D
            date_obj = datetime.strptime(dateString, "%Y-%m-%d")
        elif re.match(r'^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$', dateString):  # MM-DD-YYYY or M/D/YYYY
            date_obj = datetime.strptime(dateString, "%m-%d-%Y")
        else:
            return None  # Unknown format

        # Compare with today's date
        return date_obj.date() < datetime.today().date()
    except ValueError:
        return None  # Invalid date (e.g., February 30)



