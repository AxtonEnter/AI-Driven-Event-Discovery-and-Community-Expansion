import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # 0 = all logs, 1 = warnings, 2 = errors, 3 = fatal

from keras_nlp.models import BertPreprocessor, BertClassifier
import tensorflow as tf
import keras_nlp
import psycopg2
import numpy as np
import boto3


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


from datetime import datetime

def insert_prediction(url, title, html, text_block, status, user, org_id):
    """Insert a classified text block into the RDS PostgreSQL table."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        cur = conn.cursor()

        insert_prediction(
            url="https://example.com",
            title="Example Title",
            html="<html>...</html>",
            text_block=block,
            status=status,
            user="system_classifier",
            org_id=1
        )

        now = datetime()
        cur.execute(insert_prediction, (
            url,
            title,
            html,
            text_block,
            now,          # addedat
            now,          # statuschangedat
            status,       # 1 = event, 0 = non-event, for example
            None,         # rejectedreason
            user,
            org_id
        ))

        conn.commit()
        cur.close()
        conn.close()
        print("Block inserted into database.")

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

def split_into_blocks(text):
    """Split input text into blocks using paragraph-like breaks."""
    blocks = [b.strip() for b in text.split('\n') if b.strip()]
    return blocks

while True:
    user_input = input("Paste your text block:\n")

    if user_input.strip().lower() == "quit":
        print("Exiting...")
        break

    blocks = split_into_blocks(user_input)

    if not blocks:
        print("No valid text blocks detected.\n")
        continue

    # Predict with model
    logits = model.predict(blocks, verbose=0)
    probs = tf.nn.softmax(logits, axis=-1).numpy()
    predictions = np.argmax(probs, axis=-1)

    event_count = np.sum(predictions == 1)
    non_event_count = np.sum(predictions == 0)

    print("\n================ Prediction Summary ================")
    print(f"Total blocks: {len(blocks)}")
    print(f"EVENT blocks: {event_count}")
    print(f"NON-EVENT blocks: {non_event_count}")
    event_ratio = event_count / (event_count + non_event_count + 1e-9)
    print(f"EVENT RATIO: {event_ratio:.2f}")
    print("====================================================\n")

    print("Details:\n")
    for block, pred, prob in zip(blocks, predictions, probs):
        label = "EVENT" if pred == 1 else "NON-EVENT"
        confidence = prob[pred]
        print(f"[{label} | confidence: {confidence:.2f}]\n{block}\n")

    if event_count > non_event_count:
        print("Majority of blocks are EVENT-related. Returning full text block.\n")
        print("=========== FULL EVENT TEXT BLOCK ===========")
        print(user_input)
        print("=============================================\n")
    else:
        print("No strong event-related presence detected. Full text block not returned.\n")

    print("\n--- Waiting for next input ---\n")