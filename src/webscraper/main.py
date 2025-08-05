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
SCRAPE_REQUEST_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/563583517916/scrape-requests"

DB_HOST = "test-db-prod.cqvw2k0sgq1i.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "username123"
DB_PASSWORD = "password123"
DB_PORT = 5432

# Create SQS client
sqs = boto3.client("sqs")

async def receive_messages():
    """Poll messages from SQS (forwarded from SNS)."""
    try:
        response = sqs.receive_message(
            QueueUrl=SCRAPE_REQUEST_QUEUE_URL,
            MaxNumberOfMessages=5,
            WaitTimeSeconds=10  # Enable long polling
        )
        messages = response.get("Messages", [])
        for message in messages:
            await delete_message(message["ReceiptHandle"])
            await process_message(message)
    except ClientError as e:
        logger.error(f"Error receiving messages: {e}")
        return []


async def delete_message(receipt_handle):
    """Delete message from queue after processing."""
    try:
        sqs.delete_message(QueueUrl=SCRAPE_REQUEST_QUEUE_URL, ReceiptHandle=receipt_handle)
    except ClientError as e:
        logger.error(f"Failed to delete message: {e}")


async def process_message(message):
    """Parse message body and start scraping."""
    try:
        messageId = message['MessageId']
        logger.info(f"Processing message ID: {messageId}")
        body = json.loads(message['Body'])

        orgIds = body.get("orgs", [])
        userId = body.get("user", [])

        logger.info(f"User: {userId} requested orgs: {orgIds}")
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

        validOrgs = list[Org]()
        invalidOrgIds = []

        for orgId in orgIds:
            if orgId.isdigit():
                orgId = int(orgId)
                cur.execute("SELECT * FROM organizations WHERE id = %s;", (orgId,))
                org = cur.fetchone()
                if org:
                    validOrgs.append(Org(org[0], org[4]))
                else:
                    invalidOrgIds.append(orgId)
        # print(f"Valid Orgs: {validOrgs}")
        print(f"Invalid Orgs: {invalidOrgIds}")
        print(f"User ID: {userId}")

        # Initialize and run scraper manager
        manager = scraperManager(concurrentScrapers=5, orgs=validOrgs, userId=userId, proxyEnable=True)
        await manager.concurrentCrawl()

    except Exception as e:
        logger.error(f"Error processing message: {e}")


async def main_loop():
    """Continuously poll and process messages without blocking on processing."""
    import datetime
    while True:
        currenttime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print("Polling for messages..." + currenttime)
        
        messages = await receive_messages()
        if messages:
            for msg in messages:
                asyncio.create_task(process_message(msg))
        
        await asyncio.sleep(10)



if __name__ == "__main__":
    asyncio.run(main_loop())
