/**
 * AuditTrail Component
 * 
 * This component displays a comprehensive audit trail of all actions
 * taken during the sample clearance process.
 */

import React from 'react';
import { Download, FileText, Clock, User, Mail, Check, X, AlertTriangle } from 'lucide-react';
import { Project, NegotiationAttempt } from '../types';

interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  details: string;
  category: 'upload' | 'identification' | 'negotiation' | 'offer' | 'document' | 'status';
  status?: 'success' | 'error' | 'warning' | 'info';
  metadata?: any;
}

interface AuditTrailProps {
  project: Project;
  negotiations: NegotiationAttempt[];
  offers?: any[]; // This would be the Offer type from OfferTracker
  documents?: any[]; // This would be a Document type
  exportFormat?: 'pdf' | 'csv' | 'json';
  subscriptionTier?: 'free' | 'pro' | 'premium';
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  project,
  negotiations,
  offers = [],
  documents = [],
  exportFormat = 'pdf',
  subscriptionTier = 'free',
}) => {
  // Generate audit events from project data
  const generateAuditEvents = (): AuditEvent[] => {
    const events: AuditEvent[] = [];
    const mockUser = 'John Doe'; // In a real app, this would be the actual user
    
    // Project creation event
    events.push({
      id: `creation-${project.projectId}`,
      timestamp: project.createdAt,
      action: 'Project Created',
      user: mockUser,
      details: `Project "${project.trackName}" was created`,
      category: 'upload',
      status: 'info',
    });
    
    // Sample upload event
    events.push({
      id: `upload-${project.projectId}`,
      timestamp: new Date(project.createdAt.getTime() + 100), // Just after creation
      action: 'Sample Uploaded',
      user: mockUser,
      details: `Audio file "${project.trackName}" was uploaded`,
      category: 'upload',
      status: 'info',
      metadata: {
        fileName: project.trackName,
        fileSize: '3.2 MB', // Mock data
        fileType: 'audio/mp3', // Mock data
      },
    });
    
    // Sample identification event
    if (project.identifiedSourceTrack) {
      events.push({
        id: `identification-${project.projectId}`,
        timestamp: new Date(project.createdAt.getTime() + 3000), // 3 seconds after creation
        action: 'Sample Identified',
        user: 'System',
        details: `Sample identified as "${project.identifiedSourceTrack}"`,
        category: 'identification',
        status: 'success',
        metadata: {
          sourceTrack: project.identifiedSourceTrack,
          rightsHolder: project.rightsHolderInfo,
          riskScore: project.riskScore,
          confidence: 94, // Mock data
        },
      });
    }
    
    // Risk assessment event
    if (project.riskScore !== undefined) {
      events.push({
        id: `risk-${project.projectId}`,
        timestamp: new Date(project.createdAt.getTime() + 3500), // 3.5 seconds after creation
        action: 'Risk Assessment',
        user: 'System',
        details: `Risk assessment completed with score ${project.riskScore}%`,
        category: 'identification',
        status: project.riskScore >= 70 ? 'warning' : 
                project.riskScore >= 40 ? 'info' : 'success',
        metadata: {
          riskScore: project.riskScore,
          riskLevel: project.riskScore >= 70 ? 'High' : 
                     project.riskScore >= 40 ? 'Medium' : 'Low',
          factors: [
            'Major label ownership',
            'Previous sample usage',
            'Artist popularity',
            'Track age',
          ],
        },
      });
    }
    
    // Negotiation events
    negotiations.forEach((negotiation, index) => {
      events.push({
        id: `negotiation-${negotiation.attemptId}`,
        timestamp: negotiation.dateSent,
        action: 'Negotiation Message Sent',
        user: mockUser,
        details: `Message sent to ${negotiation.contactedRightsHolder}`,
        category: 'negotiation',
        status: 'info',
        metadata: {
          recipient: negotiation.contactedRightsHolder,
          messageId: negotiation.attemptId,
          messageType: index === 0 ? 'Initial Request' : 'Follow-up',
        },
      });
      
      if (negotiation.response) {
        // Add response event 1 day later (for demo purposes)
        const responseDate = new Date(negotiation.dateSent);
        responseDate.setDate(responseDate.getDate() + 1);
        
        events.push({
          id: `response-${negotiation.attemptId}`,
          timestamp: responseDate,
          action: 'Response Received',
          user: negotiation.contactedRightsHolder,
          details: `Response received from ${negotiation.contactedRightsHolder}`,
          category: 'negotiation',
          status: negotiation.status === 'accepted' ? 'success' : 
                 negotiation.status === 'rejected' ? 'error' : 'info',
          metadata: {
            sender: negotiation.contactedRightsHolder,
            messageId: `response-${negotiation.attemptId}`,
            responseType: negotiation.status,
          },
        });
      }
    });
    
    // Offer events
    offers.forEach(offer => {
      events.push({
        id: `offer-${offer.id}`,
        timestamp: offer.date,
        action: 'Offer Submitted',
        user: mockUser,
        details: getOfferDescription(offer),
        category: 'offer',
        status: 'info',
        metadata: {
          offerId: offer.id,
          offerType: offer.type,
          offerAmount: offer.type === 'flat' ? offer.flatFee : 
                       offer.type === 'royalty' ? `${offer.royaltyPercentage}%` : 
                       `${offer.flatFee} + ${offer.royaltyPercentage}%`,
        },
      });
      
      if (offer.status === 'accepted' || offer.status === 'rejected') {
        // Add response event 2 days later (for demo purposes)
        const responseDate = new Date(offer.date);
        responseDate.setDate(responseDate.getDate() + 2);
        
        events.push({
          id: `offer-response-${offer.id}`,
          timestamp: responseDate,
          action: offer.status === 'accepted' ? 'Offer Accepted' : 'Offer Rejected',
          user: 'Rights Holder',
          details: `The offer was ${offer.status} by the rights holder`,
          category: 'offer',
          status: offer.status === 'accepted' ? 'success' : 'error',
          metadata: {
            offerId: offer.id,
            responseType: offer.status,
          },
        });
      }
    });
    
    // Document events
    documents.forEach(doc => {
      events.push({
        id: `document-${doc.id}`,
        timestamp: doc.createdAt,
        action: 'Document Created',
        user: mockUser,
        details: `Document "${doc.name}" was created`,
        category: 'document',
        status: 'info',
        metadata: {
          documentId: doc.id,
          documentType: doc.type,
          documentName: doc.name,
        },
      });
      
      if (doc.signedAt) {
        events.push({
          id: `document-signed-${doc.id}`,
          timestamp: doc.signedAt,
          action: 'Document Signed',
          user: doc.signedBy || mockUser,
          details: `Document "${doc.name}" was signed by ${doc.signedBy || mockUser}`,
          category: 'document',
          status: 'success',
          metadata: {
            documentId: doc.id,
            documentType: doc.type,
            documentName: doc.name,
            signatureMethod: 'Digital Signature',
          },
        });
      }
    });
    
    // Status change events
    if (project.clearanceStatus === 'cleared') {
      // Add clearance event at the end
      const lastEventDate = events.length > 0 
        ? new Date(Math.max(...events.map(e => e.timestamp.getTime())))
        : new Date();
      const clearanceDate = new Date(lastEventDate.getTime() + 86400000); // 1 day after last event
      
      events.push({
        id: `clearance-${project.projectId}`,
        timestamp: clearanceDate,
        action: 'Sample Cleared',
        user: 'System',
        details: 'The sample has been successfully cleared for use',
        category: 'status',
        status: 'success',
        metadata: {
          clearanceId: `clearance-${project.projectId}`,
          clearanceStatus: 'approved',
          clearanceDate: clearanceDate.toISOString(),
        },
      });
    } else if (project.clearanceStatus === 'rejected') {
      // Add rejection event at the end
      const lastEventDate = events.length > 0 
        ? new Date(Math.max(...events.map(e => e.timestamp.getTime())))
        : new Date();
      const rejectionDate = new Date(lastEventDate.getTime() + 86400000); // 1 day after last event
      
      events.push({
        id: `rejection-${project.projectId}`,
        timestamp: rejectionDate,
        action: 'Clearance Rejected',
        user: 'System',
        details: 'The sample clearance request was rejected',
        category: 'status',
        status: 'error',
        metadata: {
          clearanceId: `clearance-${project.projectId}`,
          clearanceStatus: 'rejected',
          clearanceDate: rejectionDate.toISOString(),
          rejectionReason: 'Rights holder declined permission',
        },
      });
    }
    
    // Sort events by timestamp
    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };
  
  // Helper function to get offer description
  const getOfferDescription = (offer: any): string => {
    if (offer.type === 'flat') {
      return `Flat fee offer of $${offer.flatFee} submitted`;
    } else if (offer.type === 'royalty') {
      return `Royalty offer of ${offer.royaltyPercentage}% submitted${
        offer.advanceAmount ? ` with $${offer.advanceAmount} advance` : ''
      }`;
    } else {
      return `Hybrid offer of $${offer.flatFee} flat fee and ${offer.royaltyPercentage}% royalty submitted${
        offer.advanceAmount ? ` with $${offer.advanceAmount} advance` : ''
      }`;
    }
  };
  
  // Get icon for event category
  const getEventIcon = (event: AuditEvent) => {
    switch (event.category) {
      case 'upload':
        return <Clock className="w-4 h-4" />;
      case 'identification':
        return <AlertTriangle className="w-4 h-4" />;
      case 'negotiation':
        return <Mail className="w-4 h-4" />;
      case 'offer':
        return <Check className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'status':
        return event.status === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };
  
  // Get color for event status
  const getEventColor = (status?: AuditEvent['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-500 bg-green-100';
      case 'error':
        return 'text-red-500 bg-red-100';
      case 'warning':
        return 'text-yellow-500 bg-yellow-100';
      case 'info':
      default:
        return 'text-blue-500 bg-blue-100';
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Export audit trail
  const exportAuditTrail = () => {
    const events = generateAuditEvents();
    
    if (exportFormat === 'pdf') {
      alert('PDF export would be implemented here in a production environment');
    } else if (exportFormat === 'csv') {
      // Create CSV content
      const csvContent = [
        ['Timestamp', 'Action', 'User', 'Details', 'Category', 'Status'].join(','),
        ...events.map(event => [
          event.timestamp.toISOString(),
          event.action,
          event.user,
          event.details,
          event.category,
          event.status || 'info',
        ].join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_trail_${project.projectId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'json') {
      // Create JSON content
      const jsonContent = JSON.stringify(events, null, 2);
      
      // Create and download file
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_trail_${project.projectId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  const events = generateAuditEvents();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Audit Trail</h3>
        
        <button
          onClick={exportAuditTrail}
          className="btn-secondary text-sm flex items-center space-x-1"
        >
          <Download className="w-4 h-4" />
          <span>Export {exportFormat.toUpperCase()}</span>
        </button>
      </div>
      
      {events.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-text-secondary">
            No audit events available for this project.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {formatDate(event.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${getEventColor(event.status)}`}>
                        {getEventIcon(event)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-text-primary">{event.action}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-text-secondary" />
                      </div>
                      <div className="ml-2 text-sm text-text-primary">{event.user}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {event.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventColor(event.status)}`}>
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
