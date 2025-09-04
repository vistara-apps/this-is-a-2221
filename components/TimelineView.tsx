/**
 * TimelineView Component
 * 
 * This component displays a chronological timeline of all activities
 * related to a sample clearance project.
 */

import React from 'react';
import { 
  Upload, 
  Search, 
  MessageSquare, 
  FileText, 
  Check, 
  X, 
  AlertTriangle,
  DollarSign,
  Clock
} from 'lucide-react';
import { Project, NegotiationAttempt } from '@/lib/types';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'upload' | 'identification' | 'negotiation' | 'offer' | 'document' | 'status_change';
  title: string;
  description: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  metadata?: any;
}

interface TimelineViewProps {
  project: Project;
  negotiations: NegotiationAttempt[];
  offers?: any[]; // This would be the Offer type from OfferTracker
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  project,
  negotiations,
  offers = [],
}) => {
  // Generate timeline events from project data
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    // Project creation event
    events.push({
      id: `creation-${project.projectId}`,
      date: project.createdAt,
      type: 'upload',
      title: 'Project Created',
      description: `Project "${project.trackName}" was created`,
      status: 'info',
    });
    
    // Sample identification event
    if (project.identifiedSourceTrack) {
      events.push({
        id: `identification-${project.projectId}`,
        date: new Date(project.createdAt.getTime() + 1000), // Just after creation
        type: 'identification',
        title: 'Sample Identified',
        description: `Sample identified as "${project.identifiedSourceTrack}"`,
        status: 'success',
        metadata: {
          sourceTrack: project.identifiedSourceTrack,
          rightsHolder: project.rightsHolderInfo,
          riskScore: project.riskScore,
        },
      });
    }
    
    // Negotiation events
    negotiations.forEach(negotiation => {
      events.push({
        id: `negotiation-${negotiation.attemptId}`,
        date: negotiation.dateSent,
        type: 'negotiation',
        title: 'Negotiation Message Sent',
        description: `Message sent to ${negotiation.contactedRightsHolder}`,
        status: 'info',
        metadata: {
          recipient: negotiation.contactedRightsHolder,
          content: negotiation.content,
        },
      });
      
      if (negotiation.response) {
        // Add response event 1 day later (for demo purposes)
        const responseDate = new Date(negotiation.dateSent);
        responseDate.setDate(responseDate.getDate() + 1);
        
        events.push({
          id: `response-${negotiation.attemptId}`,
          date: responseDate,
          type: 'negotiation',
          title: 'Response Received',
          description: `Response received from ${negotiation.contactedRightsHolder}`,
          status: negotiation.status === 'accepted' ? 'success' : 
                 negotiation.status === 'rejected' ? 'error' : 'info',
          metadata: {
            sender: negotiation.contactedRightsHolder,
            content: negotiation.response,
            status: negotiation.status,
          },
        });
      }
    });
    
    // Offer events
    offers.forEach(offer => {
      events.push({
        id: `offer-${offer.id}`,
        date: offer.date,
        type: 'offer',
        title: 'Offer Submitted',
        description: getOfferDescription(offer),
        status: 'info',
        metadata: {
          offer,
        },
      });
      
      if (offer.status === 'accepted' || offer.status === 'rejected') {
        // Add response event 2 days later (for demo purposes)
        const responseDate = new Date(offer.date);
        responseDate.setDate(responseDate.getDate() + 2);
        
        events.push({
          id: `offer-response-${offer.id}`,
          date: responseDate,
          type: 'offer',
          title: offer.status === 'accepted' ? 'Offer Accepted' : 'Offer Rejected',
          description: `The offer was ${offer.status} by the rights holder`,
          status: offer.status === 'accepted' ? 'success' : 'error',
          metadata: {
            offer,
          },
        });
      }
      
      if (offer.status === 'countered' && offer.counterOffer) {
        // Add counter offer event 2 days later (for demo purposes)
        const counterDate = new Date(offer.date);
        counterDate.setDate(counterDate.getDate() + 2);
        
        events.push({
          id: `counter-offer-${offer.id}`,
          date: counterDate,
          type: 'offer',
          title: 'Counter Offer Received',
          description: getCounterOfferDescription(offer),
          status: 'warning',
          metadata: {
            offer,
          },
        });
      }
    });
    
    // Status change events
    if (project.clearanceStatus === 'cleared') {
      // Add clearance event at the end
      const lastEventDate = events.length > 0 
        ? new Date(Math.max(...events.map(e => e.date.getTime())))
        : new Date();
      const clearanceDate = new Date(lastEventDate.getTime() + 86400000); // 1 day after last event
      
      events.push({
        id: `clearance-${project.projectId}`,
        date: clearanceDate,
        type: 'status_change',
        title: 'Sample Cleared',
        description: 'The sample has been successfully cleared for use',
        status: 'success',
      });
    } else if (project.clearanceStatus === 'rejected') {
      // Add rejection event at the end
      const lastEventDate = events.length > 0 
        ? new Date(Math.max(...events.map(e => e.date.getTime())))
        : new Date();
      const rejectionDate = new Date(lastEventDate.getTime() + 86400000); // 1 day after last event
      
      events.push({
        id: `rejection-${project.projectId}`,
        date: rejectionDate,
        type: 'status_change',
        title: 'Clearance Rejected',
        description: 'The sample clearance request was rejected',
        status: 'error',
      });
    }
    
    // Sort events by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
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
  
  // Helper function to get counter offer description
  const getCounterOfferDescription = (offer: any): string => {
    const counterOffer = offer.counterOffer;
    if (!counterOffer) return '';
    
    if (offer.type === 'flat') {
      return `Counter offer of $${counterOffer.flatFee} received`;
    } else if (offer.type === 'royalty') {
      return `Counter royalty offer of ${counterOffer.royaltyPercentage}% received${
        counterOffer.advanceAmount ? ` with $${counterOffer.advanceAmount} advance` : ''
      }`;
    } else {
      return `Counter hybrid offer received: $${counterOffer.flatFee} flat fee and ${counterOffer.royaltyPercentage}% royalty${
        counterOffer.advanceAmount ? ` with $${counterOffer.advanceAmount} advance` : ''
      }`;
    }
  };
  
  // Get icon for event type
  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'upload':
        return <Upload className="w-5 h-5" />;
      case 'identification':
        return <Search className="w-5 h-5" />;
      case 'negotiation':
        return <MessageSquare className="w-5 h-5" />;
      case 'offer':
        return <DollarSign className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'status_change':
        return event.status === 'success' ? <Check className="w-5 h-5" /> : 
               event.status === 'error' ? <X className="w-5 h-5" /> : 
               <Clock className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };
  
  // Get color for event status
  const getEventColor = (status?: TimelineEvent['status']) => {
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
    }).format(date);
  };
  
  const events = generateTimelineEvents();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Project Timeline</h3>
      
      {events.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-text-secondary">
            No timeline events available for this project.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
          
          {/* Timeline events */}
          <div className="space-y-8">
            {events.map((event, index) => (
              <div key={event.id} className="relative pl-14">
                {/* Event icon */}
                <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${getEventColor(event.status)}`}>
                  {getEventIcon(event)}
                </div>
                
                {/* Event content */}
                <div className="card">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-text-primary">{event.title}</h4>
                    <span className="text-sm text-text-secondary">{formatDate(event.date)}</span>
                  </div>
                  
                  <p className="text-text-secondary mb-4">{event.description}</p>
                  
                  {/* Event-specific content */}
                  {event.type === 'identification' && event.metadata && (
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-text-secondary">Source:</span>
                          <p className="font-medium text-text-primary">{event.metadata.sourceTrack}</p>
                        </div>
                        <div>
                          <span className="text-text-secondary">Rights Holder:</span>
                          <p className="font-medium text-text-primary">{event.metadata.rightsHolder}</p>
                        </div>
                        {event.metadata.riskScore !== undefined && (
                          <div>
                            <span className="text-text-secondary">Risk Score:</span>
                            <p className="font-medium text-text-primary">{event.metadata.riskScore}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {event.type === 'negotiation' && event.metadata && (
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      {event.title.includes('Sent') ? (
                        <>
                          <span className="text-text-secondary">To: {event.metadata.recipient}</span>
                          <p className="mt-1 text-text-primary">{event.metadata.content.substring(0, 100)}...</p>
                        </>
                      ) : (
                        <>
                          <span className="text-text-secondary">From: {event.metadata.sender}</span>
                          <p className="mt-1 text-text-primary">{event.metadata.content.substring(0, 100)}...</p>
                        </>
                      )}
                    </div>
                  )}
                  
                  {event.type === 'offer' && event.metadata && (
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      {event.title.includes('Counter') ? (
                        <div className="space-y-2">
                          <p className="font-medium text-text-primary">Counter Offer Details:</p>
                          {event.metadata.offer.counterOffer.flatFee !== undefined && (
                            <div>
                              <span className="text-text-secondary">Flat Fee:</span>
                              <span className="ml-2 text-text-primary">${event.metadata.offer.counterOffer.flatFee}</span>
                            </div>
                          )}
                          {event.metadata.offer.counterOffer.royaltyPercentage !== undefined && (
                            <div>
                              <span className="text-text-secondary">Royalty:</span>
                              <span className="ml-2 text-text-primary">{event.metadata.offer.counterOffer.royaltyPercentage}%</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="font-medium text-text-primary">Offer Details:</p>
                          {event.metadata.offer.flatFee !== undefined && (
                            <div>
                              <span className="text-text-secondary">Flat Fee:</span>
                              <span className="ml-2 text-text-primary">${event.metadata.offer.flatFee}</span>
                            </div>
                          )}
                          {event.metadata.offer.royaltyPercentage !== undefined && (
                            <div>
                              <span className="text-text-secondary">Royalty:</span>
                              <span className="ml-2 text-text-primary">{event.metadata.offer.royaltyPercentage}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

