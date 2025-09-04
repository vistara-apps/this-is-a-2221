/**
 * useSampleSegments Hook
 * 
 * This hook provides functionality for managing sample segments within a project.
 */

import { useState, useEffect } from 'react';
import { SampleSegment } from '@/lib/types';

interface UseSampleSegmentsProps {
  projectId: string;
  initialSegments?: SampleSegment[];
  onSegmentsChange?: (segments: SampleSegment[]) => void;
}

export function useSampleSegments({
  projectId,
  initialSegments = [],
  onSegmentsChange,
}: UseSampleSegmentsProps) {
  const [segments, setSegments] = useState<SampleSegment[]>(initialSegments);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  
  // Update segments when initialSegments changes
  useEffect(() => {
    setSegments(initialSegments);
  }, [initialSegments]);
  
  // Notify parent component when segments change
  useEffect(() => {
    if (onSegmentsChange) {
      onSegmentsChange(segments);
    }
  }, [segments, onSegmentsChange]);
  
  /**
   * Add a new segment
   */
  const addSegment = (segment: Omit<SampleSegment, 'segmentId' | 'projectId'>) => {
    const newSegment: SampleSegment = {
      segmentId: Date.now().toString(),
      projectId,
      ...segment,
    };
    
    setSegments(prev => [...prev, newSegment]);
    return newSegment;
  };
  
  /**
   * Update an existing segment
   */
  const updateSegment = (segmentId: string, updates: Partial<SampleSegment>) => {
    setSegments(prev => 
      prev.map(segment => 
        segment.segmentId === segmentId ? { ...segment, ...updates } : segment
      )
    );
  };
  
  /**
   * Delete a segment
   */
  const deleteSegment = (segmentId: string) => {
    setSegments(prev => prev.filter(segment => segment.segmentId !== segmentId));
    
    if (selectedSegmentId === segmentId) {
      setSelectedSegmentId(null);
    }
  };
  
  /**
   * Select a segment
   */
  const selectSegment = (segmentId: string) => {
    setSelectedSegmentId(segmentId);
  };
  
  /**
   * Get the selected segment
   */
  const getSelectedSegment = () => {
    return segments.find(segment => segment.segmentId === selectedSegmentId) || null;
  };
  
  /**
   * Import segments from analysis results
   */
  const importFromAnalysis = (analysisSegments: { start: number; end: number; confidence: number }[]) => {
    const newSegments = analysisSegments.map(analysisSegment => ({
      segmentId: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      projectId,
      startTime: analysisSegment.start,
      endTime: analysisSegment.end,
      originalArtist: '',
      rightsHolderContact: '',
    }));
    
    setSegments(prev => [...prev, ...newSegments]);
    return newSegments;
  };
  
  /**
   * Clear all segments
   */
  const clearSegments = () => {
    setSegments([]);
    setSelectedSegmentId(null);
  };
  
  /**
   * Get total duration of all segments
   */
  const getTotalDuration = () => {
    return segments.reduce((total, segment) => total + (segment.endTime - segment.startTime), 0);
  };
  
  /**
   * Check if segments overlap
   */
  const hasOverlappingSegments = () => {
    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const a = segments[i];
        const b = segments[j];
        
        if (
          (a.startTime <= b.startTime && b.startTime <= a.endTime) ||
          (a.startTime <= b.endTime && b.endTime <= a.endTime) ||
          (b.startTime <= a.startTime && a.startTime <= b.endTime) ||
          (b.startTime <= a.endTime && a.endTime <= b.endTime)
        ) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  return {
    segments,
    selectedSegmentId,
    addSegment,
    updateSegment,
    deleteSegment,
    selectSegment,
    getSelectedSegment,
    importFromAnalysis,
    clearSegments,
    getTotalDuration,
    hasOverlappingSegments,
  };
}

