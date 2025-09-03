/**
 * DigitalSignature Component
 * 
 * This component allows users to sign documents digitally for
 * sample clearance agreements.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Download, Check } from 'lucide-react';

interface DigitalSignatureProps {
  onSignatureCapture: (signatureDataUrl: string) => void;
  initialSignature?: string;
  width?: number;
  height?: number;
}

export const DigitalSignature: React.FC<DigitalSignatureProps> = ({
  onSignatureCapture,
  initialSignature,
  width = 400,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Set canvas style
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#000';
    
    // Clear canvas
    context.fillStyle = '#f9fafb';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    context.strokeStyle = '#e5e7eb';
    context.lineWidth = 1;
    context.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Reset stroke style for drawing
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    
    // Load initial signature if provided
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, [width, height, initialSignature]);
  
  // Handle mouse/touch events
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    setIsDrawing(true);
    
    const position = getEventPosition(e, canvas);
    setLastPosition(position);
    
    // Start new path
    context.beginPath();
    context.moveTo(position.x, position.y);
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const position = getEventPosition(e, canvas);
    
    // Draw line
    context.beginPath();
    context.moveTo(lastPosition.x, lastPosition.y);
    context.lineTo(position.x, position.y);
    context.stroke();
    
    setLastPosition(position);
    setHasSignature(true);
  };
  
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      
      // Capture signature
      if (hasSignature && canvasRef.current) {
        const signatureDataUrl = canvasRef.current.toDataURL('image/png');
        onSignatureCapture(signatureDataUrl);
      }
    }
  };
  
  // Helper function to get position from mouse or touch event
  const getEventPosition = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };
  
  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Clear canvas
    context.fillStyle = '#f9fafb';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    context.strokeStyle = '#e5e7eb';
    context.lineWidth = 1;
    context.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Reset stroke style for drawing
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    
    setHasSignature(false);
    onSignatureCapture('');
  };
  
  // Download signature
  const downloadSignature = () => {
    if (!canvasRef.current || !hasSignature) return;
    
    const signatureDataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = signatureDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-text-primary">Digital Signature</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearSignature}
            className="p-2 text-text-secondary hover:text-red-500 transition-colors"
            title="Clear Signature"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={downloadSignature}
            disabled={!hasSignature}
            className={`p-2 ${
              hasSignature 
                ? 'text-text-secondary hover:text-text-primary' 
                : 'text-gray-300 cursor-not-allowed'
            } transition-colors`}
            title="Download Signature"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded-lg cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          width={width}
          height={height}
        />
        
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-text-secondary text-sm">Sign here</p>
          </div>
        )}
      </div>
      
      {hasSignature && (
        <div className="flex items-center text-green-500 text-sm">
          <Check className="w-4 h-4 mr-1" />
          <span>Signature captured</span>
        </div>
      )}
    </div>
  );
};

