/**
 * OpenAI Service
 * 
 * This service handles integration with the OpenAI API for audio analysis
 * and natural language processing.
 */

import { ApiService } from './api';
import { API_CONFIG, FEATURE_FLAGS } from '../config/api';

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

interface MessageContent {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompletionResult {
  text: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenAIService {
  private apiService: ApiService;
  
  constructor() {
    this.apiService = new ApiService({
      baseUrl: API_CONFIG.openai.baseUrl,
      defaultHeaders: {
        'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
      },
      timeout: API_CONFIG.openai.timeout,
      maxRetries: API_CONFIG.openai.maxRetries,
    });
  }
  
  /**
   * Analyze an audio file to identify samples
   */
  async analyzeSample(audioFile: File): Promise<AudioAnalysisResult> {
    // If feature flag is disabled, return mock data
    if (!FEATURE_FLAGS.useRealAudioAnalysis) {
      return this.getMockAnalysisResult();
    }
    
    try {
      // Create form data with audio file
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', API_CONFIG.openai.audioModel);
      formData.append('response_format', 'json');
      
      // First, transcribe the audio to get a text representation
      const transcriptionResponse = await fetch(`${API_CONFIG.openai.baseUrl}/v1/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
        },
        body: formData,
      });
      
      if (!transcriptionResponse.ok) {
        throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`);
      }
      
      const transcription = await transcriptionResponse.json();
      
      // Now use the GPT model to analyze the transcription and identify samples
      const analysisPrompt = `
        You are an expert music sample identifier. Analyze the following audio transcription and identify:
        1. The original source track
        2. The artist
        3. The release year
        4. The record label
        5. The rights holder
        6. The specific segments that match (timestamps)
        7. A risk score (0-100) for clearance difficulty
        
        Transcription: ${transcription.text}
        
        Respond in JSON format with the following structure:
        {
          "sourceTrack": "Track Name",
          "confidence": 85,
          "originalArtist": "Artist Name",
          "releaseYear": 1990,
          "label": "Record Label",
          "rightsHolder": "Rights Holder Company",
          "matchSegments": [
            { "start": 12.5, "end": 16.8, "confidence": 90 }
          ],
          "riskScore": 75
        }
      `;
      
      const messages: MessageContent[] = [
        { role: 'system', content: 'You are a music sample identification expert.' },
        { role: 'user', content: analysisPrompt }
      ];
      
      const completionResponse = await this.apiService.post('/v1/chat/completions', {
        model: API_CONFIG.openai.model,
        messages,
        temperature: 0.2,
        max_tokens: 1000,
      });
      
      // Parse the response to extract the JSON
      const responseContent = completionResponse.choices[0].message.content;
      const analysisResult = JSON.parse(responseContent);
      
      return analysisResult;
    } catch (error) {
      console.error('Error analyzing sample:', error);
      // Fall back to mock data if API call fails
      return this.getMockAnalysisResult();
    }
  }
  
  /**
   * Generate a negotiation message template based on project details
   */
  async generateNegotiationTemplate(
    projectName: string,
    sampleInfo: string,
    rightsHolder: string,
    purpose: string
  ): Promise<string> {
    try {
      const prompt = `
        Generate a professional email template for requesting sample clearance with the following details:
        - Project/Track Name: ${projectName}
        - Sample Information: ${sampleInfo}
        - Rights Holder: ${rightsHolder}
        - Intended Use: ${purpose}
        
        The email should be polite, professional, and include all necessary information for the rights holder to make a decision.
        It should also include placeholders for specific offer terms.
      `;
      
      const messages: MessageContent[] = [
        { role: 'system', content: 'You are a music licensing expert who helps artists clear samples.' },
        { role: 'user', content: prompt }
      ];
      
      const completionResponse = await this.apiService.post('/v1/chat/completions', {
        model: API_CONFIG.openai.model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      return completionResponse.choices[0].message.content;
    } catch (error) {
      console.error('Error generating negotiation template:', error);
      return this.getMockNegotiationTemplate(projectName, sampleInfo, rightsHolder, purpose);
    }
  }
  
  /**
   * Analyze a negotiation response to determine sentiment and next steps
   */
  async analyzeNegotiationResponse(response: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    nextSteps: string;
    suggestedReply: string;
  }> {
    try {
      const prompt = `
        Analyze the following response from a rights holder regarding sample clearance:
        
        "${response}"
        
        Provide an analysis with:
        1. The sentiment (positive, neutral, or negative)
        2. Suggested next steps
        3. A draft reply that addresses any concerns or questions
        
        Format your response as JSON:
        {
          "sentiment": "positive|neutral|negative",
          "nextSteps": "Detailed next steps",
          "suggestedReply": "Draft reply text"
        }
      `;
      
      const messages: MessageContent[] = [
        { role: 'system', content: 'You are a music licensing expert who helps artists clear samples.' },
        { role: 'user', content: prompt }
      ];
      
      const completionResponse = await this.apiService.post('/v1/chat/completions', {
        model: API_CONFIG.openai.model,
        messages,
        temperature: 0.3,
        max_tokens: 1000,
      });
      
      // Parse the response to extract the JSON
      const responseContent = completionResponse.choices[0].message.content;
      return JSON.parse(responseContent);
    } catch (error) {
      console.error('Error analyzing negotiation response:', error);
      return {
        sentiment: 'neutral',
        nextSteps: 'Consider following up in a week if no further response is received.',
        suggestedReply: 'Thank you for your response. I appreciate your consideration and look forward to discussing this further.'
      };
    }
  }
  
  /**
   * Mock data for sample analysis when API is not available
   */
  private getMockAnalysisResult(): AudioAnalysisResult {
    return {
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
  }
  
  /**
   * Mock negotiation template when API is not available
   */
  private getMockNegotiationTemplate(
    projectName: string,
    sampleInfo: string,
    rightsHolder: string,
    purpose: string
  ): string {
    return `
Subject: Sample Clearance Request for "${projectName}"

Dear ${rightsHolder},

I hope this email finds you well. My name is [Your Name], and I am reaching out regarding a sample clearance request for my upcoming project.

Project Details:
- Track Name: ${projectName}
- Sample Used: ${sampleInfo}
- Intended Use: ${purpose}

I am interested in obtaining proper clearance for this sample and would like to discuss the terms for licensing. I am prepared to offer [Royalty Percentage/Flat Fee] for the use of this sample.

Please let me know if you require any additional information or if there are specific procedures I should follow for this request.

Thank you for your time and consideration. I look forward to your response.

Best regards,
[Your Name]
[Your Contact Information]
    `;
  }
}

export const openaiService = new OpenAIService();

