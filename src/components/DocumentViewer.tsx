import React from 'react';
import { Download, FileText, Calendar, User } from 'lucide-react';
import { Project, NegotiationAttempt } from '../types';

interface DocumentViewerProps {
  project: Project;
  variant?: 'logs' | 'offers';
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  project,
  variant = 'logs'
}) => {
  const generateDocument = () => {
    const docContent = `
SAMPLE CLEARANCE DOCUMENTATION
Project: ${project.trackName}
Generated: ${new Date().toLocaleDateString()}

SAMPLE IDENTIFICATION:
- Source Track: ${project.identifiedSourceTrack || 'Unknown'}
- Rights Holder: ${project.rightsHolderInfo || 'Unknown'}
- Risk Assessment: ${project.riskScore || 'N/A'}%

NEGOTIATION HISTORY:
${project.negotiationLog.map((attempt, index) => `
${index + 1}. Contact: ${attempt.contactedRightsHolder}
   Date: ${attempt.dateSent.toLocaleDateString()}
   Status: ${attempt.status}
   Message: ${attempt.content}
   ${attempt.response ? `Response: ${attempt.response}` : ''}
`).join('\n')}

CLEARANCE STATUS: ${project.clearanceStatus.toUpperCase()}
    `;

    const blob = new Blob([docContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.trackName.replace(/\s+/g, '_')}_clearance_doc.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-text-primary">
          {variant === 'logs' ? 'Documentation & Logs' : 'Offers & Agreements'}
        </h3>
        <button
          onClick={generateDocument}
          className="btn-secondary flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-text-primary">Project Summary</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">Track Name:</span>
              <p className="font-medium text-text-primary">{project.trackName}</p>
            </div>
            <div>
              <span className="text-text-secondary">Status:</span>
              <p className="font-medium text-text-primary capitalize">{project.clearanceStatus}</p>
            </div>
            <div>
              <span className="text-text-secondary">Source Track:</span>
              <p className="font-medium text-text-primary">{project.identifiedSourceTrack || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-text-secondary">Risk Score:</span>
              <p className="font-medium text-text-primary">{project.riskScore || 'N/A'}%</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-text-primary">Activity Log</h4>
          {project.negotiationLog.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No activity recorded yet.</p>
          ) : (
            project.negotiationLog.map((attempt) => (
              <div key={attempt.attemptId} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-text-primary">
                        Contact sent to {attempt.contactedRightsHolder}
                      </span>
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${attempt.status === 'accepted' ? 'bg-green-100 text-green-600' :
                          attempt.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          attempt.status === 'responded' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'}
                      `}>
                        {attempt.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-text-secondary mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{attempt.dateSent.toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-text-primary bg-gray-50 rounded p-2">
                      {attempt.content}
                    </p>
                    {attempt.response && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-text-primary mb-1">Response:</p>
                        <p className="text-sm text-text-primary bg-blue-50 rounded p-2">
                          {attempt.response}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};