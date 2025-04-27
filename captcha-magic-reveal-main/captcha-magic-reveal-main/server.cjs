// server.cjs
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const { spawn } = require("child_process"); // Required for spawning Python processes
const multer = require("multer"); // Required for handling file uploads

const app = express();
// Enable CORS for all origins. Crucial for development where frontend/backend run on different ports.
// For production, consider restricting origins.
app.use(cors());
// Middleware to parse JSON request bodies (useful if you add routes that accept JSON).
// app.use(express.json()); // Uncomment if you need to receive JSON POST/PUT requests


// --- Multer Configuration for File Uploads ---
// Configures how uploaded files are stored. We use memoryStorage to get a Buffer.
const storage = multer.memoryStorage(); // Store the file as a Buffer in memory
const upload = multer({ storage: storage }); // Create the multer middleware instance
// ----------------------------------------------


// --- Basic Health Check Endpoint ---
// Simple GET endpoint to verify the API is running.
app.get("/api", (req, res) => {
  console.log("[API] Received GET request for /api - sending health check response.");
  res.send("API is running");
});
// ------------------------------------

// --- CAPTCHA Encoder Endpoint ---
// Handles GET requests to fetch the captcha label encoder data by unpickling a file via a Python script.
app.get("/api/captcha-encoder", (req, res) => {
  console.log("[API] Received GET request for /api/captcha-encoder");
  // --- IMPORTANT: Verify and potentially adjust this path ---
  const pklFilePath = path.resolve("D:/CLOUD/captcha_label_encoder.pkl"); // Your current absolute path
  // ----------------------------------------------------------

  // --- Path to the Python unpickling script ---
  const scriptPath = path.join(__dirname, "unpickle_script.py");
  // --------------------------------------------

  console.log(
    `[API] Attempting to run Python script: ${scriptPath} with file: ${pklFilePath}`
  );

  if (!fs.existsSync(scriptPath)) {
    const scriptNotFoundError = `[API] Python script not found at: ${scriptPath}`;
    console.error(scriptNotFoundError);
    return res
      .status(500)
      .json({ error: "Python unpickling script missing on server." });
  }

  const pythonProcess = spawn("python", [scriptPath, pklFilePath]);
  let scriptOutput = "";
  let scriptError = "";

  pythonProcess.stdout.on("data", (data) => { scriptOutput += data.toString(); });
  pythonProcess.stderr.on("data", (data) => { scriptError += data.toString(); });

  pythonProcess.on("error", (err) => {
    console.error(`[API] Failed to start Python subprocess for encoder: ${err}`);
    if (!res.headersSent) {
      res
        .status(500)
        .json({
          error: "Failed to run Python script for encoder",
          details: err.message,
        });
    }
  });

  pythonProcess.on("close", (code) => {
    console.log(`[API] Python subprocess for encoder exited with code ${code}`);

     if (res.headersSent) {
         console.warn("[API] Encoder script finished, but response already sent.");
         return;
     }

    if (code === 0) {
      try {
        const jsonData = JSON.parse(scriptOutput);
        console.log("[API] Python script output parsed successfully for encoder. Sending response.");
        res.json(jsonData);
      } catch (parseError) {
        console.error("[API] Failed to parse Python script output (encoder) as JSON:", parseError);
        console.error("[API] Raw Python script stdout (encoder):", scriptOutput);
        console.error("[API] Raw Python script stderr (encoder):", scriptError);
        res
          .status(500)
          .json({
            error: "Failed to parse Python script output (encoder)",
            details: parseError.message,
            rawOutput: scriptOutput,
            rawError: scriptError,
          });
      }
    } else {
      console.error("[API] Python script (encoder) failed.");
      console.error("[API] Python script stdout (encoder):", scriptOutput);
      console.error("[API] Python script stderr (encoder):", scriptError);
      try {
        const errorDetails = scriptError ? JSON.parse(scriptError) : null;
         res.status(500).json({
            error: "Python script execution failed (encoder)",
            details: errorDetails || {
              stdout: scriptOutput,
              stderr: scriptError,
            },
         });
      } catch (parseError) {
           res.status(500).json({
              error: "Python script execution failed (encoder)",
              rawOutput: scriptOutput,
              rawError: scriptError,
           });
      }
    }
  });
});
// ------------------------------------


