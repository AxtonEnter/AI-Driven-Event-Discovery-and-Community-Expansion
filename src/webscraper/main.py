import boto3
import psycopg2
import asyncio
import json
import logging
from botocore.exceptions import ClientError
from scraperManager import scraperManager
from org import Org

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SNS-Scraper")

# Scrape Request SQS Queue URL
SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/522167229147/scrape-request"

DB_HOST = "test-database-jdb.c8v60oyuezl3.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "username123"
DB_PASSWORD = "password123"
DB_PORT = 5432

# Create SQS client
sqs = boto3.client("sqs")


def receive_messages():
    """Poll messages from SQS (forwarded from SNS)."""
    try:
        response = sqs.receive_message(
            QueueUrl=SQS_QUEUE_URL,
            MaxNumberOfMessages=10,
            WaitTimeSeconds=10  # Enable long polling
        )
        return response.get("Messages", [])
    except ClientError as e:
        logger.error(f"Error receiving messages: {e}")
        return []


def delete_message(receipt_handle):
    """Delete message from queue after processing."""
    try:
        sqs.delete_message(QueueUrl=SQS_QUEUE_URL, ReceiptHandle=receipt_handle)
    except ClientError as e:
        logger.error(f"Failed to delete message: {e}")


async def process_message(message):
    """Parse message body and start scraping."""
    try:
        body = json.loads(message["Body"])

        # SNS wraps the actual message in another envelope
        sns_message = json.loads(body["Message"])
        orgIds = sns_message.get("ids", []) if isinstance(sns_message, dict) else sns_message

        logger.info(f"Received {len(orgIds)} URLs: {orgIds}")

        # Database Link
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        cur = conn.cursor()
        cur.execute("SELECT version();")
        logger.info(f"DB Connection: {cur.fetchone()}")

        orgs = list[Org]()

        for orgId in orgIds:
            # Fetch URL from database
            sql = "SELECT url, event_url FROM organizations WHERE id=%s"
            cur.execute(sql, (orgId,))
            result = cur.fetchone()
            if result:
                url = result[0]
                eventurl = result[1]
                logger.info(f"Processing URL: {url}")
                orgs.append(Org(id=orgId, url=url, eventurl=eventurl))
            else:
                logger.warning(f"No org found for orgId: {orgId}")
                continue

        # Initialize and run scraper manager
        manager = scraperManager(concurrentScrapers=5, orgs=orgs)
        await manager.concurrentCrawl()

    except Exception as e:
        logger.error(f"Error processing message: {e}")
    else:
        delete_message(message["ReceiptHandle"])


async def main_loop():
    """Continuously poll and process messages."""
    while True:
        messages = receive_messages()
        if messages:
            await asyncio.gather(*(process_message(msg) for msg in messages))
        else:
            await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(main_loop())
