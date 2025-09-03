export interface User {
  userId: string;
  email: string;
  subscriptionTier: 'free' | 'pro' | 'premium';
  paymentInfo?: any;
}

export interface Project {
  projectId: string;
  userId: string;
  trackName: string;
  uploadedSampleFile?: File;
  identifiedSourceTrack?: string;
  rightsHolderInfo?: string;
  clearanceStatus: 'pending' | 'identified' | 'negotiating' | 'cleared' | 'rejected';
  negotiationLog: NegotiationAttempt[];
  riskScore?: number;
  createdAt: Date;
}

export interface SampleSegment {
  segmentId: string;
  projectId: string;
  startTime: number;
  endTime: number;
  originalArtist?: string;
  rightsHolderContact?: string;
}

export interface NegotiationAttempt {
  attemptId: string;
  segmentId?: string;
  projectId: string;
  contactedRightsHolder: string;
  dateSent: Date;
  content: string;
  response?: string;
  status: 'sent' | 'responded' | 'accepted' | 'rejected';
}

export interface SubscriptionTier {
  name: string;
  price: number;
  features: string[];
  limits: {
    searches: number | 'unlimited';
    projects: number | 'unlimited';
  };
}