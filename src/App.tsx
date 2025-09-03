import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { AudioWaveform } from './components/AudioWaveform';
import { SampleSegmentEditor } from './components/SampleSegmentEditor';
import { RiskAssessment } from './components/RiskAssessment';
import { NegotiationTemplates } from './components/NegotiationTemplates';
import { OfferTracker } from './components/OfferTracker';
import { TimelineView } from './components/TimelineView';
import { ChatThread } from './components/ChatThread';
import { DocumentViewer } from './components/DocumentViewer';
import { AuditTrail } from './components/AuditTrail';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { useSampleSegments } from './hooks/useSampleSegments';
import { useRiskAssessment } from './hooks/useRiskAssessment';
import { useSubscription } from './hooks/useSubscription';
import { useErrorHandler } from './hooks/useErrorHandler';
import { Project, SampleSegment, NegotiationAttempt, Offer } from './types';

function App() {
  // State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [project, setProject] = useState<Project>({
    projectId: 'demo-project',
    userId: 'demo-user',
    trackName: 'My Remix Track',
    uploadedSampleFile: '',
    clearanceStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [negotiations, setNegotiations] = useState<NegotiationAttempt[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  
  // Hooks
  const { 
    analyzeSample, 
    isAnalyzing, 
    progress, 
    analysisResult 
  } = useAudioAnalysis();
  
  const { 
    segments, 
    addSegment, 
    updateSegment, 
    deleteSegment, 
    importFromAnalysis 
  } = useSampleSegments({
    projectId: project.projectId,
    onSegmentsChange: (newSegments) => {
      console.log('Segments updated:', newSegments);
    },
  });
  
  const { 
    riskScore, 
    riskLevel, 
    updateRiskScore 
  } = useRiskAssessment({
    sourceTrack: project.identifiedSourceTrack || '',
    originalArtist: segments[0]?.originalArtist || '',
    rightsHolder: project.rightsHolderInfo || '',
    initialRiskScore: project.riskScore,
    onRiskScoreChange: (score) => {
      setProject(prev => ({ ...prev, riskScore: score }));
    },
  });
  
  const { 
    subscriptionTier, 
    isFeatureAvailable 
  } = useSubscription({
    userId: project.userId,
    initialTier: 'pro', // For demo purposes
  });
  
  const { 
    showError, 
    handleError 
  } = useErrorHandler();
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setAudioFile(file);
    setProject(prev => ({ 
      ...prev, 
      trackName: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      uploadedSampleFile: URL.createObjectURL(file),
    }));
    
    try {
      // Analyze the sample
      const result = await analyzeSample(file);
      
      // Update project with analysis results
      setProject(prev => ({ 
        ...prev, 
        identifiedSourceTrack: result.sourceTrack,
        rightsHolderInfo: result.rightsHolder,
        riskScore: result.riskScore,
      }));
      
      // Import detected segments
      if (result.matchSegments && result.matchSegments.length > 0) {
        importFromAnalysis(result.matchSegments);
      }
    } catch (error) {
      handleError(error, 'Failed to analyze audio file');
    }
  };
  
  // Handle sending a negotiation message
  const handleSendMessage = async (message: string) => {
    // In a real app, this would send the message to the rights holder
    // For now, we'll just add it to the negotiations array
    const newNegotiation: NegotiationAttempt = {
      attemptId: Date.now().toString(),
      segmentId: segments[0]?.segmentId || 'unknown',
      contactedRightsHolder: project.rightsHolderInfo || 'Rights Holder',
      dateSent: new Date(),
      content: message,
      status: 'pending',
    };
    
    setNegotiations(prev => [...prev, newNegotiation]);
    
    // Simulate a response after 2 seconds
    setTimeout(() => {
      const response: NegotiationAttempt = {
        ...newNegotiation,
        attemptId: `response-${newNegotiation.attemptId}`,
        dateSent: new Date(),
        content: 'Thank you for your message. We will review your request and get back to you soon.',
        status: 'pending',
      };
      
      setNegotiations(prev => [...prev, response]);
    }, 2000);
  };
  
  // Handle analyzing a negotiation response
  const handleAnalyzeResponse = async (response: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    nextSteps: string;
    suggestedReply: string;
  }> => {
    try {
      return await openaiService.analyzeNegotiationResponse(response);
    } catch (error) {
      handleError(error, 'Failed to analyze response');
      return {
        sentiment: 'neutral',
        nextSteps: 'Consider following up in a week if no further response is received.',
        suggestedReply: 'Thank you for your response. I appreciate your consideration and look forward to discussing this further.'
      };
    }
  };
  
  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface shadow-sm">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">SampleFlow</h1>
            <div className="text-text-secondary">
              Subscription: <span className="font-medium">{subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8">
        <div className="space-y-8">
          {/* File Upload Section */}
          {!audioFile && (
            <section className="card">
              <h2 className="text-xl font-semibold text-text-primary mb-6">Upload Your Track</h2>
              <FileUpload
                onFileSelect={handleFileUpload}
                accept="audio/*"
                maxSize={20 * 1024 * 1024} // 20MB
                label="Upload Audio File"
                description="Drag and drop your audio file here, or click to browse"
              />
            </section>
          )}
          
          {/* Analysis Results Section */}
          {audioFile && analysisResult && (
            <section className="space-y-8">
              <div className="card">
                <h2 className="text-xl font-semibold text-text-primary mb-6">Sample Analysis Results</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-text-primary mb-2">Audio Waveform</h3>
                    <AudioWaveform
                      audioFile={audioFile}
                      segments={analysisResult.matchSegments}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-text-primary mb-2">Identified Sample</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-text-secondary">Source Track:</span>
                            <p className="font-medium text-text-primary">{analysisResult.sourceTrack}</p>
                          </div>
                          <div>
                            <span className="text-sm text-text-secondary">Confidence:</span>
                            <p className="font-medium text-text-primary">{analysisResult.confidence}%</p>
                          </div>
                          <div>
                            <span className="text-sm text-text-secondary">Original Artist:</span>
                            <p className="font-medium text-text-primary">{analysisResult.originalArtist}</p>
                          </div>
                          <div>
                            <span className="text-sm text-text-secondary">Release Year:</span>
                            <p className="font-medium text-text-primary">{analysisResult.releaseYear}</p>
                          </div>
                          <div>
                            <span className="text-sm text-text-secondary">Label:</span>
                            <p className="font-medium text-text-primary">{analysisResult.label}</p>
                          </div>
                          <div>
                            <span className="text-sm text-text-secondary">Rights Holder:</span>
                            <p className="font-medium text-text-primary">{analysisResult.rightsHolder}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sample Segments Editor */}
              <div className="card">
                <SampleSegmentEditor
                  audioFile={audioFile}
                  segments={segments}
                  onSegmentsChange={(newSegments) => {
                    console.log('Segments updated:', newSegments);
                  }}
                  detectedSegments={analysisResult.matchSegments}
                />
              </div>
              
              {/* Risk Assessment */}
              <RiskAssessment
                riskScore={riskScore}
                sourceTrack={analysisResult.sourceTrack}
                rightsHolder={analysisResult.rightsHolder}
                originalArtist={analysisResult.originalArtist}
                releaseYear={analysisResult.releaseYear}
                label={analysisResult.label}
                onUpdateRiskScore={updateRiskScore}
              />
              
              {/* Negotiation Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <NegotiationTemplates
                    projectName={project.trackName}
                    sampleInfo={analysisResult.sourceTrack}
                    rightsHolder={analysisResult.rightsHolder}
                    subscriptionTier={subscriptionTier}
                    onSelectTemplate={(content) => {
                      // In a real app, this would populate the message composer
                      console.log('Template selected:', content);
                    }}
                  />
                </div>
                
                <div className="card">
                  <ChatThread
                    projectName={project.trackName}
                    rightsHolder={analysisResult.rightsHolder}
                    initialMessages={[]}
                    onSendMessage={handleSendMessage}
                    onAnalyzeResponse={handleAnalyzeResponse}
                  />
                </div>
              </div>
              
              {/* Offer Tracker */}
              <div className="card">
                <OfferTracker
                  projectId={project.projectId}
                  rightsHolder={analysisResult.rightsHolder}
                  offers={offers}
                  onOffersChange={setOffers}
                />
              </div>
              
              {/* Timeline View */}
              <div className="card">
                <TimelineView
                  project={project}
                  negotiations={negotiations}
                  offers={offers}
                />
              </div>
              
              {/* Documentation */}
              <div className="card">
                <DocumentViewer
                  project={project}
                  segments={segments}
                  negotiations={negotiations}
                  subscriptionTier={subscriptionTier}
                />
              </div>
              
              {/* Audit Trail */}
              <div className="card">
                <AuditTrail
                  project={project}
                  negotiations={negotiations}
                  offers={offers}
                  subscriptionTier={subscriptionTier}
                />
              </div>
            </section>
          )}
        </div>
      </main>
      
      <footer className="bg-surface border-t border-gray-200 mt-12">
        <div className="container mx-auto py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-text-secondary text-sm">
              &copy; {new Date().getFullYear()} SampleFlow. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-text-secondary hover:text-primary text-sm">Terms of Service</a>
              <a href="#" className="text-text-secondary hover:text-primary text-sm">Privacy Policy</a>
              <a href="#" className="text-text-secondary hover:text-primary text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Mock openaiService for the demo
const openaiService = {
  analyzeNegotiationResponse: async (response: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    nextSteps: string;
    suggestedReply: string;
  }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      sentiment: 'positive' as const,
      nextSteps: 'Follow up with specific details about your project and how you plan to use the sample.',
      suggestedReply: 'Thank you for your prompt response. I appreciate your interest in my project. I would be happy to provide more details about how I plan to use the sample in my track. The sample will be used as a [describe usage] and I plan to release the track [describe release plans]. Would you be open to discussing specific terms for clearance?'
    };
  }
};

export default App;
