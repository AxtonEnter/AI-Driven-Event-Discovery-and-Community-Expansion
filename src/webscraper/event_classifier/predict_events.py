import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # 0 = all logs, 1 = warnings, 2 = errors, 3 = fatal

import tensorflow as tf
import keras_nlp

# Load the saved model
model = tf.keras.models.load_model("saved_bert_model")


print("====================================================================================================")
print("\n[ Model loaded. Type or paste your text block below ]")
print("[       Type 'quit' and press enter to stop         ]\n")

while True:
    user_input = input("Paste your text block:\n")

    if user_input.strip().lower() == "quit":
        print("Exiting...")
        break

    # Split input into non-empty lines
    blocks = [line.strip() for line in user_input.split("\n") if line.strip()]

    if not blocks:
        print("No valid text entered.\n")
        continue

    # Predict using the model (raw text is fine since the model includes a preprocessor)
    logits = model.predict(blocks)
    predictions = tf.argmax(logits, axis=-1).numpy()

    print("\n______Predicted EVENT-related blocks:______")
    
    any_events = False
    for block, pred in zip(blocks, predictions):
        if pred == 1:
            print(f"{block}")
            any_events = True

    if not any_events:
        print("\tNo event-related text detected...")
    
    print("\n\t--- Waiting for next input ---\n")