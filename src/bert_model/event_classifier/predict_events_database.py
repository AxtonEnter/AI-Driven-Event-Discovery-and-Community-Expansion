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
QUEUE_URL = ""

# Initialize SQS client
sqs = boto3.client("sqs", region_name="us-east-1")

# Setup database connection constants
DB_HOST = "test-database-jdb.c8v60oyuezl3.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "username123"
DB_PASSWORD = "password123"
DB_PORT = 5432

def insert_prediction(url, title, html, text_block, status, org_id):
    """Insert a classified text block into the RDS PostgreSQL 'events' table."""
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
                organization
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """

        now = datetime.now()
        cur.execute(insert_query, (
            url,
            title,
            html,
            text_block,
            now,          # addedat
            now,          # statuschangedat
            status,       # 1 = event, 0 = non-event
            None,         # rejectedreason
            org_id
        ))

        conn.commit()
        cur.close()
        conn.close()
        print("Block inserted into 'events' table.")

    except Exception as e:
        print("Failed to insert into database:", e)
        
def receive_sqs_message():
    try:
        response = sqs.receive_message(
            QueueUrl=QUEUE_URL,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=5  # enables long-polling
        )
        messages = response.get("Messages", [])
        if messages:
            msg = messages[0]
            print("\nReceived SQS message:")
            print("Message ID:", msg["MessageId"])
            print("Body:", msg["Body"])
            return msg
        else:
            print("No new SQS messages.\n")
    except Exception as e:
        print("Failed to receive message from SQS:", e)
    return None


# Use built-in preset name (must be cached once before EC2 goes offline)
preprocessor = BertPreprocessor.from_preset("bert_tiny_en_uncased")

model = BertClassifier.from_preset(
    "bert_tiny_en_uncased",
    num_classes=2,
    preprocessor=preprocessor
)

# Load trained weights
model.load_weights("saved_bert_model_weights").expect_partial()

while True:
    """
    insert_prediction(
        url="https://www.kidsoutandabout.com/",
        title="kidsandabout",
        html="<div><h1>Test Header</h1><p>Test paragraph</p>",
        text_block="test block",
        status=0,
        org_id=17
    )
    """
    
    total_messages += 1
    message_start_time = time.time()
    
    user_input = input("Paste your text block:\n")
    
    input_batch = [user_input]
    model_prediction_time = time.time()

    if user_input.strip().lower() == "quit":
        print("Exiting...")
        break

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

    accuracy = correct_predictions / total_messages
    """
    # Tracking accuracy & performance time above
    """

    print("================ Prediction Result =====================================================================")
    print(f"Predicted Label: {label_str}")
    print(f"Confidence: {confidence:.2f}")
    print(f"Total Processing Time: {message_duration:.3f} sec")
    print(f"Model Prediction Processing Time: {prediction_duration:.3f} sec")
    print(f"Running Accuracy (Simulated): {accuracy:.2%} ({correct_predictions}/{total_messages})")
    if event_confidences:
        print(f"Avg EVENT Confidence: {np.mean(event_confidences):.2f}")
    if non_event_confidences:
        print(f"Avg NON-EVENT Confidence: {np.mean(non_event_confidences):.2f}")
    print(f"Avg Processing Time: {np.mean(processing_times):.3f} sec/message")

    # Simulate true label for demonstration purposes
    true_labels = [1]  # You can change this to 0 or fetch real labels during evaluation

    if pred_label == 1:
        print("\n**** Majority of blocks are EVENT-RELATED. SENDING full text block to database... ***")
    else:
        print("\n****No strong event-related presence detected. Full text block not returned.****")
    print("================ End of Prediction Summary =============================================================\n")
        
    print("\n--- Waiting for next input ---\n")