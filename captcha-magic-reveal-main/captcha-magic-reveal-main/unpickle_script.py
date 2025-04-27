# unpickle_script.py
import pickle
import sys
import json

def unpickle_file(file_path):
    try:
        with open(file_path, 'rb') as f:
            data = pickle.load(f)
        # Convert the unpickled data to a JSON-serializable format if necessary
        # Simple types (lists, dicts, strings, numbers) are usually fine.
        # If the data contains custom objects, you might need to add logic here
        # to convert them to dicts/lists for JSON serialization.
        # For now, assume it's already JSON-compatible.
        return json.dumps(data)
    except FileNotFoundError:
        print(json.dumps({"error": f"File not found: {file_path}"}), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Error unpickling data: {e}"}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        pkl_file_path = sys.argv[1] # Get the file path from command line arguments
        json_output = unpickle_file(pkl_file_path)
        print(json_output) # Print the JSON output to standard output
    else:
        print(json.dumps({"error": "No file path provided"}), file=sys.stderr)
        sys.exit(1)