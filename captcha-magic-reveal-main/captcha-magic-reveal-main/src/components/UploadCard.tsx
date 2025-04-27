import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image, AlertCircle, X, FileImage } from "lucide-react";


interface UploadCardProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}


export const UploadCard = ({ onFileSelect, selectedFile }: UploadCardProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewError, setPreviewError] = useState(false);


  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };


  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.includes('image/')) {
      setPreviewError(false);
      onFileSelect(file);
    }
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewError(false);
      onFileSelect(file);
    }
  };


  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null as unknown as File);
    setPreviewError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const getFileSize = (file: File) => {
    const sizeInKB = file.size / 1024;
    return sizeInKB < 1024
      ? `${sizeInKB.toFixed(1)} KB`
      : `${(sizeInKB / 1024).toFixed(1)} MB`;
  };


  const getDropzoneClass = () => {
    if (selectedFile) return 'border-primary/30 bg-primary/5';
    if (isDragging) return 'border-primary border-solid bg-primary/10';
    return 'border-gray-200 hover:border-primary/60 hover:bg-primary/5';
  };


  return (
    <div className="mb-4">
      <div
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${getDropzoneClass()} ${
          !selectedFile ? 'cursor-pointer' : ''
        }`}
      >
        {selectedFile ? (
          <div className="space-y-6 transition-all duration-300 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileImage className="h-5 w-5 text-primary mr-2" />
                <p className="text-sm font-medium text-gray-600">CAPTCHA Image</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
           
            <div className="relative max-w-[220px] mx-auto group">
              {previewError ? (
                <div className="rounded-lg bg-red-50 p-6 flex flex-col items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                  <p className="text-sm text-red-600">Preview unavailable</p>
                </div>
              ) : (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected CAPTCHA"
                  className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                  onError={() => setPreviewError(true)}
                />
              )}
              <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <p className="text-xs font-medium">CAPTCHA Preview</p>
              </div>
            </div>
           
            <div className="flex justify-between text-xs text-gray-500 max-w-[220px] mx-auto">
              <p className="truncate max-w-[160px]" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p>{getFileSize(selectedFile)}</p>
            </div>
          </div>
        ) : (
          <div className="transition-all duration-300">
            <div className={`p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 ${
              isDragging ? 'bg-primary/20 scale-110' : 'bg-primary/10'
            } transition-all duration-300`}>
              <Upload
                className={`h-10 w-10 ${isDragging ? 'text-primary' : 'text-primary/80'}`}
                aria-hidden="true"
              />
            </div>
            <h3 className="text-lg font-medium mb-3">
              {isDragging ? 'Drop to upload' : 'Drop your CAPTCHA here'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Drag and drop your CAPTCHA image, or click to browse your files
            </p>
           
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-1 w-1 rounded-full bg-gray-300"></div>
              <p className="text-xs text-gray-400">JPG, PNG • 200x50px recommended</p>
              <div className="h-1 w-1 rounded-full bg-gray-300"></div>
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png,image/jpeg"
        className="hidden"
        aria-label="Upload CAPTCHA image"
      />
      {!selectedFile && (
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="mt-4 w-full border-primary/40 text-primary hover:bg-primary/10 transition-all duration-300"
        >
          <Image className="mr-2 h-4 w-4" />
          Select CAPTCHA File
        </Button>
      )}
    </div>
  );
};
