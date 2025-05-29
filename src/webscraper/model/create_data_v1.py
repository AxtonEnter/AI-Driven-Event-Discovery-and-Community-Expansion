from driver import PlaywrightDriver
from scraper import WebScraper
import asyncio
import time
import csv
import re
import os
from webscraper.model.event_keywords import event_keywords
from webscraper.model.url_examples import url_examples

def save_blocks_to_csv(blocks_with_labels, filename='event_&_non_event_data.csv'):
    file_exists = os.path.isfile(filename)
    
    with open(filename, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        
        # Write header only if file is new
        if not file_exists:
            writer.writerow(['text', 'label'])
        
        for block, label in blocks_with_labels:
            writer.writerow([block, label])
    
    print(f"\n Appended {len(blocks_with_labels)} blocks to '{filename}'")

# Create a regex pattern that supports multi-word phrases (case-insensitive)
keyword_pattern = r'(?i)(?:' + '|'.join(re.escape(phrase) for phrase in event_keywords) + r')'

def likely_event(text):
    # Returns True if a block of text looks like an event
    patterns = [
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}',  # e.g., Apr 17
        r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',                                            # e.g., 5/10/2025
        r'\b\d{4}\b',                                                              # year
        r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?',                                     # time
        keyword_pattern                                                           # large keyword list
    ]
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

async def classify_site(start_url, root_url):
    driver = PlaywrightDriver(headless=True)
    await driver.start()
    
    try:
        scraper = WebScraper(driver, root_url, maxPages=25, sleepTime=1)

        visited_pages = await scraper.crawlSite(start_url)
        print(f"\nTotal pages visited: {len(visited_pages)}\n")

        all_blocks = []
        for page_url in visited_pages:
            print(f"\n--- Processing: {page_url} ---\n")
            soup = await scraper.getSoup(page_url)
            if soup is None:
                continue

            text = soup.get_text(separator="\n", strip=True)
            blocks = [b.strip() for b in text.split("\n") if b.strip()]

            grouped_blocks = []
            current_label = None
            current_group = []

            for block in blocks:
                label = "EVENT" if likely_event(block) else "NON-EVENT"
                if label == current_label:
                    current_group.append(block)
                else:
                    if current_group:
                        grouped_blocks.append((" ".join(current_group), current_label))
                    current_label = label
                    current_group = [block]

            if current_group:
                grouped_blocks.append((" ".join(current_group), current_label))

            all_blocks.extend(grouped_blocks)

            for text, label in grouped_blocks:
                print(f"[{label}]\n{text}\n")

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
            await asyncio.sleep(5)  # delay to prevent overloading servers

    asyncio.run(run_all_classifications())