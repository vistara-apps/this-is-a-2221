import React, { useState } from 'react';
import { ArrowLeft, Play, Pause, MessageSquare, FileText, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ChatThread } from '../components/ChatThread';
import { DocumentViewer } from '../components/DocumentViewer';
import { NegotiationAttempt } from '../types';

export const ProjectDetail: React.FC = () => {
  const { currentProject, updateProject } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'negotiations' | 'documentation'>('overview');
  const [isPlaying, setIsPlaying] = useState(false);

  if (!currentProject) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-text-primary mb-2">No Project Selected</h2>
          <p className="text-text-secondary">Please select a project from the dashboard.</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = (content: string, rightsHolder: string) => {
    const newAttempt: NegotiationAttempt = {
      attemptId: Date.now().toString(),
      projectId: currentProject.projectId,
      contactedRightsHolder: rightsHolder,
      dateSent: new Date(),
      content,
      status: 'sent'
    };

    const updatedNegotiationLog = [...currentProject.negotiationLog, newAttempt];
    updateProject(currentProject.projectId, {
      negotiationLog: updatedNegotiationLog,
      clearanceStatus: 'negotiating'
    });

    // Simulate response after 2 seconds
    setTimeout(() => {
      const responseAttempt = {
        ...newAttempt,
        response: 'Thank you for your inquiry. We are reviewing your request and will respond within 5-7 business days with our licensing terms.',
        status: 'responded' as const
      };
      
      const updatedLog = updatedNegotiationLog.map(attempt => 
        attempt.attemptId === newAttempt.attemptId ? responseAttempt : attempt
      );
      
      updateProject(currentProject.projectId, {
        negotiationLog: updatedLog
      });
    }, 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'negotiations', label: 'Negotiations', icon: MessageSquare },
    { id: 'documentation', label: 'Documentation', icon: FileText }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={() => window.history.back()}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-text-primary">{currentProject.trackName}</h1>
          <p className="text-text-secondary">
            {currentProject.identifiedSourceTrack ? `Source: ${currentProject.identifiedSourceTrack}` : 'Analyzing sample...'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-secondary flex items-center space-x-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Play'} Sample</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-3 border-b-2 font-medium transition-colors
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Info */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-4">Project Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">Track Name</label>
                <p className="text-text-primary">{currentProject.trackName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Source Track</label>
                <p className="text-text-primary">{currentProject.identifiedSourceTrack || 'Unknown'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Rights Holder</label>
                <p className="text-text-primary">{currentProject.rightsHolderInfo || 'Unknown'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Clearance Status</label>
                <span className={`
                  inline-block px-3 py-1 rounded-full text-sm font-medium capitalize
                  ${currentProject.clearanceStatus === 'cleared' ? 'bg-green-100 text-green-600' :
                    currentProject.clearanceStatus === 'negotiating' ? 'bg-blue-100 text-blue-600' :
                    currentProject.clearanceStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'}
                `}>
                  {currentProject.clearanceStatus}
                </span>
              </div>
              
              {currentProject.riskScore !== undefined && (
                <div>
                  <label className="text-sm font-medium text-text-secondary">Risk Score</label>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${currentProject.riskScore >= 70 ? 'bg-red-500' : 
                          currentProject.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${currentProject.riskScore}%` }}
                      />
                    </div>
                    <span className="font-medium text-text-primary">{currentProject.riskScore}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                Send Clearance Request
              </button>
              <button className="w-full btn-secondary">
                Update Project Info
              </button>
              <button className="w-full btn-secondary">
                Export Documentation
              </button>
              <button className="w-full btn-secondary">
                Schedule Follow-up
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'negotiations' && (
        <div className="max-w-4xl">
          <ChatThread
            negotiations={currentProject.negotiationLog}
            onSendMessage={handleSendMessage}
            variant="withActions"
          />
        </div>
      )}

      {activeTab === 'documentation' && (
        <div className="max-w-4xl">
          <DocumentViewer project={currentProject} variant="logs" />
        </div>
      )}
    </div>
  );
};