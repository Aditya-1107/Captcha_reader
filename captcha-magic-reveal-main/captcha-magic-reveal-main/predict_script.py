# predict_script.py
# Final version integrating user's standalone script logic.

import pickle     # Use pickle as per user's latest script
import sys        # Used for arguments, stderr, exit codes
import json       # For printing final JSON result
import os         # For path manipulation
import traceback  # For detailed error logging

# --- Required ML/CV Libraries ---
# Ensure these are installed: python -m pip install opencv-python tensorflow numpy
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras import backend as K


# --- IMPORTANT: VERIFY THESE PATHS ---
# Use the paths you provided earlier for the actual files.
MODEL_PATH = "D:/CLOUD/captcha_cnn_model.keras"       # <<< YOUR KERAS MODEL FILE PATH
ENCODER_PATH = "D:/CLOUD/captcha_label_encoder.pkl" # <<< YOUR LABEL ENCODER FILE PATH
# CONFIG_PATH = "D:/CLOUD/captcha_model_config.json"    # <<< YOUR JSON CONFIG FILE PATH (if needed, otherwise remove/comment out)
# If you don't load/use the config JSON, you can remove references to model_config
# but make sure img_width, img_height etc. are loaded correctly from the pkl file if needed.
# --------------------------------------------------

# --- Global variables ---
# These will be loaded by load_resources()
num_to_char_mapping = None
model = None
# Dimensions and config - load from pkl or define if fixed
img_width = None
img_height = None
num_chars = 19 # From your notebook's output for len(characters) - used for blank index calculation. VERIFY THIS!


# --- Function to load the encoder and model ---
def load_resources():
    """Loads model and encoder into global variables. Exits on failure."""
    global num_to_char_mapping, model, img_width, img_height, num_chars # Include all globals used

    try:
        # --- Load the label encoder (.pkl) ---
        print(json.dumps({"status": "loading", "resource": "encoder", "path": ENCODER_PATH}), file=sys.stderr)
        with open(ENCODER_PATH, 'rb') as f:
            # Use pickle.load as per your latest script snippet
            loaded_data = pickle.load(f)

        # Extract necessary info based on your notebook/script's structure
        # Assuming pkl contains 'num_to_char' and possibly dimensions
        num_to_char_mapping = loaded_data.get('num_to_char')
        # Load dimensions directly if they were saved in the pkl (as your snippet implies)
        # Otherwise, load them from the separate config JSON or define defaults
        img_width = loaded_data.get('img_width', 200) # Default 200 if not in pkl
        img_height = loaded_data.get('img_height', 50)  # Default 50 if not in pkl
        # num_chars might be inferrable from the mapping or config
        if num_to_char_mapping:
            num_chars = len(num_to_char_mapping) # Number of actual characters (excluding blank)
        else:
             raise ValueError(f"Encoder file {ENCODER_PATH} does not contain 'num_to_char' mapping as expected.")
        print(json.dumps({"status": "success", "resource": "encoder", "num_chars": num_chars}), file=sys.stderr)


        # --- Load your trained Keras model (.keras) ---
        print(json.dumps({"status": "loading", "resource": "model", "path": MODEL_PATH}), file=sys.stderr)
        model = load_model(MODEL_PATH, compile=False) # Load model structure and weights
        if model is None:
             raise ValueError("Keras model loading returned None.")
        print(json.dumps({"status": "success", "resource": "model"}), file=sys.stderr)


    except FileNotFoundError as e:
        print(json.dumps({"error": f"Resource file not found during loading: {e}", "resource": str(e.filename)}), file=sys.stderr)
        print(json.dumps({"traceback": traceback.format_exc()}), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Error loading resources: {e}"}), file=sys.stderr)
        print(json.dumps({"traceback": traceback.format_exc()}), file=sys.stderr)
        sys.exit(1)

# --- Load resources when the script starts ---
load_resources()


# --- Decoding function (from your snippet/notebook) ---
def decode_label(encoded_seq):
    """Decodes a sequence of indices into a text string using the loaded mapping."""
    global num_to_char_mapping
    if num_to_char_mapping is None:
         print(json.dumps({"error": "num_to_char mapping not loaded for decoding."}), file=sys.stderr)
         return ""

    decoded_chars = []
    for n in encoded_seq:
        if n != -1: # CTC blank symbol index after decode is -1
             # Determine key type: Check if your loaded mapping keys are integers or strings
             # Assuming integer keys based on enumerate in notebook:
             char = num_to_char_mapping.get(n, '?') # Use '?' for unknown indices
             # If keys are strings (like '0', '1'), use this instead:
             # char = num_to_char_mapping.get(str(n), '?')
             decoded_chars.append(char)
    return ''.join(decoded_chars)


# --- Preprocessing function (from your snippet/notebook) ---
def preprocess_image(img_path):
    """Loads and preprocesses image as per training."""
    global img_width, img_height # Use globally loaded dimensions
    if None in [img_width, img_height]:
        print(json.dumps({"error": "Image dimensions not loaded for preprocessing."}), file=sys.stderr)
        return None

    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE) # Read grayscale
    if img is None:
        print(json.dumps({"error": f"Could not read image file: {image_path}"}), file=sys.stderr)
        return None
    img = cv2.resize(img, (img_width, img_height))
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=0)  # Add batch dimension (1, H, W)
    img = np.expand_dims(img, axis=-1) # Add channel dimension (1, H, W, 1)
    return img


