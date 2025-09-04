import React, { useState } from 'react';
import { ArrowLeft, Loader, Music, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { useApp } from '../contexts/AppContext';
import { Project, NegotiationAttempt } from '../types';

export const SampleIdentification: React.FC = () => {
  const { addProject, setCurrentProject } = useApp();
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    setCurrentStep('analyzing');
    
    // Simulate API call to identify sample
    setTimeout(() => {
      const mockResults = {
        sourceTrack: 'Funky Drummer - James Brown',
        confidence: 94,
        rightsHolder: 'Universal Music Group',
        riskScore: 75,
        originalArtist: 'James Brown',
        releaseYear: 1970,
        label: 'Polydor Records',
        matchSegments: [
          { start: 12.5, end: 16.8, confidence: 94 },
          { start: 45.2, end: 48.1, confidence: 89 }
        ]
      };
      
      setAnalysisResults(mockResults);
      setIsAnalyzing(false);
      setCurrentStep('results');
    }, 3000);
  };

  const createProject = () => {
    if (!selectedFile || !analysisResults) return;
    
    const newProject: Project = {
      projectId: Date.now().toString(),
      userId: '1',
      trackName: selectedFile.name.replace(/\.[^/.]+$/, ''),
      uploadedSampleFile: selectedFile,
      identifiedSourceTrack: analysisResults.sourceTrack,
      rightsHolderInfo: analysisResults.rightsHolder,
      clearanceStatus: 'identified',
      negotiationLog: [],
      riskScore: analysisResults.riskScore,
      createdAt: new Date()
    };
    
    addProject(newProject);
    setCurrentProject(newProject);
    
    // Reset for next use
    setCurrentStep('upload');
    setSelectedFile(null);
    setAnalysisResults(null);
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'High', color: 'text-red-500', bg: 'bg-red-100' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-green-500', bg: 'bg-green-100' };
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={() => window.history.back()}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Sample Identification</h1>
          <p className="text-text-secondary">
            Upload your audio file to identify the original source and assess clearance risks
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8 mb-12">
        <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'upload' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <span className="font-medium">Upload</span>
        </div>
        
        <div className={`h-px w-16 ${currentStep !== 'upload' ? 'bg-primary' : 'bg-gray-200'}`} />
        
        <div className={`flex items-center space-x-2 ${currentStep === 'analyzing' ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'analyzing' ? 'bg-primary text-white' : 
            currentStep === 'results' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>
            {isAnalyzing ? <Loader className="w-4 h-4 animate-spin" /> : '2'}
          </div>
          <span className="font-medium">Analyze</span>
        </div>
        
        <div className={`h-px w-16 ${currentStep === 'results' ? 'bg-primary' : 'bg-gray-200'}`} />
        
        <div className={`flex items-center space-x-2 ${currentStep === 'results' ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'results' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>
            3
          </div>
          <span className="font-medium">Results</span>
        </div>
      </div>

      {/* Content */}
      {currentStep === 'upload' && (
        <div className="space-y-8">
          <FileUpload onFileSelect={handleFileSelect} variant="dragDrop" />
          
          {selectedFile && (
            <div className="text-center">
              <button 
                onClick={startAnalysis}
                className="btn-primary"
              >
                Analyze Sample
              </button>
            </div>
          )}
        </div>
      )}

      {currentStep === 'analyzing' && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Analyzing Your Sample
          </h3>
          <p className="text-text-secondary">
            Our AI is identifying the original source track and assessing clearance risks...
          </p>
        </div>
      )}

      {currentStep === 'results' && analysisResults && (
        <div className="space-y-8">
          {/* Main Results */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Sample Identified
                </h3>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">
                    {analysisResults.confidence}% Confidence Match
                  </span>
                </div>
              </div>
              <div className="text-right">
                {(() => {
                  const risk = getRiskLevel(analysisResults.riskScore);
                  return (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${risk.bg} ${risk.color}`}>
                      {risk.level} Risk
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-text-primary mb-3">Source Track</h4>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-text-primary">
                    {analysisResults.sourceTrack}
                  </p>
                  <p className="text-text-secondary">
                    Released: {analysisResults.releaseYear} • {analysisResults.label}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-text-primary mb-3">Rights Information</h4>
                <div className="space-y-2">
                  <p className="text-text-primary">
                    <span className="font-medium">Rights Holder:</span> {analysisResults.rightsHolder}
                  </p>
                  <p className="text-text-primary">
                    <span className="font-medium">Original Artist:</span> {analysisResults.originalArtist}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Risk Assessment</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Clearance Difficulty</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${analysisResults.riskScore >= 70 ? 'bg-red-500' : 
                        analysisResults.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${analysisResults.riskScore}%` }}
                    />
                  </div>
                  <span className="font-medium text-text-primary">{analysisResults.riskScore}%</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Potential Issues</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Major label ownership may require higher licensing fees</li>
                      <li>• Popular track with previous clearance challenges</li>
                      <li>• Multiple rights holders may complicate negotiations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Sample Segments</h3>
            <div className="space-y-3">
              {analysisResults.matchSegments.map((segment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Music className="w-4 h-4 text-primary" />
                    <span className="text-text-primary">
                      Segment {index + 1}: {segment.start}s - {segment.end}s
                    </span>
                  </div>
                  <span className="text-sm font-medium text-text-secondary">
                    {segment.confidence}% match
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => {
                setCurrentStep('upload');
                setSelectedFile(null);
                setAnalysisResults(null);
              }}
              className="btn-secondary"
            >
              Analyze Another Sample
            </button>
            <button 
              onClick={createProject}
              className="btn-primary"
            >
              Start Clearance Process
            </button>
          </div>
        </div>
      )}
    </div>
  );
};