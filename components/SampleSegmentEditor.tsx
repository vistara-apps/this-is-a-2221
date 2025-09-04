/**
 * SampleSegmentEditor Component
 * 
 * This component allows users to view, edit, and manage sample segments
 * within an audio track.
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';
import { SampleSegment } from '@/lib/types';

interface SampleSegmentEditorProps {
  audioFile: File;
  segments: SampleSegment[];
  onSegmentsChange: (segments: SampleSegment[]) => void;
  detectedSegments?: {
    start: number;
    end: number;
    confidence: number;
  }[];
}

export const SampleSegmentEditor: React.FC<SampleSegmentEditorProps> = ({
  audioFile,
  segments,
  onSegmentsChange,
  detectedSegments = [],
}) => {
  const [editingSegment, setEditingSegment] = useState<SampleSegment | null>(null);
  const [newSegment, setNewSegment] = useState<Partial<SampleSegment> | null>(null);
  
  // Handle segment selection from waveform
  const handleSegmentSelect = (start: number, end: number) => {
    if (newSegment) {
      setNewSegment({
        ...newSegment,
        startTime: start,
        endTime: end,
      });
    } else {
      // Create a new segment
      setNewSegment({
        startTime: start,
        endTime: end,
      });
    }
  };
  
  // Add a new segment
  const addSegment = () => {
    if (newSegment?.startTime !== undefined && newSegment?.endTime !== undefined) {
      const segment: SampleSegment = {
        segmentId: Date.now().toString(),
        projectId: segments[0]?.projectId || 'temp-project-id',
        startTime: newSegment.startTime,
        endTime: newSegment.endTime,
        originalArtist: newSegment.originalArtist || '',
        rightsHolderContact: newSegment.rightsHolderContact || '',
      };
      
      onSegmentsChange([...segments, segment]);
      setNewSegment(null);
    }
  };
  
  // Update an existing segment
  const updateSegment = () => {
    if (editingSegment) {
      const updatedSegments = segments.map(segment => 
        segment.segmentId === editingSegment.segmentId ? editingSegment : segment
      );
      
      onSegmentsChange(updatedSegments);
      setEditingSegment(null);
    }
  };
  
  // Delete a segment
  const deleteSegment = (segmentId: string) => {
    const updatedSegments = segments.filter(segment => segment.segmentId !== segmentId);
    onSegmentsChange(updatedSegments);
  };
  
  // Import detected segments
  const importDetectedSegments = () => {
    if (detectedSegments.length === 0) return;
    
    const newSegments = detectedSegments.map((detected, index) => ({
      segmentId: `detected-${Date.now()}-${index}`,
      projectId: segments[0]?.projectId || 'temp-project-id',
      startTime: detected.start,
      endTime: detected.end,
      originalArtist: '',
      rightsHolderContact: '',
    }));
    
    onSegmentsChange([...segments, ...newSegments]);
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Sample Segments</h3>
        
        <div className="flex items-center space-x-2">
          {detectedSegments.length > 0 && (
            <button
              onClick={importDetectedSegments}
              className="btn-secondary text-sm"
            >
              Import Detected Segments
            </button>
          )}
          
          <button
            onClick={() => setNewSegment({})}
            className="btn-primary text-sm flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Segment</span>
          </button>
        </div>
      </div>
      
      <AudioWaveform
        audioFile={audioFile}
        segments={detectedSegments}
        onSegmentSelect={handleSegmentSelect}
      />
      
      {/* New Segment Form */}
      {newSegment && (
        <div className="card border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-primary">New Segment</h4>
            <button
              onClick={() => setNewSegment(null)}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={newSegment.startTime !== undefined ? formatTime(newSegment.startTime) : ''}
                readOnly
                className="input-field bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                End Time
              </label>
              <input
                type="text"
                value={newSegment.endTime !== undefined ? formatTime(newSegment.endTime) : ''}
                readOnly
                className="input-field bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Original Artist
              </label>
              <input
                type="text"
                value={newSegment.originalArtist || ''}
                onChange={(e) => setNewSegment({ ...newSegment, originalArtist: e.target.value })}
                placeholder="Enter original artist"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Rights Holder Contact
              </label>
              <input
                type="text"
                value={newSegment.rightsHolderContact || ''}
                onChange={(e) => setNewSegment({ ...newSegment, rightsHolderContact: e.target.value })}
                placeholder="Enter rights holder contact"
                className="input-field"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setNewSegment(null)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={addSegment}
              disabled={newSegment.startTime === undefined || newSegment.endTime === undefined}
              className="btn-primary text-sm flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Save Segment</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Editing Segment Form */}
      {editingSegment && (
        <div className="card border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-primary">Edit Segment</h4>
            <button
              onClick={() => setEditingSegment(null)}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Start Time
              </label>
              <input
                type="number"
                value={editingSegment.startTime}
                onChange={(e) => setEditingSegment({ ...editingSegment, startTime: parseFloat(e.target.value) })}
                step="0.1"
                min="0"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                End Time
              </label>
              <input
                type="number"
                value={editingSegment.endTime}
                onChange={(e) => setEditingSegment({ ...editingSegment, endTime: parseFloat(e.target.value) })}
                step="0.1"
                min={editingSegment.startTime}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Original Artist
              </label>
              <input
                type="text"
                value={editingSegment.originalArtist || ''}
                onChange={(e) => setEditingSegment({ ...editingSegment, originalArtist: e.target.value })}
                placeholder="Enter original artist"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Rights Holder Contact
              </label>
              <input
                type="text"
                value={editingSegment.rightsHolderContact || ''}
                onChange={(e) => setEditingSegment({ ...editingSegment, rightsHolderContact: e.target.value })}
                placeholder="Enter rights holder contact"
                className="input-field"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setEditingSegment(null)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={updateSegment}
              className="btn-primary text-sm flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Update Segment</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Segments List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-text-primary">Saved Segments</h4>
        
        {segments.length === 0 ? (
          <p className="text-text-secondary text-sm py-4 text-center">
            No segments added yet. Use the waveform to select segments or import detected segments.
          </p>
        ) : (
          <div className="space-y-2">
            {segments.map((segment) => (
              <div
                key={segment.segmentId}
                className="flex items-center justify-between p-3 bg-surface border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-text-primary">
                    {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {segment.originalArtist ? `Artist: ${segment.originalArtist}` : 'No artist specified'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingSegment(segment)}
                    className="p-2 text-text-secondary hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSegment(segment.segmentId)}
                    className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

