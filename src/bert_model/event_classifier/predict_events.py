import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # 0 = all logs, 1 = warnings, 2 = errors, 3 = fatal

from keras_nlp.models import BertPreprocessor, BertClassifier
from sklearn.metrics import classification_report, confusion_matrix
from urllib.parse import urlparse
from datetime import datetime
from bs4 import BeautifulSoup
import tensorflow as tf
import numpy as np
import psycopg2
import boto3
import json

# Replace with queue URL
QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/522167229147/main-queue"

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
            WaitTimeSeconds=5
        )
        messages = response.get("Messages", [])
        if messages:
            msg = messages[0]
            # receipt_handle = msg["ReceiptHandle"]
            body = msg["Body"]

            try:
                payload_preview = json.loads(body)
                if isinstance(payload_preview, list) and len(payload_preview) == 3:
                    short_text = payload_preview[2][:150] + "..."
                    print(f"\nRaw SQS Message Body Preview:\n[{payload_preview[0]}, \"{payload_preview[1]}\", \"{short_text}\"]\n")
                else:
                    print("\nRaw SQS Message Body:\n", body)
            except Exception:
                print("\nRaw SQS Message Body:\n", body)

            try:
                payload = json.loads(body)
                print("\n[ Parsed SQS message as list ]")
            except json.JSONDecodeError:
                print("Failed to parse message JSON")
                return None
            
            # Confirm expected format
            if not isinstance(payload, list) or len(payload) != 3:
                print("Message is not a list with 3 elements.")
                return None

            org_id, url, text = payload
            print("\nExtracted SNS Payload:")
            print(f"- org_id: {org_id}")
            print(f"- url: {url}")
            print(f"- text: {text[:150]}...\n")  # Limit print length

            # return the message and receipt handle for processing/deletion
            return {
                "org_id": org_id,
                "url": url,
                "text": text,
                "sqs_message": msg
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

def insert_event_to_db(org_id, url, text, html):
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
            org_id          # from SQS
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

'''
def split_into_blocks(text):
    """Split input text into blocks using paragraph-like breaks."""
    blocks = [b.strip() for b in text.split('\n') if b.strip()]
    return blocks
'''

def extract_visible_text_from_html(html):
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(separator=" ", strip=True)
    return text

while True:
    print("\n--- Checking SQS for new SNS messages... ---")
    sqs_msg = receive_sqs_message()

    if not sqs_msg:
        continue  # Wait for new message in next loop

    # Use SQS text field as model input
    html_input = sqs_msg["text"]  # now holds the HTML
    text_input = extract_visible_text_from_html(html_input)
    
    print("\nRunning MODEL PREDICTION on received text...\n")
    
    '''
    blocks = split_into_blocks(text_input)

    if not blocks:
        print("No valid text blocks detected.\n")
        continue
    '''

    # Wrap single paragraph as a list to make it batch-friendly
    input_batch = [text_input]

    # Predict
    logits = model.predict(input_batch, verbose=0)
    probs = tf.nn.softmax(logits, axis=-1).numpy()
    predictions = np.argmax(probs, axis=-1)

    pred_label = predictions[0]
    confidence = probs[0][pred_label]
    label_str = "EVENT" if pred_label == 1 else "NON-EVENT"

    print("================ Prediction Result =====================================================================")
    print(f"Predicted Label: {label_str}")
    print(f"Confidence: {confidence:.2f}")

    # Simulate true label for demonstration purposes
    true_labels = [1]  # You can change this to 0 or fetch real labels during evaluation

    # Print classification report and confusion matrix
    #print("Classification Report:")
    #print(classification_report(true_labels, predictions, labels=[0, 1], target_names=["NON-EVENT", "EVENT"]))

    #print("Confusion Matrix:")
    #print(confusion_matrix(true_labels, predictions))

    if pred_label == 1:
        print("\n**** Majority of blocks are EVENT-RELATED. SENDING full text block to database... ***")
        insert_event_to_db(
            org_id=17, #change to ' sqs_msg["org_id"] ' when the org_id is accurate from the SQS_msg
            url=sqs_msg["url"],
            text=text_input,
            html=html_input
        )
        # print("=========== FULL EVENT TEXT BLOCK ===========")
        # print(f"Text Preview: {text_input[:150]}...")
        # print("=============================================\n")
    else:
        print("\n****No strong event-related presence detected. Full text block not returned.****")

    print("================ End of Prediction Summary =============================================================\n")
    print("\n--- Waiting for next SQS message... ---")