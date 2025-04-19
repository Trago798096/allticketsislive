
import React, { useState, useRef } from "react";
import { Button } from "./button";
import { Upload, FileCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeInMB?: number;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  accept = "image/*",
  maxSizeInMB = 5,
  className,
  id,
  ...props
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type if accept is provided
    if (accept && accept !== "*") {
      const fileType = file.type;
      const acceptedTypes = accept.split(",").map(type => type.trim());
      
      // Handle wildcards like image/* or audio/*
      const isTypeAccepted = acceptedTypes.some(type => {
        if (type.endsWith("/*")) {
          const category = type.split("/")[0];
          return fileType.startsWith(`${category}/`);
        }
        return type === fileType;
      });

      if (!isTypeAccepted) {
        setFileError(`File type not supported. Please upload ${accept} files.`);
        return false;
      }
    }

    // Check file size
    if (file.size > maxSizeInBytes) {
      setFileError(`File is too large. Maximum size is ${maxSizeInMB}MB.`);
      return false;
    }

    setFileError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-gray-300 bg-gray-50",
          fileError ? "border-red-400" : "",
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          id={id}
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          {...props}
        />

        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          {selectedFile ? (
            <>
              <FileCheck className="w-8 h-8 mb-2 text-green-500" />
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
              </p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="text-sm font-medium">
                Drag & drop your file here, or{" "}
                <span className="text-primary cursor-pointer" onClick={handleButtonClick}>
                  browse
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {accept === "image/*" ? "Supported formats: JPEG, PNG, GIF" : accept}
              </p>
              <p className="text-xs text-gray-500">Max size: {maxSizeInMB}MB</p>
            </>
          )}
        </div>
      </div>
      
      {fileError && (
        <div className="flex items-center mt-2 text-red-600 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>{fileError}</span>
        </div>
      )}

      {selectedFile && (
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            className="w-full text-sm"
          >
            Choose another file
          </Button>
        </div>
      )}
    </div>
  );
};
