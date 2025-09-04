/**
 * DocumentViewer Component
 * 
 * This component displays and manages clearance documentation,
 * including agreements, requests, and usage documentation.
 */

import React, { useState } from 'react';
import { Download, Copy, FileText, Check } from 'lucide-react';
import { DigitalSignature } from './DigitalSignature';
import { 
  generateClearanceRequest, 
  generateClearanceAgreement, 
  generateUsageDocumentation,
  downloadDocument,
  DocumentOptions
} from '@/lib/utils/documentGenerator';
import { Project, SampleSegment, NegotiationAttempt } from '@/lib/types';
import { SUBSCRIPTION_LIMITS } from '@/lib/config/api';

interface DocumentViewerProps {
  project: Project;
  segments: SampleSegment[];
  negotiations: NegotiationAttempt[];
  subscriptionTier: 'free' | 'pro' | 'premium';
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  project,
  segments,
  negotiations,
  subscriptionTier,
}) => {
  const [activeTab, setActiveTab] = useState<'request' | 'agreement' | 'usage'>('request');
  const [documentOptions, setDocumentOptions] = useState<DocumentOptions>({
    format: 'txt',
    includeNegotiationHistory: true,
    includeRiskAssessment: true,
    includeMetadata: false,
  });
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // Get available export formats based on subscription tier
  const availableFormats = SUBSCRIPTION_LIMITS[subscriptionTier].exportFormats as string[];
  
  // Generate document content based on active tab
  const generateDocumentContent = (): string => {
    switch (activeTab) {
      case 'request':
        return generateClearanceRequest(project, segments, documentOptions).content as string;
      case 'agreement':
        return generateClearanceAgreement(project, segments, documentOptions).content as string;
      case 'usage':
        return generateUsageDocumentation(project, segments, negotiations, documentOptions).content as string;
      default:
        return '';
    }
  };
  
  // Handle document download
  const handleDownload = () => {
    let document;
    
    switch (activeTab) {
      case 'request':
        document = generateClearanceRequest(project, segments, documentOptions);
        break;
      case 'agreement':
        document = generateClearanceAgreement(project, segments, documentOptions);
        break;
      case 'usage':
        document = generateUsageDocumentation(project, segments, negotiations, documentOptions);
        break;
      default:
        return;
    }
    
    downloadDocument(document);
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    const content = generateDocumentContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Handle signature capture
  const handleSignatureCapture = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
    setDocumentOptions(prev => ({
      ...prev,
      signatureDataUrl: dataUrl,
    }));
  };
  
  // Handle format change
  const handleFormatChange = (format: 'txt' | 'pdf' | 'doc') => {
    if (availableFormats.includes(format)) {
      setDocumentOptions(prev => ({
        ...prev,
        format,
      }));
    }
  };
  
  // Handle option change
  const handleOptionChange = (option: keyof DocumentOptions, value: boolean) => {
    setDocumentOptions(prev => ({
      ...prev,
      [option]: value,
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Documentation</h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="btn-secondary text-sm flex items-center space-x-1"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="btn-primary text-sm flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
      
      {/* Document tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('request')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'request'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
            }`}
          >
            Clearance Request
          </button>
          
          <button
            onClick={() => setActiveTab('agreement')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'agreement'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
            }`}
          >
            Agreement
          </button>
          
          <button
            onClick={() => setActiveTab('usage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'usage'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
            }`}
          >
            Usage Documentation
          </button>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Document options */}
        <div className="md:col-span-1 space-y-6">
          <div className="card">
            <h4 className="font-medium text-text-primary mb-4">Document Options</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Export Format
                </label>
                <div className="flex space-x-2">
                  {['txt', 'pdf', 'doc'].map((format) => (
                    <button
                      key={format}
                      onClick={() => handleFormatChange(format as 'txt' | 'pdf' | 'doc')}
                      disabled={!availableFormats.includes(format)}
                      className={`
                        px-3 py-1 rounded-md text-sm
                        ${documentOptions.format === format
                          ? 'bg-primary text-white'
                          : availableFormats.includes(format)
                            ? 'bg-gray-100 text-text-primary hover:bg-gray-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
                
                {!availableFormats.includes('pdf') && (
                  <p className="text-xs text-text-secondary mt-1">
                    Upgrade to Pro for PDF export
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  Include in Document
                </label>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeNegotiationHistory"
                    checked={documentOptions.includeNegotiationHistory}
                    onChange={(e) => handleOptionChange('includeNegotiationHistory', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="includeNegotiationHistory" className="ml-2 text-sm text-text-primary">
                    Negotiation History
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeRiskAssessment"
                    checked={documentOptions.includeRiskAssessment}
                    onChange={(e) => handleOptionChange('includeRiskAssessment', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="includeRiskAssessment" className="ml-2 text-sm text-text-primary">
                    Risk Assessment
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeMetadata"
                    checked={documentOptions.includeMetadata}
                    onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="includeMetadata" className="ml-2 text-sm text-text-primary">
                    Technical Metadata
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Digital Signature */}
          {activeTab === 'agreement' && (
            <div className="card">
              <DigitalSignature
                onSignatureCapture={handleSignatureCapture}
                initialSignature={signatureDataUrl}
                width={300}
                height={150}
              />
            </div>
          )}
        </div>
        
        {/* Document preview */}
        <div className="md:col-span-2">
          <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-text-secondary" />
                <h4 className="font-medium text-text-primary">
                  {activeTab === 'request' && 'Clearance Request'}
                  {activeTab === 'agreement' && 'Sample Clearance Agreement'}
                  {activeTab === 'usage' && 'Usage Documentation'}
                </h4>
              </div>
              
              <div className="text-sm text-text-secondary">
                {documentOptions.format.toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1 bg-gray-50 rounded-lg p-4 font-mono text-sm text-text-primary whitespace-pre-wrap overflow-auto">
              {generateDocumentContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
