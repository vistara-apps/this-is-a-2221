/**
 * Type Definitions
 * 
 * This file contains type definitions for the application.
 */

// Subscription Tier
export type SubscriptionTier = 'free' | 'pro' | 'premium';

// User
export interface User {
  userId: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  paymentInfo?: {
    customerId: string;
    defaultPaymentMethod?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Project
export interface Project {
  projectId: string;
  userId: string;
  trackName: string;
  uploadedSampleFile: string;
  identifiedSourceTrack?: string;
  rightsHolderInfo?: string;
  clearanceStatus: 'pending' | 'in_progress' | 'cleared' | 'rejected';
  negotiationLog?: string;
  riskScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Sample Segment
export interface SampleSegment {
  segmentId: string;
  projectId: string;
  startTime: number;
  endTime: number;
  originalArtist: string;
  rightsHolderContact: string;
}

// Negotiation Attempt
export interface NegotiationAttempt {
  attemptId: string;
  segmentId: string;
  contactedRightsHolder: string;
  dateSent: Date;
  content: string;
  response?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
}

// Offer
export interface Offer {
  id: string;
  projectId: string;
  date: Date;
  type: 'flat' | 'royalty' | 'hybrid';
  flatFee?: number;
  royaltyPercentage?: number;
  advanceAmount?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  notes?: string;
  counterOffer?: {
    flatFee?: number;
    royaltyPercentage?: number;
    advanceAmount?: number;
    notes?: string;
  };
}

// Document
export interface Document {
  id: string;
  projectId: string;
  name: string;
  type: 'clearance_request' | 'agreement' | 'usage_documentation';
  content: string;
  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
  signedBy?: string;
  signatureDataUrl?: string;
}

// Audit Event
export interface AuditEvent {
  id: string;
  projectId: string;
  timestamp: Date;
  action: string;
  user: string;
  details: string;
  category: 'upload' | 'identification' | 'negotiation' | 'offer' | 'document' | 'status';
  metadata?: any;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Audio Analysis Result
export interface AudioAnalysisResult {
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

// Risk Assessment Result
export interface RiskAssessmentResult {
  totalScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  factors: {
    name: string;
    weight: number;
    score: number;
    impact: 'high' | 'medium' | 'low';
    description: string;
    mitigation?: string;
  }[];
  potentialIssues: string[];
  mitigationStrategies: string[];
}
