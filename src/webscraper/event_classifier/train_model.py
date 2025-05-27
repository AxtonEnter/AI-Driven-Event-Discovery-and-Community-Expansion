import pandas as pd
from sklearn.model_selection import train_test_split
import keras_nlp
from keras_nlp.models import BertClassifier, BertPreprocessor
import tensorflow as tf

# Step 1: Load + clean dataset
df = pd.read_csv("event_&_non_event_data.csv")
df['text'] = df['text'].astype(str)
df = df[df['text'].str.split().str.len() >= 5]
df['label'] = df['label'].map({'NON-EVENT': 0, 'EVENT': 1})

# Step 2: Train/val split
train_texts, val_texts, train_labels, val_labels = train_test_split(
    df['text'].values, df['label'].values, test_size=0.2, random_state=42
)

# Step 3: Load classifier and tokenizer
preprocessor = BertPreprocessor.from_preset("bert_tiny_en_uncased")

bert_classifier = keras_nlp.models.BertClassifier.from_preset(
    "bert_tiny_en_uncased",
    num_classes=2,
    preprocessor=preprocessor
)

preprocessor = keras_nlp.models.BertPreprocessor.from_preset("bert_tiny_en_uncased")

# Step 4: Turn text data into TensorFlow datasets
train_ds = tf.data.Dataset.from_tensor_slices((train_texts, train_labels))
train_ds = train_ds.shuffle(buffer_size=1024).batch(16).prefetch(tf.data.AUTOTUNE)

val_ds = tf.data.Dataset.from_tensor_slices((val_texts, val_labels))
val_ds = val_ds.batch(16).prefetch(tf.data.AUTOTUNE)

# Step 5: Compile
bert_classifier.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=5e-5),
    loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=["accuracy"]
)

# Step 6: Train
bert_classifier.fit(
    train_ds,
    validation_data=val_ds,
    epochs=5
)

# Step 7: Evaluate
loss, accuracy = bert_classifier.evaluate(val_ds)
print(f"\nValidation Accuracy: {accuracy:.2f}")

# Step 8: Save model
bert_classifier.save("saved_bert_model")

# Step 9: Predict function
# Commented out method for making predictions on trained model
# The updated function is now in a separate script 'test_model_prediction.py'
"""
def predict_event_blocks(blocks, model):
    logits = model.predict(blocks)
    predictions = tf.argmax(logits, axis=-1).numpy()
    
    for block, pred in zip(blocks, predictions):
        label = "EVENT" if pred == 1 else "NON-EVENT"
        print(f"[{label}] {block}\n")
        
event_examples = [
    "Join us for our annual community barbecue this Saturday at 2 PM.",
    "Don't miss the live jazz concert downtown on July 21st at 8pm!",
    "Register now for our free art workshop, Monday through Friday, 10am–4pm.",
]

non_event_examples = [
    "Our organization was founded in 1998 and has grown steadily since.",
    "The museum contains over 5,000 historical artifacts from around the world.",
    "We provide 24/7 customer support for all technical inquiries."
]

test_blocks = event_examples + non_event_examples
predict_event_blocks(test_blocks, bert_classifier)
"""