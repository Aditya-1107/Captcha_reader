// src/components/CaptchaEncoder.tsx

import { useState, useEffect } from "react";

function CaptchaEncoder() {
  const [encoderData, setEncoderData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This useEffect hook runs when the component mounts
    console.log("Attempting to fetch from /api/captcha-encoder"); // Add console log to see if fetch is initiated

    fetch("/api/captcha-encoder") // <--- This calls your backend endpoint
      .then((response) => {
        console.log("Fetch response received", response); // Log the response object
        if (!response.ok) {
          // If response status is not 2xx
          throw new Error(
            `Network response was not ok: ${response.status} ${response.statusText}`
          );
        }
        return response.json(); // Parse the JSON body
      })
      .then((data) => {
        console.log("Data received:", data); // Log the parsed data
        setEncoderData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err); // Log any errors
        setError(err.message);
        setLoading(false);
      });

    // The empty dependency array `[]` means this effect runs only once after the initial render.
  }, []);

  if (loading) return <div>Loading encoder data...</div>;
  if (error) return <div>Error loading data: {error}</div>;

  return (
    <div>
      <h2>Captcha Label Encoder</h2>
      {/* Display the fetched data, formatted as JSON */}
      <pre>{JSON.stringify(encoderData, null, 2)}</pre>
    </div>
  );
}

export default CaptchaEncoder;
