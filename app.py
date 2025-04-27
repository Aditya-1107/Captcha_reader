from flask import Flask, request, jsonify
import json
import numpy as np
import tensorflow as tf
import pickle
import cv2
from tensorflow.keras.models import load_model
from pathlib import Path

# --- Initialize Flask app ---
app = Flask(__name__)

# --- Paths ---
MODEL_PATH = "captcha_cnn_model.keras"
PICKLE_PATH = "captcha_label_encoder.pkl"
CONFIG_PATH = "captcha_model_config.json"

# --- Load Config ---
with open(CONFIG_PATH, "r") as f:
    config = json.load(f)
img_width = config["img_width"]
img_height = config["img_height"]

# --- Load Model ---
model = load_model(MODEL_PATH, compile=False)

# --- Load Pickle Mappings ---
with open(PICKLE_PATH, "rb") as f:
    mappings = pickle.load(f)
char_to_num = mappings["char_to_num"]
num_to_char = mappings["num_to_char"]

# --- Utility Functions ---
def decode_label(encoded_seq):
    return "".join([num_to_char.get(i, '') for i in encoded_seq if i != -1])

def preprocess_image(img):
    img = cv2.imdecode(np.frombuffer(img.read(), np.uint8), cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (img_width, img_height))
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=(0, -1))
    return img

def predict_captcha(image_file):
    img = preprocess_image(image_file)
    pred = model.predict(img, verbose=0)

    input_len = np.ones(pred.shape[0]) * pred.shape[1]
    decoded_tensor, _ = tf.keras.backend.ctc_decode(pred, input_length=input_len, greedy=True)

    if decoded_tensor and len(decoded_tensor[0].numpy()) > 0:
        decoded_sequence = decoded_tensor[0].numpy()[0]
    else:
        decoded_sequence = []

    return decode_label(decoded_sequence)

# --- API Route ---
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']

    try:
        prediction = predict_captcha(file)
        return jsonify({"prediction": prediction})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Main Run ---
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
