import React from 'react';
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  const allowedCharacters = ['2', '3', '4', '5', '6', '7', '8', 'b', 'c', 'd', 'e', 'f', 'g', 'm', 'n', 'p', 'w', 'x', 'y'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <Button 
          variant="ghost" 
          className="mb-8 hover:translate-x-1 transition-transform"
          onClick={() => navigate('/')}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Back to Demo
        </Button>

        <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          About Our CAPTCHA Recognition Tool
        </h1>

        <div className="grid gap-6 mt-12">
          <Card className="p-6 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Welcome to the CAPTCHA Predictor</h2>
            <p className="text-gray-600 leading-relaxed">
              This tool demonstrates the capabilities of deep learning in recognizing CAPTCHA text.
              You can upload a CAPTCHA image, and our system will attempt to predict and display the text it contains.
              The accuracy heavily depends on the characteristics of the uploaded image, as our model was trained on a very specific format.
            </p>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Model Specifications & Limitations</h2>
            <div className="space-y-4">
              <div className="bg-secondary/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Image Requirements</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Width: <span className="font-medium">exactly 200 pixels</span></li>
                  <li>Height: <span className="font-medium">exactly 50 pixels</span></li>
                  <li>CAPTCHA Length: <span className="font-medium">exactly 5 characters</span></li>
                </ul>
                <p className="mt-3 text-gray-600">
                  Images with significantly different dimensions may not be processed correctly.
                </p>
              </div>
              
              <div className="bg-secondary/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Supported Characters</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {allowedCharacters.map(char => (
                    <span 
                      key={char} 
                      className="bg-primary/10 px-3 py-1 rounded-md font-mono text-primary"
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600">
                  The model cannot recognize other numbers (like 0, 1, 9), other lowercase letters, 
                  any uppercase letters, or special symbols. This limitation is rooted in the model's 
                  training process, as it was only exposed to these specific 19 characters.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-success/10 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Purpose & Ethical Use</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              This tool is intended primarily for <span className="font-medium">educational and research purposes</span>, 
              serving as a practical example of applying machine learning techniques to image recognition challenges. 
              It showcases both the capabilities and inherent limitations of such systems.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This tool is <span className="font-medium">explicitly NOT intended</span> for circumventing security measures 
              on live websites or for any malicious activity. We strongly advocate for the ethical use of technology, 
              and attempting to bypass CAPTCHA security controls automatically is discouraged and often violates website 
              terms of service. Please use this predictor responsibly.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;