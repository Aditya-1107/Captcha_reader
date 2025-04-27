import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Image, AlertTriangle, Layers, BarChart, Check } from "lucide-react";

interface ModelSpecificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelSpecificationsModal: React.FC<ModelSpecificationsModalProps> = ({ isOpen, onClose }) => {
  const allowedCharacters = ['2', '3', '4', '5', '6', '7', '8', 'b', 'c', 'd', 'e', 'f', 'g', 'm', 'n', 'p', 'w', 'x', 'y'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6 max-h-[85vh] overflow-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-primary">Model Specifications</DialogTitle>
          </div>
          <DialogDescription className="mt-2 text-base">
            Important information about the CAPTCHA recognition model capabilities and limitations
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Image Requirements Section */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-secondary/10 p-3 border-b flex items-center gap-2">
              <Image className="h-4 w-4 text-secondary" />
              <h3 className="text-lg font-semibold text-secondary-foreground">Image Requirements</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2 bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Dimensions</div>
                  <div className="font-medium flex items-center">
                    <span className="text-lg">200 × 50</span>
                    <span className="text-xs ml-1 text-gray-500">pixels</span>
                  </div>
                  <div className="text-xs text-gray-500">Images must be exactly this size</div>
                </div>
                
                <div className="flex flex-col space-y-2 bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Character Length</div>
                  <div className="font-medium flex items-center">
                    <span className="text-lg">5</span>
                    <span className="text-xs ml-1 text-gray-500">characters</span>
                  </div>
                  <div className="text-xs text-gray-500">Only recognizes 5-character CAPTCHAs</div>
                </div>
              </div>
              
              <div className="mt-4 text-sm bg-amber-50 p-3 rounded-lg border border-amber-100 flex">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800">
                  Images with different dimensions or character counts will likely result in poor recognition accuracy.
                </p>
              </div>
            </div>
          </div>
          
          {/* Character Set Section */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-secondary/10 p-3 border-b flex items-center gap-2">
              <Layers className="h-4 w-4 text-secondary" />
              <h3 className="text-lg font-semibold text-secondary-foreground">Supported Character Set</h3>
            </div>
            <div className="p-4">
              <div className="mb-3 text-sm">
                The model is trained to recognize only the following 19 characters:
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {allowedCharacters.map(char => (
                  <span 
                    key={char} 
                    className="bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-md font-mono text-primary font-medium"
                  >
                    {char}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <div className="font-medium text-red-800 mb-1">Not Recognized:</div>
                  <ul className="list-disc list-inside space-y-1 text-red-700">
                    <li>Numbers: 0, 1, 9</li>
                    <li>Any uppercase letters</li>
                    <li>Other lowercase letters</li>
                    <li>Special characters or symbols</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="font-medium text-blue-800 mb-1">Why these limitations?</div>
                  <p className="text-blue-700">
                    The model was specifically trained on images containing only these 19 characters, so it hasn't learned to identify any others.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance & Accuracy */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-secondary/10 p-3 border-b flex items-center gap-2">
              <BarChart className="h-4 w-4 text-secondary" />
              <h3 className="text-lg font-semibold text-secondary-foreground">Performance & Accuracy</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg flex flex-col items-center">
                  <div className="text-5xl font-bold text-primary mb-1">95%</div>
                  <div className="text-sm text-gray-500 text-center">Accuracy on ideal images</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg flex flex-col items-center">
                  <div className="text-5xl font-bold text-primary mb-1">&lt;1s</div>
                  <div className="text-sm text-gray-500 text-center">Average processing time</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg flex flex-col items-center">
                  <div className="text-5xl font-bold text-primary mb-1">5/5</div>
                  <div className="text-sm text-gray-500 text-center">Character recognition</div>
                </div>
              </div>
              
              <div className="text-sm bg-green-50 p-3 rounded-lg border border-green-100 flex">
                <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-green-800">
                  Best results are achieved with clear, high-contrast CAPTCHA images that match the specified dimensions and character set.
                </p>
              </div>
            </div>
          </div>
          
          {/* Ethical Use Section */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm border-red-100">
            <div className="bg-red-50 p-3 border-b border-red-100 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3 className="text-lg font-semibold text-red-800">Ethical Use Statement</h3>
            </div>
            <div className="p-4">
              <p className="text-sm mb-3">
                This tool is intended for <strong>educational and research purposes</strong> only. 
                It demonstrates the capabilities and limitations of machine learning in image recognition tasks.
              </p>
              
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-3">
                <p className="text-sm text-red-800 font-medium">
                  Using this technology to bypass security measures on live websites is:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 text-sm text-red-700">
                  <li>Potentially illegal in many jurisdictions</li>
                  <li>Against the terms of service of most websites</li>
                  <li>Unethical and harmful to online security</li>
                </ul>
              </div>
              
              <p className="text-sm text-gray-600 italic">
                By using this tool, you acknowledge that you will only use it for legitimate educational purposes.
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t flex justify-end gap-3">
          <Button onClick={onClose} variant="primary" className="px-6">
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
