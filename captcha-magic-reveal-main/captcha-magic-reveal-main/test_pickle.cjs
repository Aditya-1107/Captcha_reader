// test_pickle.cjs
const pickle = require("pickle");
const fs = require("fs");
const path = require("path");

const pklPath = path.resolve("D:/CLOUD/captcha_label_encoder.pkl"); // Use your exact path

console.log(`Attempting to load pickle file from: ${pklPath}`);

if (!fs.existsSync(pklPath)) {
  console.error(`Error: Pickle file not found at: ${pklPath}`);
  process.exit(1); // Exit with an error code
}

const pickleData = fs.readFileSync(pklPath);
console.log("Pickle file read successfully. Attempting to unpickle...");

// Using pickle.loads which should trigger the Python subprocess
pickle.loads(pickleData, (err, result) => {
  if (err) {
    console.error("Error unpickling data:", err);
    console.error("Pickle error details:", err.stack);
    process.exit(1); // Exit with an error code
  }
  console.log("Data unpickled successfully!");
  // console.log("Unpickled data:", result); // Optional: uncomment to see the data
  process.exit(0); // Exit successfully
});

// This will catch errors if pickle.loads itself throws synchronously (unlikely for this error)
// or issues with fs.readFileSync
try {
  // The main logic is async, so this is less likely to catch the spawn error,
  // but good practice for sync parts.
} catch (error) {
  console.error("Caught synchronous error:", error);
  console.error("Error details:", error.stack);
  process.exit(1);
}