// --- Endpoint for CAPTCHA Prediction ---
// Handles POST requests with an image file upload to predict the CAPTCHA text.
app.post(
  "/api/predict-captcha",
  upload.single("captchaImage"), // Use multer middleware to handle the file upload
  async (req, res) => { // Use async because we use await for fs.promises.unlink
    console.log("[API] Received POST request for /api/predict-captcha");

    if (!req.file) {
      console.warn("[API] No file uploaded for /api/predict-captcha");
      return res.status(400).json({ error: "No file uploaded" }); // Bad Request
    }

    console.log(
      `[API] Received file: ${req.file.originalname}, size: ${req.file.size} bytes, mimetype: ${req.file.mimetype}`
    );

    const imageBuffer = req.file.buffer; // Image data as Buffer

    // --- Save the image buffer to a temporary file ---
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
        try {
             fs.mkdirSync(tempDir);
             console.log(`[API] Created temporary directory: ${tempDir}`);
        } catch (mkdirErr) {
             console.error(`[API] Failed to create temp directory ${tempDir}:`, mkdirErr);
             return res.status(500).json({ error: "Failed to create temp directory on server." });
        }
    }
    const tempImagePath = path.join(tempDir, `${Date.now()}-${req.file.originalname}`);

    try {
        // Save the image buffer to the temporary file path synchronously.
        fs.writeFileSync(tempImagePath, imageBuffer);
        console.log(`[API] Saved temporary image file to: ${tempImagePath}`);

        // --- Spawn the Python prediction script ---
        const predictionScriptPath = path.join(__dirname, 'predict_script.py');

        if (!fs.existsSync(predictionScriptPath)) {
             console.error(`[API] Prediction Python script not found at: ${predictionScriptPath}`);
             // Clean up temp file before sending error response.
             // No need for await here as the function isn't processing further after return
             try { fs.unlinkSync(tempImagePath); } catch (unlinkErr) { console.error("[API] Failed to delete temp file after script not found:", unlinkErr); }
             return res.status(500).json({ error: "Prediction script missing on server." });
        }

        console.log(`[API] Spawning Python script: ${predictionScriptPath} with args: [${tempImagePath}]`);
        const predictionPythonProcess = spawn('python', [predictionScriptPath, tempImagePath]);

        let predictionOutput = ''; // Collect data from the Python script's stdout
        let predictionError = '';  // Collect data from the Python script's stderr

        predictionPythonProcess.stdout.on('data', (data) => { predictionOutput += data.toString(); });
        predictionPythonProcess.stderr.on('data', (data) => { predictionError += data.toString(); });

        // Handle errors during the spawning process itself
        predictionPythonProcess.on('error', (err) => {
            console.error(`[API] Failed to start Python prediction subprocess: ${err}`);
             // Attempt to clean up temp file synchronously on spawn error
             try { fs.unlinkSync(tempImagePath); } catch (unlinkErr) { console.error("[API] Failed to delete temp file after spawn error:", unlinkErr); }
             if (!res.headersSent) {
                 res.status(500).json({ error: "Failed to run Python prediction script", details: err.message });
             }
        });

        // Handle process exit. This is where we process the output and send the response.
        predictionPythonProcess.on('close', async (code) => { // Keep close handler async for potential future async operations
            console.log(`[API] Python prediction subprocess exited with code ${code}`);

            // --- Clean up the temporary file ---
            // Keep this try/catch block even if the unlink is commented out
            // to maintain correct syntax.
            try {
                // --- TEMPORARILY COMMENTED OUT FOR DEBUGGING ---
                // Uncomment this line once the Python script is working correctly
                // await fs.promises.unlink(tempImagePath);
                // console.log(`[API] Deleted temporary image file: ${tempImagePath}`);
                // -----------------------------------------------
                console.log("[API] Temporary file cleanup skipped (currently commented out).");
            } catch (unlinkErr) { // <<< THIS CATCH BLOCK IS NECESSARY for the try
                console.error(`[API] Failed to delete temporary file ${tempImagePath}:`, unlinkErr);
            }
            // ------------------------------------------

            // Ensure we don't send multiple responses
             if (res.headersSent) {
                 console.warn("[API] Prediction script finished, but response already sent.");
                 return;
             }

            // --- Process the Python script's output ---
            if (code === 0) {
                // Script exited successfully
                console.log("[API] Raw Python script stdout captured:", JSON.stringify(predictionOutput));

                // Trim the captured output before parsing
                const trimmedOutput = predictionOutput.trim();

                try {
                    // Parse the trimmed output
                    const predictionResult = JSON.parse(trimmedOutput);
                    console.log("[API] Python prediction script output parsed successfully. Sending actual response.");
                    // Send the ACTUAL prediction result back to the frontend.
                    res.json(predictionResult);
                } catch (parseError) {
                     // If JSON parsing fails even after trimming
                     console.error("[API] Failed to parse Python prediction script output as JSON:", parseError);
                     console.error("[API] Raw Python script stdout (original):", predictionOutput);
                     console.error("[API] Trimmed Python script stdout:", trimmedOutput);
                     console.error("[API] Raw Python script stderr:", predictionError);
                     res.status(500).json({
                         error: "Invalid prediction script output format.",
                         details: parseError.message,
                         rawOutput: predictionOutput,
                         rawError: predictionError,
                     });
                }
            } else {
                 // Script exited with an error code
                 console.error("[API] Python prediction script failed.");
                 console.error("[API] Python prediction script stdout:", predictionOutput);
                 console.error("[API] Python prediction script stderr:", predictionError);

                 // Send a 500 error response with details from Python's stderr/stdout.
                 res.status(500).json({
                     error: "Prediction script execution failed.",
                     details: predictionError || predictionOutput || "Unknown error during script execution.",
                 });
            }
        }); // <<< This closing parenthesis closes predictionPythonProcess.on('close', ...)

    } catch (fsError) {
        // Handle errors during the synchronous file writing process itself.
        console.error(`[API] Failed to write temporary image file: ${fsError}`);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to process image file on server.", details: fsError.message });
        }
    }
  } // <<< This closing parenthesis closes the async (req, res) => { ... } route handler function
); // <<< This closing parenthesis closes the app.post(...) call
// -----------------------------------------


// --- Serve Frontend Static Files (for production build) ---
const distDir = path.join(__dirname, "dist");
console.log(`[API] Configuring Express to serve static files from: ${distDir}`);
app.use(express.static(distDir));
// ----------------------------------------------------------

// --- SPA Fallback Route ---
// >>>>>> STILL COMMENTED OUT <<<<<<
// Keep this commented out for now. Implement this ONLY if you plan to serve the
// frontend build (`npm run build`) from this Node.js server in production.
/*
app.get('*', (req, res) => {
  console.log(`[API] SPA fallback: Received GET request for ${req.path}. Serving index.html.`);
  const indexPath = path.join(distDir, "index.html");
  fs.access(indexPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`[API] index.html not found at ${indexPath}:`, err);
      return res.status(404).send("Frontend build not found. Please run 'npm run build' first?");
    }
    res.sendFile(indexPath);
  });
});
*/
// --------------------------

// --- Start the Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
});