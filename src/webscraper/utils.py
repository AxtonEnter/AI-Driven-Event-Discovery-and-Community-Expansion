import hashlib
import re
from datetime import datetime, timedelta
from urllib.parse import urlparse, urlunparse

# A list of helper functions used in the webscraper

def normalize_url(url):
    parsed = urlparse(url)

    # Remove 'www.' if present
    netloc = parsed.netloc
    if netloc.startswith("www."):
        netloc = netloc[4:]

    # Remove query, fragment, and trailing slash from path
    clean_path = parsed.path.rstrip('/')

    # Reconstruct cleaned URL
    cleaned_url = urlunparse((
        parsed.scheme,
        netloc,
        clean_path,
        '', '', ''  # params, query, fragment
    ))

    return cleaned_url

def hashText(text):
    """Return a string's SHA-256 hash."""
    return hashlib.sha256(text.encode()).hexdigest()

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
    
EVENT_KEYWORDS = [
    'event', 'show', 'concert', 'talk', 'lecture', 'workshop',
    'festival', 'performance', 'screening', 'webinar', 'meetup',
    'opening', 'reading', 'reservation'
]

MONTH_REGEX = r'\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|' \
              r'May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|' \
              r'Sep(?:t)?(?:ember)?|Oct(?:ober)?|' \
              r'Nov(?:ember)?|Dec(?:ember)?)\b'

TIME_REGEX = re.compile(
    r'\b('
    r'([0-2]?[0-9])(:[0-5][0-9])?\s?(AM|PM|am|pm)?'       # 6, 6:00, 6 PM
    r'(\s?[-–to]+\s?'                                     # separator like '-', 'to', '–'
    r'([0-2]?[0-9])(:[0-5][0-9])?\s?(AM|PM|am|pm)?)?'     # 8, 8:00, 8pm
    r')\b',
    re.IGNORECASE
)

DOW_REGEX = r'\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(day)?\b'
NUMERIC_DATE_REGEX = r'\b\d{1,2}[./-]\d{1,2}([./-]\d{2,4})?\b'

def score_event_block(text):
    score = 0
    if re.search(MONTH_REGEX, text, re.I):
        score += 2
    if re.search(NUMERIC_DATE_REGEX, text):
        score += 2
    if re.search(r'\d{4}', text):  # year-only fallback
        score += 1
    if TIME_REGEX.search(text, re.I):
        score += 2
    if any(kw in text.lower() for kw in EVENT_KEYWORDS):
        score += 2
    if re.search(DOW_REGEX, text, re.I):
        score += 1
    return score