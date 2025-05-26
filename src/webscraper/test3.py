from driver import PlaywrightDriver
from scraper import WebScraper
import asyncio
import time
import csv
import re
import os
from collections import Counter
from event_keywords import event_keywords
from url_examples import url_examples
import logging


'''
This is the latest program to use the Webscraper and has the following changes since the last version:
 - confidence based scoring system
 - deduplicating text blocks
 - filtering out short & long blocks from the scraped text
 - extended the metadata for the CSV file; (text, label) + score, source_url, char_len, word_len
 - more labeling for dataset balancing
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
    # Returns label and score based on matched patterns
    patterns = [
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}',  # Apr 17
        r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',                                            # 5/10/2025
        r'\b\d{4}\b',                                                              # year
        r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?',                                     # time
        keyword_pattern                                                            # from event_keywords
    ]
    score = sum(bool(re.search(p, text, re.IGNORECASE)) for p in patterns)
    label = "EVENT" if score >= 2 else "NON-EVENT"
    return label, score

async def classify_site(start_url, root_url):
    # driver = PlaywrightDriver(headless=True) # this is the old line with Playwright only needing 1 parameter
    driver = PlaywrightDriver(headless=True, logger=logger)

    await driver.start()

    try:
        # scraper = WebScraper(driver, root_url, maxPages=25, sleepTime=1) # this is the old line which didn't need a logger parameter
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

            text = soup.get_text(separator="\n", strip=True)
            # The line below is updated from the last version to avoid saving content that is too short or long
            blocks = [b.strip() for b in text.split("\n") if 5 <= len(b.split()) <= 100]

            current_label = None
            current_group = []
            current_score = 0
            grouped_blocks = []

            for block in blocks:
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

            # Print preview
            for text, label, score, _ in grouped_blocks:
                print(f"[{label} | score={score}]\n{text}\n")

        # Print message to see the balance on the dataset
        # logs total number of each label
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
