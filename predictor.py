import json
import numpy as np
import tensorflow as tf
import pickle
import cv2
from tensorflow.keras.models import load_model
from pathlib import Path # pathlib is imported but not strictly necessary here

# --- Updated Paths Based on Your Listing ---
MODEL_PATH   = r"D:\CLOUD\captcha_cnn_model.keras"
PICKLE_PATH  = r"D:\CLOUD\captcha_label_encoder.pkl" # Assuming this has char_to_num/num_to_char
CONFIG_PATH  = r"D:\CLOUD\captcha_model_config.json" # Assuming this has img dimensions/max_length
SAMPLE_IMAGE = r"D:\CLOUD\sample_captcha.png"      # Using the standard name, ensure this file exists

# --- Load JSON config for image dims & max length ---
try:
    with open(CONFIG_PATH, "r") as f:
        config = json.load(f)
    img_width  = config["img_width"]
    img_height = config["img_height"]
    # max_length isn't strictly needed for prediction but load it from config if it's there
    max_length = config.get("max_length", None) # Use .get for safety if key might be missing
    print(f"Loaded config: width={img_width}, height={img_height}, max_length={max_length}")
except FileNotFoundError:
    print(f"Error: Config file not found at {CONFIG_PATH}")
    exit() # Exit if config is missing, as dimensions are crucial
except KeyError as e:
    print(f"Error: Missing key {e} in config file {CONFIG_PATH}")
    exit()

# --- Load the trained model (inference only) ---
try:
    model = load_model(MODEL_PATH, compile=False)
    print(f"Loaded model from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model from {MODEL_PATH}: {e}")
    exit()

# --- Load character mappings from pickle ---
try:
    with open(PICKLE_PATH, "rb") as f:
        mappings = pickle.load(f)
    # Assuming the pickle contains a dictionary like {"char_to_num": ..., "num_to_char": ...}
    # Adjust if your pickle structure is different (e.g., just the LabelEncoder object)
    char_to_num = mappings["char_to_num"]
    num_to_char = mappings["num_to_char"]
    print(f"Loaded character mappings from {PICKLE_PATH}")
    # Optional: Print the character set
    # print("Character set:", "".join(num_to_char.values()))
except FileNotFoundError:
    print(f"Error: Pickle file not found at {PICKLE_PATH}")
    exit() # Exit if mappings are missing
except KeyError as e:
    print(f"Error: Missing key {e} in pickle file {PICKLE_PATH}. Ensure it contains 'char_to_num' and 'num_to_char'.")
    exit()
except Exception as e:
    print(f"Error loading pickle file {PICKLE_PATH}: {e}")
    exit()


# --- Decode CTC output back to text ---
def decode_label(encoded_seq):
    # Filter out -1 which is the padding value from ctc_decode
    return "".join([num_to_char.get(i, '') for i in encoded_seq if i != -1]) # Use .get for safety

# --- Preprocess a single image ---
def preprocess_image(img_path):
    try:
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise FileNotFoundError(f"cv2.imread failed to load image (check path/permissions/integrity): {img_path}")

        img = cv2.resize(img, (img_width, img_height))
        img = img.astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=(0, -1))  # Shape: (1, H, W, 1)
        return img
    except cv2.error as e:
        print(f"OpenCV error during preprocessing: {e}")
        raise # Re-raise the exception to be caught later
    except Exception as e:
        print(f"Error during preprocessing image {img_path}: {e}")
        raise # Re-raise


# --- Run prediction ---
def predict_captcha(img_path):
    try:
        img = preprocess_image(img_path) # Preprocessing might raise FileNotFoundError
        pred = model.predict(img, verbose=0)

        # CTC Decode
        # input_length needs to be the length of the sequence *before* CTC collapse
        # which is the width of the output layer of the CNN part (time steps)
        input_len = np.ones(pred.shape[0]) * pred.shape[1]
        decoded_tensor, _ = tf.keras.backend.ctc_decode(
            pred,
            input_length=input_len,
            greedy=True # Use greedy decoding for simplicity
        )

        # Extract the sequence, handling potential empty tensors
        if decoded_tensor and len(decoded_tensor[0].numpy()) > 0:
             decoded_sequence = decoded_tensor[0].numpy()[0]
             print("Raw decoded sequence (indices):", decoded_sequence) # Keep this for debugging
        else:
             decoded_sequence = []
             print("Warning: CTC decode returned empty tensor.")

        return decode_label(decoded_sequence)

    except FileNotFoundError as e:
        print(e) # Print the specific error from preprocess_image or initial check
        return "Error: Input image preprocessing failed."
    except Exception as e:
        print(f"An unexpected error occurred during prediction: {e}")
        # import traceback # Uncomment for detailed stack trace
        # traceback.print_exc()
        return "Error: Prediction failed."


# --- Example usage ---
if __name__ == "__main__":
    # Ensure the sample image file exists before trying to predict
    if not Path(SAMPLE_IMAGE).is_file():
        print(f"Error: Sample image file not found at {SAMPLE_IMAGE}")
    else:
        print(f"\nPredicting CAPTCHA from: {SAMPLE_IMAGE}")
        result = predict_captcha(SAMPLE_IMAGE)
        print("\nPredicted CAPTCHA:", result)