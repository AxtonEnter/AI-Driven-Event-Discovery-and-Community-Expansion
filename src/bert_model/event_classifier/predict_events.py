import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # 0 = all logs, 1 = warnings, 2 = errors, 3 = fatal

from keras_nlp.models import BertPreprocessor, BertClassifier
from urllib.parse import urlparse
from datetime import datetime
from bs4 import BeautifulSoup
import tensorflow as tf
import numpy as np
import psycopg2
import boto3
import json
import time
import zlib
import base64

# For count of each labeled text
event_count = 0
non_event_count = 0

# Track overall metrics
total_messages = 0
correct_predictions = 0
start_total_time = time.time()

# For average confidence tracking
event_confidences = []
non_event_confidences = []

# For average processing time
processing_times = []

# For throughput tracking
messages_this_minute = []
current_minute = int(time.time() // 60)

# Replace with queue URL
QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/563583517916/page-data"

# Initialize SQS client
sqs = boto3.client("sqs", region_name="us-east-1")

# Setup database connection constants
DB_HOST = "test-database-jdb.c8v60oyuezl3.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "username123"
DB_PASSWORD = "password123"
DB_PORT = 5432

def receive_sqs_message():
    try:
        response = sqs.receive_message(
            QueueUrl=QUEUE_URL,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=1
        )
        messages = response.get("Messages", [])
        if messages:
            msg = messages[0]
            receipt_handle = msg["ReceiptHandle"] # commented out to delete message from SNS queue
            body = msg["Body"]

            try:
                # Step 1: base64 decode
                compressed_bytes = base64.b64decode(body)

                # Step 2: zlib decompress
                decompressed_json = zlib.decompress(compressed_bytes).decode("utf-8")

                # Step 3: parse JSON
                payload = json.loads(decompressed_json)
                print("Successfully decompressed and parsed SQS message.")

            except Exception as e:
                print("Failed to decode, decompress, or parse message:", e)
                return None

            # Show full payload
            #print("\nFull decompressed payload:")
            #print(json.dumps(payload, indent=2))  # nicely formatted JSON

            # Extract expected keys
            user_id = payload.get("userId")
            org_id = payload.get("orgId")
            url = payload.get("url")
            html = payload.get("html")
            images = payload.get("imageUrls", [])

            if None in (user_id, org_id, url, html, images):
                print("Missing one or more required fields.")
                return None

            print(f"\nExtracted Payload:\n- userId: {user_id}\n- orgId: {org_id}\n- url: {url}\n- html: {html[:100]}...\n- imageUrls: {images[:5]}\n")

            return {
                "userId": user_id,
                "orgId": org_id,
                "url": url,
                "html": html,
                "imageUrls": images,
                "sqs_message": msg,
                "receipt_handle": receipt_handle
            }

        else:
            print("No new SQS messages.\n")
    except Exception as e:
        print("Failed to receive message from SQS:", e)

    return None

def extract_domain_as_title(url):
    try:
         # Extract domain and strip 'www.' and '.com'
        parsed_url = urlparse(url)
        netloc = parsed_url.netloc.lower()

        # Remove 'www.' prefix if present
        if netloc.startswith("www."):
            netloc = netloc[4:]

        # Remove '.com', '.org', '.net', etc.
        domain_base = netloc.split('.')[0]
        return domain_base
    except Exception:
        return None

def insert_event_to_db(org_id, url, text, html, user_id, images):
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        cur = conn.cursor()

        insert_query = """
            INSERT INTO events (
                url,
                title,
                html,
                text,
                addedat,
                statuschangedat,
                status,
                rejectedreason,
                "user",
                organization,
                image_list
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """

        now = datetime.now()
        title = extract_domain_as_title(url)

        cur.execute(insert_query, (
            url,            # url from SQS
            title,          # title
            html,           # html
            text,           # classified content
            now,            # addedat
            now,            # statuschangedat
            0,              # status = 1 (event-related)
            None,           # rejectedreason
            user_id,        # user
            org_id,         # from SQS
            images          # image list
        ))

        conn.commit()
        cur.close()
        conn.close()

        print("**** INSERTED event into PostgreSQL 'events' table ****\n")

    except Exception as e:
        print("**** Failed to insert into database: ", e, " ****")

# Use built-in preset name (must be cached once before EC2 goes offline)
preprocessor = BertPreprocessor.from_preset("bert_tiny_en_uncased")

model = BertClassifier.from_preset(
    "bert_tiny_en_uncased",
    num_classes=2,
    preprocessor=preprocessor
)

# Load trained weights
model.load_weights("saved_bert_model_weights").expect_partial()

def extract_visible_text_from_html(html):
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(separator=" ", strip=True)
    return text

while True:
    print("\n--- Checking SQS for new SNS messages... ---")
    sqs_msg = receive_sqs_message()

    if not sqs_msg:
        continue  # Wait for new message in next loop
    
    total_messages += 1
    message_start_time = time.time()

    # HTML -> visible text
    html_input = sqs_msg["html"]
    text_input = extract_visible_text_from_html(html_input)
    
    print("\nRunning MODEL PREDICTION on received text...\n")

    # Wrap single paragraph as a list to make it batch-friendly
    input_batch = [text_input]
    model_prediction_time = time.time()

    # Prediction
    logits = model.predict(input_batch, verbose=0)
    probs = tf.nn.softmax(logits, axis=-1).numpy()
    predictions = np.argmax(probs, axis=-1)

    pred_label = predictions[0]
    confidence = probs[0][pred_label]
    label_str = "EVENT" if pred_label == 1 else "NON-EVENT"

    """
    # Tracking accuracy & performance time below
    """
    # Track timing
    message_duration = time.time() - message_start_time
    prediction_duration = time.time() - model_prediction_time
    
    # Track confidence based on label
    if pred_label == 1:
        event_confidences.append(confidence)
    else:
        non_event_confidences.append(confidence)

    # Track processing time
    processing_times.append(message_duration)

    # Track throughput
    now_minute = int(time.time() // 60)
    if now_minute != current_minute:
        print(f"Throughput: {len(messages_this_minute)} messages processed in the last minute")
        messages_this_minute.clear()
        current_minute = now_minute
    messages_this_minute.append(1)

    # Simulate ground truth label (until real evaluation set is integrated)
    true_label = 1
    true_labels = [true_label]

    # Accuracy tracking
    if pred_label == true_label:
        correct_predictions += 1
        
    if pred_label == 1:
        event_count += 1
    else:
        non_event_count += 1

    accuracy = correct_predictions / total_messages
    """
    # Tracking accuracy & performance time above
    """

    print("================ Prediction Result =====================================================================")
    print(f"Predicted Label: {label_str}")
    print(f"Confidence: {confidence:.2f}")
    print(f"Total Processing Time: {message_duration:.3f} sec")
    print(f"Model Prediction Processing Time: {prediction_duration:.3f} sec")
    if event_confidences:
        print(f"Avg EVENT Confidence: {np.mean(event_confidences):.2f}")
    if non_event_confidences:
        print(f"Avg NON-EVENT Confidence: {np.mean(non_event_confidences):.2f}")
    print(f"Avg Processing Time: {np.mean(processing_times):.3f} sec/message")
    print(f"Classified EVENT count: {event_count}")
    print(f"Classified NON-EVENT count: {non_event_count}")
    print(f"EVENT % out of total: {(event_count / total_messages * 100):.2f}%")
    print(f"Running Accuracy (Simulated): {accuracy:.2%} ({correct_predictions}/{total_messages})")

    # Simulate true label for demonstration purposes
    true_labels = [1]  # You can change this to 0 or fetch real labels during evaluation

    if pred_label == 1:
        print("\n**** Majority of blocks are EVENT-RELATED. SENDING full text block to database... ***")
        insert_event_to_db(
            user_id=sqs_msg["userId"],
            org_id=sqs_msg["orgId"],
            url=sqs_msg["url"],
            text=text_input,
            html=html_input,
            images=sqs_msg["imageUrls"]
        )
    else:
        print("\n****No strong event-related presence detected. Full text block not returned.****")
        
    # Delete message from SQS after processing
    # uncomment below to delete the messages from the SNS queue that have already been processed
    
    try:
        sqs.delete_message(
            QueueUrl=QUEUE_URL,
            ReceiptHandle=sqs_msg["receipt_handle"]
        )
        print("Deleted processed message from SQS.\n")
    except Exception as e:
        print(f"Failed to delete message from SQS: {e}")
    
    print("================ End of Prediction Summary =============================================================\n")
    print("\n--- Waiting for next SQS message... ---")