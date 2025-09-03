/**
 * FileUpload Component
 * 
 * This component handles file uploads with drag and drop support,
 * file validation, and progress tracking.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, AlertTriangle, Check } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  description?: string;
  multiple?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = 'audio/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  label = 'Upload Audio File',
  description = 'Drag and drop your audio file here, or click to browse',
  multiple = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  // Validate file
  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      setError(`File size exceeds the maximum limit of ${formatFileSize(maxSize)}`);
      return false;
    }
    
    // Check file type
    if (accept !== '*' && !isFileTypeAccepted(file, accept)) {
      setError(`File type not accepted. Please upload ${accept.replace('*', '')} files`);
      return false;
    }
    
    setError(null);
    return true;
  }, [accept, maxSize]);
  
  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile]);
  
  // Handle file selection via input
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile]);
  
  // Handle click on upload area
  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  // Remove selected file
  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);
  
  // Helper function to check if file type is accepted
  const isFileTypeAccepted = (file: File, acceptString: string): boolean => {
    if (acceptString === '*') return true;
    
    const acceptTypes = acceptString.split(',').map(type => type.trim());
    const fileType = file.type;
    
    return acceptTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.replace('/*', '');
        return fileType.startsWith(category + '/');
      }
      return type === fileType;
    });
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
          ${selectedFile ? 'bg-gray-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          multiple={multiple}
          className="hidden"
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-200 rounded-md">
                <File className="w-6 h-6 text-text-secondary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">{selectedFile.name}</p>
                <p className="text-sm text-text-secondary">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 text-text-secondary hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-text-secondary" />
            </div>
            <div>
              <p className="font-medium text-text-primary">{label}</p>
              <p className="text-sm text-text-secondary mt-1">{description}</p>
              <p className="text-xs text-text-secondary mt-2">
                Max file size: {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-start space-x-2 text-red-600">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {selectedFile && !error && (
        <div className="mt-2 flex items-start space-x-2 text-green-600">
          <Check className="w-4 h-4 mt-0.5" />
          <span className="text-sm">File ready for upload</span>
        </div>
      )}
    </div>
  );
};

