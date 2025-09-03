/**
 * API Configuration
 * 
 * This file contains configuration for all external API integrations.
 * In a production environment, these values would be loaded from environment variables.
 */

export const API_CONFIG = {
  // OpenAI API configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
    baseUrl: 'https://api.openai.com',
    model: 'gpt-4',
    audioModel: 'whisper-1',
    maxRetries: 3,
    timeout: 30000, // 30 seconds
  },
  
  // ElevenLabs API configuration
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || 'your-elevenlabs-api-key',
    baseUrl: 'https://api.elevenlabs.io',
    maxRetries: 3,
    timeout: 60000, // 60 seconds
  },
  
  // Stripe API configuration
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'your-stripe-publishable-key',
    secretKey: process.env.STRIPE_SECRET_KEY || 'your-stripe-secret-key',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'your-stripe-webhook-secret',
    products: {
      free: 'prod_free',
      pro: 'prod_pro',
      premium: 'prod_premium',
    },
    prices: {
      free: 'price_free',
      pro: 'price_pro_monthly',
      premium: 'price_premium_monthly',
    },
  },
  
  // Sample identification API configuration
  sampleIdentification: {
    confidenceThreshold: 70, // Minimum confidence score to consider a match valid
    maxResults: 5, // Maximum number of results to return
    minSegmentDuration: 1.5, // Minimum duration of a sample segment in seconds
  },
};

// Feature flags for enabling/disabling specific features
export const FEATURE_FLAGS = {
  useRealAudioAnalysis: false, // Set to true to use real API calls instead of mock data
  enableStripeIntegration: false, // Set to true to enable Stripe integration
  enableAdvancedRiskAssessment: true, // Set to true to enable advanced risk assessment
  enableRealTimeNegotiation: false, // Set to true to enable real-time negotiation features
};

// Subscription tier feature limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    searches: 3,
    projects: 5,
    negotiationTemplates: 2,
    exportFormats: ['txt'],
  },
  pro: {
    searches: Infinity,
    projects: Infinity,
    negotiationTemplates: 10,
    exportFormats: ['txt', 'pdf'],
  },
  premium: {
    searches: Infinity,
    projects: Infinity,
    negotiationTemplates: Infinity,
    exportFormats: ['txt', 'pdf', 'doc'],
  },
};

