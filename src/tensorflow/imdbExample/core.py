import matplotlib.pyplot as plt
import os
import re
import shutil
import string
import tensorflow as tf

from tensorflow import keras
from keras._tf_keras.keras import layers
from keras._tf_keras.keras import losses

# Code Based On: https://www.tensorflow.org/tutorials/keras/text_classification

print(tf.__version__)

dataset_dir = os.path.join(os.path.dirname(__file__), 'aclImdb')

os.listdir(dataset_dir)

train_dir = os.path.join(dataset_dir, 'train')
os.listdir(train_dir)
test_dir = os.path.join(dataset_dir, 'test')

sample_file = os.path.join(train_dir, 'pos/1181_9.txt')
with open(sample_file) as f:
  print(f.read())

batch_size = 32
seed = 42

raw_train_ds = tf.keras.utils.text_dataset_from_directory(
    train_dir,
    batch_size=batch_size,
    validation_split=0.2,
    subset='training',
    seed=seed)

for text_batch, label_batch in raw_train_ds.take(1):
  for i in range(3):
    print("Review", text_batch.numpy()[i])
    print("Label", label_batch.numpy()[i])

print("Label 0 corresponds to", raw_train_ds.class_names[0])
print("Label 1 corresponds to", raw_train_ds.class_names[1])

raw_val_ds = tf.keras.utils.text_dataset_from_directory(
    train_dir,
    batch_size=batch_size,
    validation_split=0.2,
    subset='validation',
    seed=seed)

raw_test_ds = tf.keras.utils.text_dataset_from_directory(
    test_dir,
    batch_size=batch_size)

def custom_standardization(input_data):
    lowercase = tf.strings.lower(input_data)
    stripped_html = tf.strings.regex_replace(lowercase, '<br />', ' ')
    return tf.strings.regex_replace(stripped_html,
                                    '[%s]' % re.escape(string.punctuation),
                                    '')

max_features = 20000
sequence_length = 250

vectorize_layer = layers.TextVectorization(
    standardize=custom_standardization,
    max_tokens=max_features,
    output_mode='int',
    output_sequence_length=sequence_length)

# Make a text-only dataset (without labels), then call adapt
train_text = raw_train_ds.map(lambda x, y: x)
vectorize_layer.adapt(train_text)

def vectorize_text(text, label):
    text = tf.expand_dims(text, -1)
    return vectorize_layer(text), label

# retrieve a batch (of 32 reviews and labels) from the dataset
text_batch, label_batch = next(iter(raw_train_ds))
first_review, first_label = text_batch[0], label_batch[0]
print("Review", first_review)
print("Label", raw_train_ds.class_names[first_label])
print("Vectorized review", vectorize_text(first_review, first_label))

print("1287 ---> ",vectorize_layer.get_vocabulary()[1287])
print(" 313 ---> ",vectorize_layer.get_vocabulary()[313])
print('Vocabulary size: {}'.format(len(vectorize_layer.get_vocabulary())))


train_ds = raw_train_ds.map(vectorize_text)
val_ds = raw_val_ds.map(vectorize_text)
test_ds = raw_test_ds.map(vectorize_text)


AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
test_ds = test_ds.cache().prefetch(buffer_size=AUTOTUNE)

model_filename = "imdb_model.keras"
modelPath = "src/tensorflow/imdbExample/imdb_model.keras"

if os.path.exists(modelPath):
    print("Loading existing model...")
    model = tf.keras.models.load_model(modelPath)
