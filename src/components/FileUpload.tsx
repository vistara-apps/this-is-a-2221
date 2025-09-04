import React, { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  variant?: 'dragDrop' | 'browse';
  acceptedTypes?: string;
  maxSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  variant = 'dragDrop',
  acceptedTypes = 'audio/*',
  maxSize = 50
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    setError('');
    
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return false;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
  };

  if (variant === 'browse') {
    return (
      <div className="space-y-4">
        <label className="block">
          <input
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            className="sr-only"
          />
          <div className="btn-primary cursor-pointer inline-flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Browse Files</span>
          </div>
        </label>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
            ${isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-gray-400'}`} />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Drop your audio file here
          </h3>
          <p className="text-text-secondary mb-4">
            Supports MP3, WAV, FLAC, and other audio formats up to {maxSize}MB
          </p>
          <label className="btn-primary cursor-pointer inline-flex items-center space-x-2">
            <input
              type="file"
              accept={acceptedTypes}
              onChange={handleInputChange}
              className="sr-only"
            />
            <span>Choose File</span>
          </label>
        </div>
      ) : (
        <div className="card flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <File className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium text-text-primary">{selectedFile.name}</p>
              <p className="text-sm text-text-secondary">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-2 text-text-secondary hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};