# --- Prediction Function ---
def predict_captcha(image_path):
    """Performs preprocessing, prediction, decoding, and confidence calculation."""
    global model, num_to_char_mapping, num_chars # Access global resources

    if None in [model, num_to_char_mapping]:
         print(json.dumps({"error": "Prediction resources not loaded properly."}), file=sys.stderr)
         return None

    try:
        # 1. Preprocess Image (using function defined above)
        print(json.dumps({"status": "info", "message": "Preprocessing image..."}), file=sys.stderr)
        img = preprocess_image(image_path)
        if img is None: return None # Error handled in preprocess_image
        print(json.dumps({"status": "info", "message": f"Preprocessed shape: {img.shape}"}), file=sys.stderr)

        # 2. Run Prediction (using function defined above)
        print(json.dumps({"status": "info", "message": "Running model prediction..."}), file=sys.stderr)
        raw_predictions = model.predict(img, verbose=0) # Use verbose=0
        print(json.dumps({"status": "info", "message": "Model prediction complete."}), file=sys.stderr)

        # 3. Decode Prediction (using function defined above and Keras backend)
        print(json.dumps({"status": "info", "message": "Decoding CTC output..."}), file=sys.stderr)
        input_length = np.ones(raw_predictions.shape[0]) * raw_predictions.shape[1]
        decoded_indices_tensor = K.ctc_decode(raw_predictions, input_length=input_length, greedy=True)[0][0]
        decoded_indices_sequence = decoded_indices_tensor.numpy()[0] # Get sequence for the single sample
        predicted_text = decode_label(decoded_indices_sequence)
        print(json.dumps({"status": "debug", "message": f"Predicted raw indices: {decoded_indices_sequence.tolist()}"}), file=sys.stderr)
        print(json.dumps({"status": "info", "message": f"Decoded text: '{predicted_text}'"}), file=sys.stderr)

        # 4. Calculate Confidence (Using average max probability approach)
        print(json.dumps({"status": "info", "message": "Calculating confidence..."}), file=sys.stderr)
        probs_per_timestep = raw_predictions[0]
        max_probs = np.max(probs_per_timestep, axis=-1)
        blank_index = num_chars # Blank index is num_chars (e.g., 19 if 0-18 are chars)
        confidences_per_timestep = []
        for t in range(raw_predictions.shape[1]):
            max_index = np.argmax(raw_predictions[0, t, :])
            if max_index != blank_index:
                confidences_per_timestep.append(np.max(raw_predictions[0, t, :]))
        confidence_score = float(np.mean(confidences_per_timestep)) if confidences_per_timestep else 0.0
        print(json.dumps({"status": "debug", "message": f"Calculated confidence: {confidence_score}"}), file=sys.stderr)

        # 5. Format Result
        result = {"text": predicted_text, "confidence": confidence_score}
        return result

    except Exception as e:
        print(json.dumps({"error": f"Prediction error: {e}"}), file=sys.stderr)
        print(json.dumps({"traceback": traceback.format_exc()}), file=sys.stderr)
        return None

# --- Main execution block ---
if __name__ == "__main__":
    # Get image path passed from Node.js backend
    if len(sys.argv) > 1:
        image_file_path = sys.argv[1]

        # Perform prediction
        prediction_result = predict_captcha(image_file_path)

        if prediction_result is not None:
            # SUCCESS: Print final JSON result ONLY to standard output
            print(json.dumps({"message": "--- PREDICTION RESULT START ---"}), file=sys.stderr) # Debug marker
            print(json.dumps(prediction_result)) # <<< FINAL RESULT TO STDOUT
            print(json.dumps({"message": "--- PREDICTION RESULT END ---"}), file=sys.stderr)   # Debug marker
            sys.exit(0) # Exit successfully
        else:
            # Failure occurred within predict_captcha, error logged to stderr
            sys.exit(1) # Exit with error code
    else:
        # ERROR: No image path argument provided
        print(json.dumps({"error": "No image file path provided as command-line argument."}), file=sys.stderr)
        sys.exit(1) # Exit with error code