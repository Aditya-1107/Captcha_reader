import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Copy, Sparkles, ChevronRight } from "lucide-react";


interface ResultCardProps {
  text: string;
  confidence: number;
}


export const ResultCard = ({ text, confidence }: ResultCardProps) => {
  const confidencePercentage = confidence * 100;
 
  const getConfidenceLevel = () => {
    if (confidencePercentage >= 90) return { label: "High", color: "text-green-600" };
    if (confidencePercentage >= 70) return { label: "Good", color: "text-blue-600" };
    return { label: "Fair", color: "text-amber-600" };
  };
 
  const confidenceInfo = getConfidenceLevel();
 
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };


  return (
    <Card className="w-full overflow-hidden relative animate-scale-in border-none">
      {/* Top success indicator bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-green-400 to-primary"></div>
     
      <div className="p-6 bg-gradient-to-b from-success/20 to-success/5">
        <div className="flex items-center mb-6">
          <div className="bg-green-100 p-2 rounded-full mr-3 shadow-sm">
            <Check className="h-5 w-5 text-green-600 animate-scale-in" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Recognition Complete</h3>
            <p className="text-sm text-gray-500">CAPTCHA successfully processed</p>
          </div>
        </div>
       
        <div className="space-y-6 relative z-10">
          <div className="bg-white rounded-lg shadow-md transform hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-center p-3 border-b border-gray-100">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 text-primary mr-2" />
                <p className="text-sm font-medium text-gray-700">Recognized Text</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
            </div>
           
            <div className="p-4">
              <div className="bg-primary/5 py-6 px-4 rounded-md flex items-center justify-center">
                <p className="text-3xl font-mono font-medium tracking-widest text-gray-800">{text}</p>
              </div>
             
              <div className="mt-4 flex justify-end">
                <div className="bg-gray-50 px-3 py-1 rounded text-xs text-gray-500 flex items-center">
                  {text.length} characters <ChevronRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            </div>
          </div>
         
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">Recognition Confidence</p>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${confidenceInfo.color} mr-2`}>
                  {confidenceInfo.label}
                </span>
                <span className="text-sm font-bold">
                  {confidencePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
           
            <div className="relative">
              <Progress
                value={confidencePercentage}
                className="h-2.5 rounded-full overflow-hidden"
              />
             
              {/* Confidence level markers */}
              <div className="flex justify-between mt-1.5 text-xs text-gray-400 px-0.5">
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
              </div>
              <div className="flex justify-between mt-0.5 text-xs text-gray-400 px-0.5">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
     
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 z-0"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-100/50 rounded-full -ml-16 -mb-16 z-0"></div>
    </Card>
  );
};
