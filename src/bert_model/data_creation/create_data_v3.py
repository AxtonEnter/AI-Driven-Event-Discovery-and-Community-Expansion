from driver import PlaywrightDriver
from scraper import WebScraper
import asyncio
import csv
import re
import os
from collections import Counter
from event_keywords import event_keywords
from url_examples import url_examples
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
            writer.writerow(['text', 'label', 'score', 'source_url', 'char_len', 'word_len'])

        for block, label, score, url in blocks_with_labels:
            writer.writerow([block, label, score, url, len(block), len(block.split())])

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

def is_non_event_page(url, soup):
    url = url.lower()

    # Page URL contains clear non-event keywords
    if any(kw in url for kw in [
        "/about", "/mission", "/team", "/contact", "/donate", "/history", "/press", "/faq"
    ]):
        return True

    # Page title contains non-event clues
    title_tag = soup.find("title")
    if title_tag and any(kw in title_tag.get_text(strip=True).lower() for kw in [
        "about", "contact", "our team", "mission", "history", "support"
    ]):
        return True

    return False

def is_navigation_block(block):
    # Too many colons or menu mentions often indicates footer/menu
    if block.count(":") > 5 or block.lower().count("menu") > 2:
        return True
    # Too many repeated words
    words = block.split()
    if len(words) == 0:
        return False
    unique_words = set(words)
    repetition_ratio = len(unique_words) / len(words)
    if repetition_ratio < 0.5:
        return True
    # Long sequences of short words (like links or headers)
    short_word_ratio = sum(len(w) <= 3 for w in words) / len(words)
    if short_word_ratio > 0.6:
        return True
    return False

async def classify_site(start_url, root_url):
    driver = PlaywrightDriver(headless=True, logger=logger)
    await driver.start()

    try:
        scraper = WebScraper(driver, root_url, logger=logger, maxPages=25, sleepTime=1)
        visited_pages = await scraper.crawlSite(start_url)
        print(f"\nTotal pages visited: {len(visited_pages)}\n")

        all_blocks = []
        seen_blocks = set()

        for page_url in visited_pages:
            print(f"\n--- Processing: {page_url} ---\n")
            soup = await scraper.getSoup(page_url)
            if soup is None:
                continue
            # Label everything NON-EVENT if it's a known non-event page
            if is_non_event_page(page_url, soup):
                print("Skipping as NON-EVENT page due to URL or title...")
                blocks = [b.strip() for b in soup.get_text(separator="\n").split("\n") if 5 <= len(b.split()) <= 100]
                for block in blocks:
                    if block not in seen_blocks and not is_navigation_block(block):
                        seen_blocks.add(block)
                        all_blocks.append((block, "NON-EVENT", 0, page_url))
                continue
            
            event_blocks, full_text = await scraper.extractStructuredEventBlocks(soup)

            grouped_blocks = []

            # Add event blocks from structured containers
            for block in event_blocks:
                if block in seen_blocks:
                    continue
                seen_blocks.add(block)
                score = sum(bool(re.search(p, block, re.IGNORECASE)) for p in [
                    r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}',
                    r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',
                    r'\b\d{4}\b',
                    r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?',
                    keyword_pattern
                ])
                grouped_blocks.append((block, "EVENT", score, page_url))

            # Fallback: label raw full text blocks (NON-EVENT or EVENT)
            fallback_blocks = [
                b.strip() for b in full_text.split("\n")
                if 5 <= len(b.split()) <= 100 and not is_navigation_block(b.strip())
            ]
            current_label = None
            current_group = []
            current_score = 0

            for block in fallback_blocks:
                if block in seen_blocks:
                    continue
                seen_blocks.add(block)

                label, score = label_block_with_score(block)
                if label == current_label:
                    current_group.append(block)
                else:
                    if current_group:
                        grouped_text = " ".join(current_group)
                        grouped_blocks.append((grouped_text, current_label, current_score, page_url))
                    current_label = label
                    current_score = score
                    current_group = [block]

            if current_group:
                grouped_text = " ".join(current_group)
                grouped_blocks.append((grouped_text, current_label, current_score, page_url))

            all_blocks.extend(grouped_blocks)

            for text, label, score, _ in grouped_blocks:
                print(f"[{label} | score={score}]\n{text}\n")

        label_counts = Counter(label for _, label, _, _ in all_blocks)
        print("\nLabel distribution:", dict(label_counts))
        save_blocks_to_csv(all_blocks)

    finally:
        await driver.close()

if __name__ == "__main__":
    async def run_all_classifications():
        for i, url in enumerate(url_examples):
            print(f"\n=== Processing site {i+1}/{len(url_examples)}: {url} ===\n")
            try:
                await classify_site(url, url)
            except Exception as e:
                print(f"Error processing {url}: {e}")
            await asyncio.sleep(5) # delay between sites

    asyncio.run(run_all_classifications())