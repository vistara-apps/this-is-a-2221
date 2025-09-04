import React from 'react';
import { AlertTriangle, CheckCircle, Clock, MessageSquare, Eye } from 'lucide-react';
import { Project } from '../types';

interface SampleCardProps {
  project: Project;
  variant?: 'identified' | 'riskHigh' | 'negotiating';
  onClick?: () => void;
}

export const SampleCard: React.FC<SampleCardProps> = ({ 
  project, 
  variant = 'identified',
  onClick 
}) => {
  const getRiskColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBadge = (score?: number) => {
    if (!score) return { label: 'Unknown', color: 'bg-gray-100 text-gray-600' };
    if (score >= 70) return { label: 'High Risk', color: 'bg-red-100 text-red-600' };
    if (score >= 40) return { label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-600' };
    return { label: 'Low Risk', color: 'bg-green-100 text-green-600' };
  };

  const getStatusIcon = () => {
    switch (project.clearanceStatus) {
      case 'cleared':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'negotiating':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const riskBadge = getRiskBadge(project.riskScore);

  return (
    <div 
      className="card hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary text-lg mb-1">
            {project.trackName}
          </h3>
          {project.identifiedSourceTrack && (
            <p className="text-text-secondary text-sm">
              Source: {project.identifiedSourceTrack}
            </p>
          )}
        </div>
        {getStatusIcon()}
      </div>

      <div className="space-y-3">
        {project.riskScore !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Risk Score</span>
            <div className="flex items-center space-x-2">
              <span className={`font-semibold ${getRiskColor(project.riskScore)}`}>
                {project.riskScore}%
              </span>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${riskBadge.color}`}>
                {riskBadge.label}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Status</span>
          <span className="text-sm font-medium text-text-primary capitalize">
            {project.clearanceStatus.replace('_', ' ')}
          </span>
        </div>

        {project.negotiationLog.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Negotiations</span>
            <span className="text-sm font-medium text-text-primary">
              {project.negotiationLog.length} attempts
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Created {project.createdAt.toLocaleDateString()}</span>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>View Details</span>
          </div>
        </div>
      </div>
    </div>
  );
};