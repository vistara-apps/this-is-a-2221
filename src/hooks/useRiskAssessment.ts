/**
 * useRiskAssessment Hook
 * 
 * This hook provides functionality for assessing the risk of sample clearance
 * based on various factors.
 */

import { useState, useEffect } from 'react';
import { calculateRiskScore } from '../utils/riskScoring';
import { FEATURE_FLAGS } from '../config/api';

interface RiskFactor {
  name: string;
  weight: number;
  score: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
  mitigation?: string;
}

interface UseRiskAssessmentProps {
  sourceTrack?: string;
  originalArtist?: string;
  rightsHolder?: string;
  releaseYear?: number;
  label?: string;
  initialRiskScore?: number;
  onRiskScoreChange?: (score: number) => void;
}

export function useRiskAssessment({
  sourceTrack = '',
  originalArtist = '',
  rightsHolder = '',
  releaseYear = new Date().getFullYear() - 10, // Default to 10 years ago
  label = '',
  initialRiskScore,
  onRiskScoreChange,
}: UseRiskAssessmentProps) {
  const [riskScore, setRiskScore] = useState<number>(initialRiskScore || 0);
  const [riskLevel, setRiskLevel] = useState<'high' | 'medium' | 'low'>('low');
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [potentialIssues, setPotentialIssues] = useState<string[]>([]);
  const [mitigationStrategies, setMitigationStrategies] = useState<string[]>([]);
  
  // Calculate risk score when inputs change
  useEffect(() => {
    if (!sourceTrack || !originalArtist) return;
    
    if (initialRiskScore !== undefined && !FEATURE_FLAGS.enableAdvancedRiskAssessment) {
      // Use the provided risk score if advanced assessment is disabled
      setRiskScore(initialRiskScore);
      setRiskLevel(initialRiskScore >= 70 ? 'high' : initialRiskScore >= 40 ? 'medium' : 'low');
      return;
    }
    
    // Calculate risk score
    const result = calculateRiskScore(
      sourceTrack,
      originalArtist,
      rightsHolder,
      releaseYear,
      label
    );
    
    setRiskScore(result.totalScore);
    setRiskLevel(result.riskLevel);
    setRiskFactors(result.factors);
    setPotentialIssues(result.potentialIssues);
    setMitigationStrategies(result.mitigationStrategies);
    
    // Notify parent component
    if (onRiskScoreChange) {
      onRiskScoreChange(result.totalScore);
    }
  }, [
    sourceTrack,
    originalArtist,
    rightsHolder,
    releaseYear,
    label,
    initialRiskScore,
    onRiskScoreChange
  ]);
  
  /**
   * Update risk score manually
   */
  const updateRiskScore = (score: number) => {
    const newScore = Math.max(0, Math.min(100, score));
    setRiskScore(newScore);
    setRiskLevel(newScore >= 70 ? 'high' : newScore >= 40 ? 'medium' : 'low');
    
    // Notify parent component
    if (onRiskScoreChange) {
      onRiskScoreChange(newScore);
    }
  };
  
  /**
   * Update a specific risk factor
   */
  const updateRiskFactor = (factorName: string, adjustment: number) => {
    const updatedFactors = riskFactors.map(factor => {
      if (factor.name === factorName) {
        const newScore = Math.max(0, Math.min(100, factor.score + adjustment));
        return { ...factor, score: newScore };
      }
      return factor;
    });
    
    setRiskFactors(updatedFactors);
    
    // Recalculate total score
    const totalWeight = updatedFactors.reduce((sum, factor) => sum + factor.weight, 0);
    const weightedScore = updatedFactors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0) / totalWeight;
    const newTotalScore = Math.round(weightedScore);
    
    setRiskScore(newTotalScore);
    setRiskLevel(newTotalScore >= 70 ? 'high' : newTotalScore >= 40 ? 'medium' : 'low');
    
    // Notify parent component
    if (onRiskScoreChange) {
      onRiskScoreChange(newTotalScore);
    }
  };
  
  /**
   * Get high impact risk factors
   */
  const getHighImpactFactors = () => {
    return riskFactors.filter(factor => factor.impact === 'high');
  };
  
  /**
   * Get risk level color
   */
  const getRiskLevelColor = () => {
    if (riskScore >= 70) return { level: 'High', color: 'text-red-500', bg: 'bg-red-100' };
    if (riskScore >= 40) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-green-500', bg: 'bg-green-100' };
  };
  
  return {
    riskScore,
    riskLevel,
    riskFactors,
    potentialIssues,
    mitigationStrategies,
    updateRiskScore,
    updateRiskFactor,
    getHighImpactFactors,
    getRiskLevelColor,
  };
}

