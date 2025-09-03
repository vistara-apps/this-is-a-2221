/**
 * useAudioAnalysis Hook
 * 
 * This hook provides functionality for analyzing audio files to identify samples
 * and extract relevant metadata.
 */

import { useState } from 'react';
import { openaiService } from '../services/openai';
import { elevenlabsService } from '../services/elevenlabs';
import { FEATURE_FLAGS } from '../config/api';

interface AudioAnalysisResult {
  sourceTrack: string;
  confidence: number;
  rightsHolder: string;
  originalArtist: string;
  releaseYear: number;
  label: string;
  matchSegments: {
    start: number;
    end: number;
    confidence: number;
  }[];
  riskScore: number;
}

interface AudioFeatures {
  tempo: number;
  key: string;
  scale: string;
  instruments: string[];
  segments: {
    start: number;
    end: number;
    type: string;
    confidence: number;
  }[];
}

export function useAudioAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AudioAnalysisResult | null>(null);
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(null);
  
  /**
   * Analyze an audio file to identify samples
   */
  const analyzeSample = async (audioFile: File): Promise<AudioAnalysisResult> => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      let result: AudioAnalysisResult;
      
      if (FEATURE_FLAGS.useRealAudioAnalysis) {
        // Use real API calls
        result = await openaiService.analyzeSample(audioFile);
        
        // Extract audio features
        const features = await elevenlabsService.extractAudioFeatures(audioFile);
        setAudioFeatures(features);
      } else {
        // Use mock data with a delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        result = {
          sourceTrack: 'Funky Drummer - James Brown',
          confidence: 94,
          rightsHolder: 'Universal Music Group',
          originalArtist: 'James Brown',
          releaseYear: 1970,
          label: 'Polydor Records',
          matchSegments: [
            { start: 12.5, end: 16.8, confidence: 94 },
            { start: 45.2, end: 48.1, confidence: 89 }
          ],
          riskScore: 75
        };
        
        // Mock audio features
        setAudioFeatures({
          tempo: 96,
          key: 'C',
          scale: 'minor',
          instruments: ['drums', 'bass', 'guitar', 'vocals'],
          segments: [
            { start: 0, end: 12.5, type: 'intro', confidence: 0.95 },
            { start: 12.5, end: 42.8, type: 'verse', confidence: 0.92 },
            { start: 42.8, end: 73.1, type: 'chorus', confidence: 0.97 },
            { start: 73.1, end: 103.4, type: 'verse', confidence: 0.93 },
            { start: 103.4, end: 133.7, type: 'chorus', confidence: 0.96 },
            { start: 133.7, end: 164.0, type: 'outro', confidence: 0.91 }
          ]
        });
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      setAnalysisResult(result);
      
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  /**
   * Compare two audio files for similarity
   */
  const compareSamples = async (queryAudio: File, referenceAudio: File) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      let result;
      
      if (FEATURE_FLAGS.useRealAudioAnalysis) {
        // Use real API call
        result = await elevenlabsService.compareSamples(queryAudio, referenceAudio);
      } else {
        // Use mock data with a delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        result = {
          similarity: 0.87,
          matchedSegments: [
            {
              queryStart: 12.5,
              queryEnd: 16.8,
              referenceStart: 73.2,
              referenceEnd: 77.5,
              confidence: 0.94
            },
            {
              queryStart: 45.2,
              queryEnd: 48.1,
              referenceStart: 103.8,
              referenceEnd: 106.7,
              confidence: 0.89
            }
          ]
        };
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred during comparison');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  /**
   * Reset analysis state
   */
  const resetAnalysis = () => {
    setIsAnalyzing(false);
    setProgress(0);
    setError(null);
    setAnalysisResult(null);
    setAudioFeatures(null);
  };
  
  return {
    analyzeSample,
    compareSamples,
    resetAnalysis,
    isAnalyzing,
    progress,
    error,
    analysisResult,
    audioFeatures,
  };
}
