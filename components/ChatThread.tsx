/**
 * ChatThread Component
 * 
 * This component displays a conversation thread between the user and rights holders,
 * allowing for message composition and response management.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, User, Clock, Check, X, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'rights_holder';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: string[];
}

interface ChatThreadProps {
  projectName: string;
  rightsHolder: string;
  initialMessages?: Message[];
  onSendMessage: (message: string) => Promise<void>;
  onAnalyzeResponse?: (response: string) => Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    nextSteps: string;
    suggestedReply: string;
  }>;
  compact?: boolean;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  projectName,
  rightsHolder,
  initialMessages = [],
  onSendMessage,
  onAnalyzeResponse,
  compact = false,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    sentiment: 'positive' | 'neutral' | 'negative';
    nextSteps: string;
    suggestedReply: string;
  } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    const messageId = Date.now().toString();
    const message: Message = {
      id: messageId,
      sender: 'user',
      content: newMessage,
      timestamp: new Date(),
      status: 'sent',
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    try {
      await onSendMessage(newMessage);
      
      // Update message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'delivered' } : msg
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      
      // Update message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'failed' } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file attachment
  const handleAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, you would upload the file to a server
      // For now, we'll just add a placeholder message
      const file = e.target.files[0];
      
      setNewMessage(prev => 
        prev + `\n\nAttached file: ${file.name} (${formatFileSize(file.size)})`
      );
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Analyze the latest response
  const analyzeLatestResponse = async () => {
    const latestResponse = messages
      .filter(msg => msg.sender === 'rights_holder')
      .pop();
    
    if (!latestResponse || !onAnalyzeResponse) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await onAnalyzeResponse(latestResponse.content);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze response');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Use suggested reply
  const useSuggestedReply = () => {
    if (!analysis) return;
    
    setNewMessage(analysis.suggestedReply);
    setAnalysis(null);
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get status icon
  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-3 h-3 text-text-secondary" />;
      case 'delivered':
        return <Check className="w-3 h-3 text-text-secondary" />;
      case 'read':
        return <Check className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={`flex flex-col ${compact ? 'h-[400px]' : 'h-[600px]'} border border-gray-200 rounded-lg overflow-hidden`}>
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-text-primary">{rightsHolder}</h3>
            <p className="text-sm text-text-secondary">
              Negotiation for {projectName}
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-text-secondary text-center">
              No messages yet. Start the conversation by sending a message.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-lg p-3
                    ${message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white border border-gray-200 text-text-primary'
                    }
                  `}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                    message.sender === 'user' ? 'text-primary-100' : 'text-text-secondary'
                  }`}>
                    <span>{formatTimestamp(message.timestamp)}</span>
                    {message.sender === 'user' && getStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Analysis panel */}
      {analysis && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text-primary">Response Analysis</h4>
            <button
              onClick={() => setAnalysis(null)}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">Sentiment:</span>
              <span className={`text-sm font-medium ${
                analysis.sentiment === 'positive' ? 'text-green-500' :
                analysis.sentiment === 'negative' ? 'text-red-500' :
                'text-yellow-500'
              }`}>
                {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
              </span>
            </div>
            
            <div>
              <span className="text-sm text-text-secondary">Next Steps:</span>
              <p className="text-sm text-text-primary">{analysis.nextSteps}</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Suggested Reply:</span>
                <button
                  onClick={useSuggestedReply}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Use This
                </button>
              </div>
              <p className="text-sm text-text-primary bg-white p-2 rounded border border-gray-200 mt-1">
                {analysis.suggestedReply}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
      
      {/* Message input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAttachment}
              className="p-3 text-text-secondary hover:text-text-primary transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        
        <div className="flex justify-between mt-2">
          <div className="text-xs text-text-secondary">
            Press Shift + Enter for a new line
          </div>
          
          {messages.filter(msg => msg.sender === 'rights_holder').length > 0 && onAnalyzeResponse && (
            <button
              onClick={analyzeLatestResponse}
              className="text-xs text-primary hover:text-primary/80"
            >
              Analyze Latest Response
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
