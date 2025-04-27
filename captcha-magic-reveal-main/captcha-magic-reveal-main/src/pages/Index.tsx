import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UploadCard } from "@/components/UploadCard";
import { ResultCard } from "@/components/ResultCard";
import { ModelSpecificationsModal } from "@/components/ModelSpecificationsModal";
import { Loader, Info, ArrowRight, Code, Sparkles } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query'; // ADD THIS IMPORT

// --- Async function to send the file to the backend ---
const sendCaptchaImageForPrediction = async (file: File) => {
  console.log("Sending file to backend:", file.name); // Log when the fetch starts
  const formData = new FormData();
  formData.append('captchaImage', file); // 'captchaImage' MUST match the field name in server.cjs (upload.single('captchaImage'))

  const response = await fetch('/api/predict-captcha', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorDetails = `HTTP error! status: ${response.status}`;
    try {
      const errorBody = await response.json();
      errorDetails += `, details: ${JSON.stringify(errorBody)}`;
    } catch {
      const errorText = await response.text();
      errorDetails += `, body: ${errorText.substring(0, 200)}...`;
    }
    console.error("Fetch failed:", errorDetails);
    throw new Error(errorDetails);
  }

  const resultData = await response.json();
  console.log("Fetch successful, received data:", resultData);
  return resultData;
};
// -----------------------------------------------------------------------


const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ text: string; confidence: number } | null>(null);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // --- Use the useMutation hook for sending the file data ---
  const mutation = useMutation({
    mutationFn: sendCaptchaImageForPrediction,
    onSuccess: (data) => {
      console.log('Prediction mutation successful:', data);
      // --- CORRECTED VALIDATION ---
      // Check if data exists and has 'text' (string) and 'confidence' (number) properties
      if (data && typeof data.text === 'string' && typeof data.confidence === 'number') {
         setResult(data); // Set the result state (even if text is empty!)
         toast({ title: "Prediction Successful", description: "CAPTCHA predicted!", });
      } else {
          // If the structure is wrong, show the error
          console.error("Backend response format unexpected:", data);
          toast({ title: "Prediction Failed", description: "Invalid response format from server.", variant: "destructive", });
          setResult({ text: "Error", confidence: 0 }); // Indicate error on UI
      }
      // --------------------------
    },
    onError: (error) => {
      console.error('Prediction mutation failed:', error);
      toast({ title: "Prediction Failed", description: error.message || "An unknown error occurred", variant: "destructive", });
      setResult(null); // Clear result on error
    },
  });
  // -----------------------------------------------------------


  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setResult(null); // Clear previous result when a new file is selected
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }
    if (mutation.isPending) {
        console.log("Prediction already in progress.");
        return;
    }
    console.log("Calling mutation.mutate with selected file:", selectedFile.name);
    mutation.mutate(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
     mutation.reset(); // Reset mutation state as well
    // Try to clear the file input visually if possible (might not work reliably across browsers)
    const fileInput = document.getElementById('captcha-upload') as HTMLInputElement | null;
    if (fileInput) {
        fileInput.value = '';
    }
  };

  // Use mutation.isPending for loading state in the button
  const displayLoading = mutation.isPending;
  // Determine button disabled state
  const isPredictButtonDisabled = !selectedFile || mutation.isPending;


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/30 to-secondary/50 relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>

      <ModelSpecificationsModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />

      <div className="container max-w-4xl mx-auto py-12 px-4 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-primary">CAPTCHA Predictor</span>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/about')}
            className="hover:translate-x-1 transition-transform border-primary/30 hover:bg-primary/5"
          >
            About This Tool
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="text-center mb-12 animate-fade-in relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0"
            onClick={() => setIsSpecModalOpen(true)}
          >
            <Info className="h-6 w-6 text-primary hover:scale-110 transition-transform" />
          </Button>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            Instant CAPTCHA Recognition
          </h1>
          <div className="relative inline-block">
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload your CAPTCHA image and get results in seconds.
            </p>
            <span className="flex items-center justify-center gap-2 text-lg font-medium text-primary/80">
              <Sparkles className="h-5 w-5" />
              Fast, accurate, and simple
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl border border-white/50 relative">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none"></div>

            <UploadCard
              onFileSelect={handleFileSelect} // UploadCard calls this when file changes
              selectedFile={selectedFile}
            />

            {/* Show Predict button only if a file is selected AND no result is currently displayed */}
            {selectedFile && !result && (
              <div className="flex justify-center mt-6 animate-fade-in">
                <Button
                  onClick={handlePredict} // This now calls the function that triggers useMutation
                  disabled={isPredictButtonDisabled} // Use the calculated disabled state
                  size="lg"
                  className="bg-primary text-white hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {/* Use displayLoading for button text */}
                  {displayLoading ? (
                    <>
                      <Loader className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Predict CAPTCHA"
                  )}
                </Button>
              </div>
            )}

            {/* Show ResultCard if result state is not null */}
            {result && (
              <div className="space-y-6 mt-8 animate-scale-in">
                {/* Pass the result data from the state */}
                <ResultCard text={result.text} confidence={result.confidence} />
                <div className="flex justify-center pt-4">
                   {/* Show Try Another button if there is a result */}
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="hover:bg-primary/10 transition-colors duration-300 border-primary/30"
                  >
                    Try Another CAPTCHA
                  </Button>
                </div>
              </div>
            )}

            {/* --- Optional: Display Error Message from Mutation --- */}
            {/* If the mutation failed and there's no result to show */}
            {mutation.isError && !result && (
                <div className="flex justify-center mt-6 text-red-600">
                    Error: {mutation.error?.message || 'An error occurred during prediction.'}
                </div>
            )}
             {/* ---------------------------------------------------- */}

          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          Educational use only • <span className="text-primary cursor-pointer hover:underline" onClick={() => setIsSpecModalOpen(true)}>Learn more</span>
        </div>
      </div>
    </div>
  );
};

export default Index;