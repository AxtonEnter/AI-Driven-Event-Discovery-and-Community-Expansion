import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # 0 = all logs, 1 = warnings, 2 = errors, 3 = fatal

from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf
import numpy as np
import keras_nlp

# Recreates the model architecture
preprocessor = keras_nlp.models.BertPreprocessor.from_preset("bert_tiny_en_uncased")

model = keras_nlp.models.BertClassifier.from_preset(
    "bert_tiny_en_uncased",
    num_classes=2,
    preprocessor=preprocessor
)

# Loads the weights
model.load_weights("saved_bert_model").expect_partial()
'''
 added 'expect_partial() to get rid of warnings it will give warnings
 which is fine because I'm not continously training the model.
 This is only using the model to predict, not like in 'train_model.py'
 when the script used to train the model and then use it test it's
 prediction.
'''

def predict_event_blocks(blocks, true_labels, model):
    """
    Predicts event vs non-event labels for a list of text blocks using the BERT model,
    and prints detailed evaluation output including predicted labels, confidence scores,
    expected labels, classification report, and confusion matrix.

    Args:
        blocks (List[str]): List of text strings to classify.
        true_labels (List[int]): List of true labels (1 for EVENT, 0 for NON-EVENT).
        model (tf.keras.Model): Trained BERT classifier.
    """
    print("Evaluating model predictions...\n")

    # Predict logits and convert to predicted class + confidence
    logits = model.predict(blocks)
    probs = tf.nn.softmax(logits, axis=-1).numpy()
    predictions = np.argmax(probs, axis=-1)

    # Display each prediction with confidence and expected label
    for i, (block, pred, prob) in enumerate(zip(blocks, predictions, probs)):
        label = "EVENT" if pred == 1 else "NON-EVENT"
        actual = "EVENT" if true_labels[i] == 1 else "NON-EVENT"
        confidence = prob[pred]
        print(f"[{label} | expected: {actual} | confidence: {confidence:.2f}]\n{block}\n")

    # Summary report
    print("\nClassification Report:")
    print(classification_report(true_labels, predictions, target_names=["NON-EVENT", "EVENT"]))

    print("Confusion Matrix:")
    print(confusion_matrix(true_labels, predictions))
        
event_examples = [
    "Join us for our annual community barbecue this Saturday at 2 PM.",
    "Don't miss the live jazz concert downtown on July 21st at 8pm!",
    "Register now for our free art workshop, Monday through Friday, 10am–4pm.",
    "Annual Easter Egg Hunt on April 9th at Central Park, 11 AM start time.",
    "Virtual panel discussion on climate change, Friday at 3 PM EST via Zoom.",
    "Sign up for our 5K charity run happening this Sunday at 9 AM!",
    "This weekend only: Farmers market at the square with live music and food.",
    "Free admission to the children's puppet show this Saturday morning.",
    "Monthly meeting of the historical society — new members welcome.",
    "Learn how to code: Weekly Python bootcamp for beginners (registration required).",
    "Tour the solar system through our new planetarium show, starts July 1st.",
]

non_event_examples = [
    "Our organization was founded in 1998 and has grown steadily since.",
    "The museum contains over 5,000 historical artifacts from around the world.",
    "We provide 24/7 customer support for all technical inquiries.",
    "This article explores the economic trends over the past decade.",
    "The FAQ section can answer most questions regarding our services.",
    "Our team meets regularly to discuss project goals and internal progress.",
    "Explore our new exhibit — now open to the public (hours listed below).",
    "Contact our office for inquiries about future programs.",
    "Looking to volunteer? Visit our website to learn more.",
    "Book your group’s guided tour through our online system.",
]

test_blocks = event_examples + non_event_examples
test_labels = [1] * len(event_examples) + [0] * len(non_event_examples)

predict_event_blocks(test_blocks, test_labels, model)