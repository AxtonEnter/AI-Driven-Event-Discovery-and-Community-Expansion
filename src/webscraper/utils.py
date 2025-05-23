import hashlib
import re
from datetime import datetime, timedelta

# A list of helper functions used in the webscraper

def hashText(text):
    """Return a string's SHA-256 hash."""
    return hashlib.sha256(text.encode()).hexdigest()

def getHash(url):
    """Returns the hash of the text for a given url stored in the database, returns False if url not previously hashed"""
    # Stored in database
    return False

def stringDateCheck(str):
    """
    Find all dates in a string
    Sep: - / .
    """
    datePattern = re.compile(r'\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2})\b')
    dates = datePattern.findall(str)
    return dates

def isPastDate(dateString):
    """Checks if the given date is in the past."""
    try:
        # Determine the correct format
        if re.match(r'^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$', dateString):    # YYYY-MM-DD
            date_obj = datetime.strptime(dateString, "%Y-%m-%d")
        elif re.match(r'^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$', dateString):  # MM-DD-YYYY
            date_obj = datetime.strptime(dateString, "%m-%d-%Y")
        elif re.match(r'^\d{1,2}[-/.]\d{1,2}[-/.]\d{2}$', dateString):  # MM-DD-YY
            date_obj = datetime.strptime(dateString, "%m-%d-%y")
        else:
            return None  # Unknown format

        # check if the date is within the next year (and not in the past)
        today = datetime.today().date()
        oneYear = today + timedelta(days=365)
        if today < date_obj.date() < oneYear:
            return date_obj
        return None
    
    except ValueError:
        return None  # Invalid date (e.g., February 30)



