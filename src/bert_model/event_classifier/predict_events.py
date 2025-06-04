import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # 0 = all logs, 1 = warnings, 2 = errors, 3 = fatal

import tensorflow as tf
import keras_nlp
import numpy as np

# This is for downloading the model via the internet & NOT locally
# Recreates the model architecture
preprocessor = keras_nlp.models.BertPreprocessor.from_preset("local_bert_preprocessor")

model = keras_nlp.models.BertClassifier.from_preset(
    "local_bert_classifier",
    num_classes=2,
    preprocessor=preprocessor
)

# Loads the weights
model.load_weights("saved_weights").expect_partial()


'''
# This loads the model that is local to the EC2
'''
# Load model from local path
#model = tf.keras.models.load_model("saved_bert_model")

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