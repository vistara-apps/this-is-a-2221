import React, { useState } from 'react';
import { Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { NegotiationAttempt } from '../types';

interface ChatThreadProps {
  negotiations: NegotiationAttempt[];
  onSendMessage: (content: string, rightsHolder: string) => void;
  variant?: 'withActions' | 'compact';
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  negotiations,
  onSendMessage,
  variant = 'withActions'
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [rightsHolder, setRightsHolder] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'responded':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleSend = () => {
    if (newMessage.trim() && rightsHolder.trim()) {
      onSendMessage(newMessage, rightsHolder);
      setNewMessage('');
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-text-primary mb-4">Negotiation History</h3>
      
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {negotiations.length === 0 ? (
          <p className="text-text-secondary text-center py-8">
            No negotiations yet. Start by sending your first message.
          </p>
        ) : (
          negotiations.map((attempt) => (
            <div key={attempt.attemptId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-text-primary">
                    To: {attempt.contactedRightsHolder}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {attempt.dateSent.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(attempt.status)}
                  <span className="text-sm font-medium capitalize text-text-secondary">
                    {attempt.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-md p-3 mb-3">
                <p className="text-sm text-text-primary">{attempt.content}</p>
              </div>
              
              {attempt.response && (
                <div className="bg-blue-50 rounded-md p-3">
                  <p className="text-sm text-blue-800 font-medium mb-1">Response:</p>
                  <p className="text-sm text-blue-700">{attempt.response}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {variant === 'withActions' && (
        <div className="space-y-4 border-t pt-4">
          <input
            type="text"
            placeholder="Rights holder email"
            value={rightsHolder}
            onChange={(e) => setRightsHolder(e.target.value)}
            className="input-field"
          />
          
          <div className="flex space-x-2">
            <textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="input-field flex-1 min-h-[100px] resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || !rightsHolder.trim()}
              className="btn-primary self-end flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};