/**
 * AudioWaveform Component
 * 
 * This component visualizes audio data as a waveform and allows for
 * segment selection and playback control.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Scissors } from 'lucide-react';

interface AudioWaveformProps {
  audioFile: File;
  segments?: {
    start: number;
    end: number;
    confidence: number;
  }[];
  onSegmentSelect?: (start: number, end: number) => void;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  showControls?: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioFile,
  segments = [],
  onSegmentSelect,
  height = 128,
  waveColor = 'hsl(217, 30%, 70%)',
  progressColor = 'hsl(222, 100%, 50%)',
  showControls = true,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  
  // Create audio URL from file
  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioFile]);
  
  // Initialize audio element
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      const audio = audioRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioUrl]);
  
  // Draw waveform (simplified version - in a real app, use a library like wavesurfer.js)
  useEffect(() => {
    if (waveformRef.current && audioUrl) {
      // In a real implementation, we would use a library like wavesurfer.js
      // For now, we'll just draw a simple placeholder waveform
      const canvas = document.createElement('canvas');
      const container = waveformRef.current;
      container.innerHTML = '';
      
      canvas.width = container.clientWidth;
      canvas.height = height;
      container.appendChild(canvas);
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw background
        ctx.fillStyle = 'hsl(217, 30%, 95%)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw a placeholder waveform
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        // Generate random waveform
        const points = 100;
        const step = canvas.width / points;
        
        for (let i = 0; i <= points; i++) {
          const x = i * step;
          const y = (height / 2) + (Math.random() * 30 - 15);
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, height / 2);
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw segments if available
        if (segments.length > 0) {
          segments.forEach(segment => {
            const startX = (segment.start / duration) * canvas.width;
            const endX = (segment.end / duration) * canvas.width;
            const segmentWidth = endX - startX;
            
            ctx.fillStyle = `rgba(35, 91, 216, ${segment.confidence / 100})`;
            ctx.fillRect(startX, 0, segmentWidth, height);
          });
        }
        
        // Draw selection if available
        if (selectionStart !== null && selectionEnd !== null) {
          const startX = (selectionStart / duration) * canvas.width;
          const endX = (selectionEnd / duration) * canvas.width;
          const selectionWidth = endX - startX;
          
          ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
          ctx.fillRect(startX, 0, selectionWidth, height);
        }
        
        // Draw progress
        const progressWidth = (currentTime / duration) * canvas.width;
        ctx.fillStyle = progressColor;
        ctx.fillRect(0, 0, progressWidth, 4);
      }
    }
  }, [waveformRef, audioUrl, height, waveColor, progressColor, currentTime, duration, segments, selectionStart, selectionEnd]);
  
  // Handle play/pause
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle seeking
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (waveformRef.current && audioRef.current) {
      const rect = waveformRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const seekTime = (clickPosition / rect.width) * duration;
      
      if (isSelecting) {
        // If we're selecting, set the end point
        setSelectionEnd(seekTime);
        setIsSelecting(false);
        
        // Call the callback if both start and end are set
        if (selectionStart !== null && onSegmentSelect) {
          onSegmentSelect(selectionStart, seekTime);
        }
      } else {
        // Otherwise, start a new selection or seek
        if (e.shiftKey) {
          // Start selection
          setSelectionStart(seekTime);
          setSelectionEnd(null);
          setIsSelecting(true);
        } else {
          // Just seek
          audioRef.current.currentTime = seekTime;
        }
      }
    }
  };
  
  // Handle segment selection
  const selectSegment = (start: number, end: number) => {
    setSelectionStart(start);
    setSelectionEnd(end);
    
    if (audioRef.current) {
      audioRef.current.currentTime = start;
    }
    
    if (onSegmentSelect) {
      onSegmentSelect(start, end);
    }
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="space-y-2">
      <audio ref={audioRef} src={audioUrl} />
      
      <div
        ref={waveformRef}
        className="w-full rounded-lg overflow-hidden cursor-pointer"
        style={{ height: `${height}px` }}
        onClick={handleWaveformClick}
      />
      
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => audioRef.current && (audioRef.current.currentTime = Math.max(0, currentTime - 5))}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            
            <button
              onClick={togglePlayback}
              className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => audioRef.current && (audioRef.current.currentTime = Math.min(duration, currentTime + 5))}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-sm text-text-secondary">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          {onSegmentSelect && (
            <button
              onClick={() => {
                setIsSelecting(!isSelecting);
                if (!isSelecting) {
                  setSelectionStart(null);
                  setSelectionEnd(null);
                }
              }}
              className={`p-2 rounded-md flex items-center space-x-1 ${
                isSelecting ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-primary'
              } transition-colors`}
            >
              <Scissors className="w-4 h-4" />
              <span className="text-sm font-medium">{isSelecting ? 'Cancel Selection' : 'Select Segment'}</span>
            </button>
          )}
        </div>
      )}
      
      {segments.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-medium text-text-primary">Detected Segments</h4>
          <div className="space-y-1">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => selectSegment(segment.start, segment.end)}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${segment.confidence >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm text-text-primary">
                    Segment {index + 1}: {formatTime(segment.start)} - {formatTime(segment.end)}
                  </span>
                </div>
                <span className="text-xs font-medium text-text-secondary">
                  {segment.confidence}% match
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

