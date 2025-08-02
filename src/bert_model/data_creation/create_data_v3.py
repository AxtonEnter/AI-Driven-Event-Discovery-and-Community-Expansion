from driver import PlaywrightDriver
from scraper import WebScraper
import asyncio
import csv
import re
import os
from collections import Counter
from event_keywords import event_keywords
import logging


'''
This is the latest program to use the Webscraper and has the following changes since the last version:
 - Updated the classify_site method to make full use of the new method from scraper.py
'''

# Create and configure logger
logger = logging.getLogger("event_scraper")

logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s — %(levelname)s — %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

def save_blocks_to_csv(blocks_with_labels, filename='event_&_non_event_data.csv'):
    file_exists = os.path.isfile(filename)

    with open(filename, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)

        # Write header only if file is new
        # added more metadata
        if not file_exists:
            writer.writerow(['text', 'label', 'source_url', 'char_len', 'word_len'])

        for block, label, url in blocks_with_labels:
            writer.writerow([block, label, url, len(block), len(block.split())])

    print(f"\nAppended {len(blocks_with_labels)} blocks to '{filename}'")

# Create a regex pattern that supports multi-word phrases (case-insensitive)
keyword_pattern = r'(?i)(?:' + '|'.join(re.escape(phrase) for phrase in event_keywords) + r')'

def label_block_with_score(text):
    # Define patterns
    date_patterns = [
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}',  # Apr 17
        r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',                                            # 5/10/2025
        r'\b\d{4}\b'                                                               # year
    ]
    time_patterns = [r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?']                        # time
    keyword_pattern = r'(?i)(?:' + '|'.join(re.escape(phrase) for phrase in event_keywords) + r')'

    # Check presence
    date_score = sum(bool(re.search(p, text)) for p in date_patterns)
    time_score = sum(bool(re.search(p, text)) for p in time_patterns)
    keyword_score = bool(re.search(keyword_pattern, text, re.IGNORECASE))

    # Enhanced rule: must contain keyword AND (date or time)
    if keyword_score and (date_score > 0 or time_score > 0):
        score = date_score + time_score + 1  # +1 for keyword match
        label = "EVENT"
    else:
        score = date_score + time_score + (1 if keyword_score else 0)
        label = "NON-EVENT"

    return label, score

def is_event_rich_page(text):
    """
    Detects if text has multiple event-like structures (e.g., title + date + location).
    """
    lines = text.splitlines()
    event_like_count = 0
    date_pattern = re.compile(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}', re.IGNORECASE)
    location_keywords = [' at ', ' in ', ' hosted by ', ' location:', 'venue']
    
    for i in range(len(lines)):
        line = lines[i].strip()
        if not line:
            continue
        has_date = bool(date_pattern.search(line))
        has_location = any(keyword in line.lower() for keyword in location_keywords)
        if has_date and has_location:
            event_like_count += 1
        if event_like_count >= 3:
            return True
    return False

def is_event_single_detail_page(text):
    """
    Detects if the page appears to describe one event with CTA phrases and a date.
    """
    cta_phrases = ['rsvp', 'join us', 'register now', 'sign up', 'more info']
    date_pattern = re.compile(r'\b\d{1,2}/\d{1,2}/\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}', re.IGNORECASE)
    text_lower = text.lower()
    
    return any(phrase in text_lower for phrase in cta_phrases) and bool(date_pattern.search(text))

async def classify_site(start_url, root_url, max_samples_per_label=10000):
    driver = PlaywrightDriver(headless=True, logger=logger)
    await driver.start()

    try:
        scraper = WebScraper(driver, root_url, logger=logger, maxPages=50, sleepTime=1)
        visited_pages = await scraper.crawlSite(start_url)
        print(f"\nTotal pages visited: {len(visited_pages)}\n")

        seen_blocks = set()
        labeled_blocks = []

        event_count = 0
        non_event_count = 0

        for page_url in visited_pages:
            if event_count >= max_samples_per_label and non_event_count >= max_samples_per_label:
                break

            print(f"\n--- Processing: {page_url} ---\n")
            soup = await scraper.getSoup(page_url)
            if soup is None:
                continue

            full_text = await scraper.soupToText(soup)
            full_text = full_text.strip()
            if not full_text or full_text in seen_blocks or len(full_text.split()) < 30:
                continue
            seen_blocks.add(full_text)

            # Classify as EVENT
            if event_count < max_samples_per_label and (
                await scraper.extractEventPageTextFromUrl(page_url, soup)
            ):
                labeled_blocks.append((full_text, "EVENT", page_url))
                event_count += 1
                print(f"[EVENT]\n{full_text[:300]}...\n")
                continue

            # Classify as NON-EVENT
            if non_event_count < max_samples_per_label and (
                await scraper.extractNonEventPageTextFromUrl(page_url, soup)
                ):
                labeled_blocks.append((full_text, "NON-EVENT", page_url))
                non_event_count += 1
                print(f"[NON-EVENT]\n{full_text[:300]}...\n")
                continue

        print(f"\nTotal collected — EVENT: {event_count}, NON-EVENT: {non_event_count}")
        save_blocks_to_csv(labeled_blocks)

    finally:
        await driver.close()

def load_urls_from_csv(filename):
    urls = []
    try:
        with open(filename, newline='', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                if row and row[0].startswith("http"):
                    urls.append(row[0].strip())
    except FileNotFoundError:
        print(f"CSV file '{filename}' not found.")
    return urls

if __name__ == "__main__":
    async def run_all_classifications():
        url_list = load_urls_from_csv("url_examples.csv")
        for i, url in enumerate(url_list):
            print(f"\n=== Processing site {i+1}/{len(url_list)}: {url} ===\n")
            try:
                await classify_site(url, url)
            except Exception as e:
                print(f"Error processing {url}: {e}")
            await asyncio.sleep(2) # delay between sites

    asyncio.run(run_all_classifications())