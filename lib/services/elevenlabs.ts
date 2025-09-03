/**
 * ElevenLabs Service
 * 
 * This service handles integration with the ElevenLabs API for advanced
 * audio analysis and processing.
 */

import { ApiService } from './api';
import { API_CONFIG, FEATURE_FLAGS } from '../config/api';

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

interface SimilarityResult {
  similarity: number;
  matchedSegments: {
    queryStart: number;
    queryEnd: number;
    referenceStart: number;
    referenceEnd: number;
    confidence: number;
  }[];
}

class ElevenLabsService {
  private apiService: ApiService;
  
  constructor() {
    this.apiService = new ApiService({
      baseUrl: API_CONFIG.elevenlabs.baseUrl,
      defaultHeaders: {
        'xi-api-key': API_CONFIG.elevenlabs.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: API_CONFIG.elevenlabs.timeout,
      maxRetries: API_CONFIG.elevenlabs.maxRetries,
    });
  }
  
  /**
   * Extract audio features from a sample
   */
  async extractAudioFeatures(audioFile: File): Promise<AudioFeatures> {
    // If feature flag is disabled, return mock data
    if (!FEATURE_FLAGS.useRealAudioAnalysis) {
      return this.getMockAudioFeatures();
    }
    
    try {
      // Convert audio file to base64
      const base64Audio = await this.fileToBase64(audioFile);
      
      // Note: This is a hypothetical endpoint as ElevenLabs doesn't currently
      // have a public audio analysis API. This would need to be updated with
      // the actual endpoint once available.
      const response = await this.apiService.post('/v1/audio/analysis', {
        audio: base64Audio,
        audio_name: audioFile.name,
      });
      
      return response as AudioFeatures;
    } catch (error) {
      console.error('Error extracting audio features:', error);
      return this.getMockAudioFeatures();
    }
  }
  
  /**
   * Compare two audio samples for similarity
   */
  async compareSamples(queryAudio: File, referenceAudio: File): Promise<SimilarityResult> {
    // If feature flag is disabled, return mock data
    if (!FEATURE_FLAGS.useRealAudioAnalysis) {
      return this.getMockSimilarityResult();
    }
    
    try {
      // Convert audio files to base64
      const queryBase64 = await this.fileToBase64(queryAudio);
      const referenceBase64 = await this.fileToBase64(referenceAudio);
      
      // Note: This is a hypothetical endpoint
      const response = await this.apiService.post('/v1/audio/compare', {
        query_audio: queryBase64,
        reference_audio: referenceBase64,
      });
      
      return response as SimilarityResult;
    } catch (error) {
      console.error('Error comparing samples:', error);
      return this.getMockSimilarityResult();
    }
  }
  
  /**
   * Helper method to convert File to base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:audio/mp3;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }
  
  /**
   * Mock data for audio features when API is not available
   */
  private getMockAudioFeatures(): AudioFeatures {
    return {
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
    };
  }
  
  /**
   * Mock data for similarity results when API is not available
   */
  private getMockSimilarityResult(): SimilarityResult {
    return {
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
}

export const elevenlabsService = new ElevenLabsService();