else:
    print("Model not found. Train a new one.")

    embedding_dim = 64

    model = tf.keras.Sequential([
        layers.Embedding(max_features, embedding_dim),
        layers.Conv1D(64, 5, activation='relu'),
        layers.Dropout(0.2),
        layers.GlobalAveragePooling1D(),
        layers.Dropout(0.2),
        layers.Dense(32, activation='relu'),
        layers.Dense(1, activation='sigmoid')])

    model.summary()
    
    model.compile(loss=losses.BinaryCrossentropy(),
                    optimizer='adam',
                    metrics=[tf.metrics.BinaryAccuracy(threshold=0.5)])

    epochs = 10
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs)


    loss, accuracy = model.evaluate(test_ds)

    print("Loss: ", loss)
    print("Accuracy: ", accuracy)

    # model.save(model_filename)

    history_dict = history.history
    history_dict.keys()

    acc = history_dict['binary_accuracy']
    val_acc = history_dict['val_binary_accuracy']
    loss = history_dict['loss']
    val_loss = history_dict['val_loss']

    epochs = range(1, len(acc) + 1)

    # # "bo" is for "blue dot"
    # plt.plot(epochs, loss, 'bo', label='Training loss')
    # # b is for "solid blue line"
    # plt.plot(epochs, val_loss, 'b', label='Validation loss')
    # plt.title('Training and validation loss')
    # plt.xlabel('Epochs')
    # plt.ylabel('Loss')
    # plt.legend()

    # plt.show()

    # plt.plot(epochs, acc, 'bo', label='Training acc')
    # plt.plot(epochs, val_acc, 'b', label='Validation acc')
    # plt.title('Training and validation accuracy')
    # plt.xlabel('Epochs')
    # plt.ylabel('Accuracy')
    # plt.legend(loc='lower right')

    # plt.show()

# Export the model
export_model = tf.keras.Sequential([
  vectorize_layer,
  model,
  layers.Activation('sigmoid')
])

export_model.compile(
    loss=losses.BinaryCrossentropy(from_logits=False), optimizer="adam", metrics=['accuracy']
)

# Test it with `raw_test_ds`, which yields raw strings
metrics = export_model.evaluate(raw_test_ds, return_dict=True)
print(metrics)


sample_reviews = [
    "The cast did very well with their roles especially Timothée Chalamet as Paul Atreides, he performed really well and expressed the emotion through his role. As well as Zendaya, she didn’t appear much but every one of her scenes is literally elegant. I might not mention other actors such as Oscar Isaac, Rebecca Ferguson, Jason Momoa etc, all of them did the very job!!",
    "OMG The movie was amazing. I do not like war movies or army movies at all... but this one was amazing. I loved the CG in the movie and i loved the theme. Aliens getting contacted by Earth that try to come and destroy us... The best part of the movie was at the end when the Museum steam ship had to be used. All the other ships were destroyed and Earths only defense was an old steam battleship that was used. THE BEST part is that it was a museum and the veterans from prior wars all in their 80's and 90's helped the few soldiers that were left from the abandoned ships. I found my self giddy that the veterans were helping and it was right at the climax that was needed especially with a serious movie. I loved it and like i said i normally do not get into these kind of movies.",
    "Corny, silly, ridiculous, stupid, pointless, mindless. Probably one of the worst movies this year. Aliens need a signal to get to Earth then they come with explosive weapons and earthly technology and the navy beats the aliens with a battleship. The unlikely but obvious hero marries the beautiful princess, the elderly retirees get their second chance at being heroes, the handicapped soldier also gets a second chance at being a hero and the Japanese marine helps the USA save the world from an alien invasion. The story is weak, predictable and the acting is very mediocre. Liam Neeson has made a custom of choosing bad story lines for his work. It seems as this movie has been paid for by the Navy to lure young mindless people to join their ranks. Distasteful, unpleasant.",
    "Severance feels like a long and boring rip off of a bad and never aired episode of the Twilight Zone. It spends way too much time going nowhere fast, and does so with annoying and condescending attempts at humor in places that mainly feel like filler, as in how can we stretch this out to fulfill the number of episodes we agreed to in the contract. The end result is about as enthralling as having a root canal done. It makes me sad that people consume fodder like this, and it almost makes me weep that there are people out there that are so shallow and empty as to actually heap praise on it. Once again, Apple pours money into an absolute dud."
]

def predict_review(model, vectorize_layer, review_text):
    review_text = [review_text]  # Model expects batch input
    review_vector = vectorize_layer(review_text)  # Vectorize new input
    prediction = model.predict(review_vector)[0][0]  # Get prediction score
    sentiment = "Positive" if prediction > 0.5 else "Negative"
    return f"Review: {review_text[0]}\nPredicted Sentiment: {sentiment} (Score: {prediction:.4f})"

# Example usage
for review in sample_reviews:
    print(predict_review(model, vectorize_layer, review))



