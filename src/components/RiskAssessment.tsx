/**
 * RiskAssessment Component
 * 
 * This component provides a detailed risk assessment for sample clearance,
 * including risk factors, scores, and mitigation strategies.
 */

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, Shield, CheckCircle, XCircle } from 'lucide-react';

interface RiskFactor {
  id: string;
  name: string;
  score: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
  mitigation?: string;
}

interface RiskAssessmentProps {
  riskScore: number;
  sourceTrack: string;
  rightsHolder: string;
  originalArtist: string;
  releaseYear: number;
  label: string;
  onUpdateRiskScore?: (score: number) => void;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  riskScore,
  sourceTrack,
  rightsHolder,
  originalArtist,
  releaseYear,
  label,
  onUpdateRiskScore,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Generate risk factors based on the provided information
  const riskFactors: RiskFactor[] = [
    {
      id: 'major_label',
      name: 'Major Label Ownership',
      score: isMajorLabel(label) ? 25 : 10,
      impact: isMajorLabel(label) ? 'high' : 'low',
      description: isMajorLabel(label)
        ? 'The sample is owned by a major label, which typically have stricter clearance processes and higher fees.'
        : 'The sample is owned by an independent label, which may be more flexible with clearance terms.',
      mitigation: isMajorLabel(label)
        ? 'Consider budgeting for higher licensing fees or exploring alternative samples.'
        : 'Reach out directly to the label with a personalized approach.'
    },
    {
      id: 'track_age',
      name: 'Track Age',
      score: getAgeScore(releaseYear),
      impact: getAgeImpact(releaseYear),
      description: `The original track was released in ${releaseYear}, ${getAgeDescription(releaseYear)}`,
      mitigation: getAgeMitigation(releaseYear),
    },
    {
      id: 'artist_popularity',
      name: 'Artist Popularity',
      score: getPopularityScore(originalArtist),
      impact: getPopularityImpact(originalArtist),
      description: `${originalArtist} is ${getPopularityDescription(originalArtist)}`,
      mitigation: getPopularityMitigation(originalArtist),
    },
    {
      id: 'sample_usage',
      name: 'Previous Sample Usage',
      score: getPreviousUsageScore(sourceTrack),
      impact: getPreviousUsageImpact(sourceTrack),
      description: getPreviousUsageDescription(sourceTrack),
      mitigation: getPreviousUsageMitigation(sourceTrack),
    },
  ];
  
  // Calculate the overall risk level
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'High', color: 'text-red-500', bg: 'bg-red-100' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-green-500', bg: 'bg-green-100' };
  };
  
  const risk = getRiskLevel(riskScore);
  
  // Update risk score based on user adjustments
  const handleFactorAdjustment = (factorId: string, adjustment: number) => {
    const factor = riskFactors.find(f => f.id === factorId);
    if (!factor || !onUpdateRiskScore) return;
    
    // Calculate new risk score
    const currentFactorContribution = factor.score;
    const newFactorContribution = Math.max(0, Math.min(100, factor.score + adjustment));
    const scoreDifference = newFactorContribution - currentFactorContribution;
    
    // Update the overall risk score (weighted average)
    const newRiskScore = Math.max(0, Math.min(100, riskScore + (scoreDifference / riskFactors.length)));
    
    onUpdateRiskScore(Math.round(newRiskScore));
  };
  
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Risk Assessment
          </h3>
          <p className="text-text-secondary">
            Analysis of potential clearance challenges and mitigation strategies
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${risk.bg} ${risk.color}`}>
          {risk.level} Risk
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-secondary">Clearance Difficulty</span>
          <span className="font-medium text-text-primary">{riskScore}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              riskScore >= 70 ? 'bg-red-500' : 
              riskScore >= 40 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${riskScore}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-text-primary">Key Risk Factors</h4>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-1 text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="text-sm">{showDetails ? 'Hide Details' : 'Show Details'}</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Risk Factors Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskFactors.map((factor) => (
            <div 
              key={factor.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {factor.impact === 'high' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : factor.impact === 'medium' ? (
                    <Info className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Shield className="w-4 h-4 text-green-500" />
                  )}
                  <span className="font-medium text-text-primary">{factor.name}</span>
                </div>
                <div className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${factor.impact === 'high' ? 'bg-red-100 text-red-600' : 
                    factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-green-100 text-green-600'}
                `}>
                  {factor.impact.charAt(0).toUpperCase() + factor.impact.slice(1)}
                </div>
              </div>
              
              <p className="text-sm text-text-secondary mb-2">
                {factor.description}
              </p>
              
              {showDetails && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {factor.mitigation && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-text-primary">Mitigation Strategy:</span>
                      <p className="text-xs text-text-secondary">{factor.mitigation}</p>
                    </div>
                  )}
                  
                  {onUpdateRiskScore && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-text-secondary">Adjust Risk:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleFactorAdjustment(factor.id, -5)}
                          className="p-1 text-text-secondary hover:text-green-500 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFactorAdjustment(factor.id, 5)}
                          className="p-1 text-text-secondary hover:text-red-500 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Potential Issues */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Potential Issues</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {riskScore >= 70 && (
                <>
                  <li>• Major label ownership may require higher licensing fees</li>
                  <li>• Popular track with previous clearance challenges</li>
                  <li>• Multiple rights holders may complicate negotiations</li>
                </>
              )}
              {riskScore >= 40 && riskScore < 70 && (
                <>
                  <li>• Some negotiation may be required for favorable terms</li>
                  <li>• Rights holder may request creative control over usage</li>
                  <li>• Approval process may take several weeks</li>
                </>
              )}
              {riskScore < 40 && (
                <>
                  <li>• Standard clearance process should be straightforward</li>
                  <li>• Reasonable licensing fees expected</li>
                  <li>• Quick turnaround time likely</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for risk assessment

function isMajorLabel(label: string): boolean {
  const majorLabels = [
    'Universal', 'Sony', 'Warner', 'EMI', 'Columbia', 'Atlantic',
    'Interscope', 'Capitol', 'Def Jam', 'RCA', 'Republic', 'Polydor'
  ];
  return majorLabels.some(major => label.includes(major));
}

function getAgeScore(releaseYear: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - releaseYear;
  
  if (age >= 70) return 5; // Public domain or close to it
  if (age >= 50) return 15;
  if (age >= 30) return 25;
  if (age >= 10) return 20;
  return 15; // Very recent tracks can sometimes be easier to clear
}

function getAgeImpact(releaseYear: number): 'high' | 'medium' | 'low' {
  const currentYear = new Date().getFullYear();
  const age = currentYear - releaseYear;
  
  if (age >= 50) return 'low';
  if (age >= 20) return 'medium';
  return 'medium';
}

function getAgeDescription(releaseYear: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - releaseYear;
  
  if (age >= 70) return 'which may be approaching public domain in some jurisdictions.';
  if (age >= 50) return 'which has established clearance precedents and may have more accessible rights holders.';
  if (age >= 30) return 'which is well-established but still actively protected.';
  if (age >= 10) return 'which is relatively recent and likely actively managed by rights holders.';
  return 'which is very recent and may have heightened protection from rights holders.';
}

function getAgeMitigation(releaseYear: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - releaseYear;
  
  if (age >= 70) return 'Research public domain status in your jurisdiction, as this may simplify clearance.';
  if (age >= 50) return 'Look for previous clearance examples to establish reasonable terms.';
  if (age >= 30) return 'Approach with standard clearance procedures and reasonable offer terms.';
  if (age >= 10) return 'Prepare a compelling case for your creative use and be ready to negotiate terms.';
  return 'Consider offering higher royalty percentages or creative control to increase chances of approval.';
}

function getPopularityScore(artist: string): number {
  // This would ideally use a real API to determine artist popularity
  // For now, we'll use a mock implementation
  const veryPopularArtists = [
    'Michael Jackson', 'The Beatles', 'Queen', 'Madonna', 'Beyoncé',
    'Drake', 'Taylor Swift', 'Ed Sheeran', 'Rihanna', 'Adele',
    'James Brown', 'Prince', 'David Bowie', 'Whitney Houston'
  ];
  
  const popularArtists = [
    'Coldplay', 'Radiohead', 'Kendrick Lamar', 'Daft Punk', 'The Weeknd',
    'Alicia Keys', 'Justin Timberlake', 'Kanye West', 'Lady Gaga'
  ];
  
  if (veryPopularArtists.some(a => artist.includes(a))) return 30;
  if (popularArtists.some(a => artist.includes(a))) return 20;
  return 10;
}

function getPopularityImpact(artist: string): 'high' | 'medium' | 'low' {
  const veryPopularArtists = [
    'Michael Jackson', 'The Beatles', 'Queen', 'Madonna', 'Beyoncé',
    'Drake', 'Taylor Swift', 'Ed Sheeran', 'Rihanna', 'Adele',
    'James Brown', 'Prince', 'David Bowie', 'Whitney Houston'
  ];
  
  const popularArtists = [
    'Coldplay', 'Radiohead', 'Kendrick Lamar', 'Daft Punk', 'The Weeknd',
    'Alicia Keys', 'Justin Timberlake', 'Kanye West', 'Lady Gaga'
  ];
  
  if (veryPopularArtists.some(a => artist.includes(a))) return 'high';
  if (popularArtists.some(a => artist.includes(a))) return 'medium';
  return 'low';
}

function getPopularityDescription(artist: string): string {
  const veryPopularArtists = [
    'Michael Jackson', 'The Beatles', 'Queen', 'Madonna', 'Beyoncé',
    'Drake', 'Taylor Swift', 'Ed Sheeran', 'Rihanna', 'Adele',
    'James Brown', 'Prince', 'David Bowie', 'Whitney Houston'
  ];
  
  const popularArtists = [
    'Coldplay', 'Radiohead', 'Kendrick Lamar', 'Daft Punk', 'The Weeknd',
    'Alicia Keys', 'Justin Timberlake', 'Kanye West', 'Lady Gaga'
  ];
  
  if (veryPopularArtists.some(a => artist.includes(a))) {
    return 'a highly popular artist with significant commercial value and likely strict sample clearance policies.';
  }
  if (popularArtists.some(a => artist.includes(a))) {
    return 'a well-known artist with established commercial value and standard clearance procedures.';
  }
  return 'a less mainstream artist, which may simplify the clearance process.';
}

function getPopularityMitigation(artist: string): string {
  const veryPopularArtists = [
    'Michael Jackson', 'The Beatles', 'Queen', 'Madonna', 'Beyoncé',
    'Drake', 'Taylor Swift', 'Ed Sheeran', 'Rihanna', 'Adele',
    'James Brown', 'Prince', 'David Bowie', 'Whitney Houston'
  ];
  
  const popularArtists = [
    'Coldplay', 'Radiohead', 'Kendrick Lamar', 'Daft Punk', 'The Weeknd',
    'Alicia Keys', 'Justin Timberlake', 'Kanye West', 'Lady Gaga'
  ];
  
  if (veryPopularArtists.some(a => artist.includes(a))) {
    return 'Be prepared for higher licensing fees and consider legal representation for negotiations.';
  }
  if (popularArtists.some(a => artist.includes(a))) {
    return 'Approach with professional clearance request and reasonable offer terms.';
  }
  return 'Direct contact with the artist or their management may yield more favorable terms.';
}

function getPreviousUsageScore(track: string): number {
  // This would ideally use a database of frequently sampled tracks
  // For now, we'll use a mock implementation
  const frequentlySampledTracks = [
    'Funky Drummer', 'Amen Break', 'Think', 'La Di Da Di',
    'Apache', 'Impeach the President', 'Synthetic Substitution',
    'Change the Beat', 'Bring the Noise', 'When the Levee Breaks'
  ];
  
  const moderatelySampledTracks = [
    'The Payback', 'Footsteps in the Dark', 'Nautilus',
    'Funky President', 'More Bounce to the Ounce',
    'Ain\'t No Sunshine', 'Darkest Light'
  ];
  
  if (frequentlySampledTracks.some(t => track.includes(t))) return 25;
  if (moderatelySampledTracks.some(t => track.includes(t))) return 15;
  return 5;
}

function getPreviousUsageImpact(track: string): 'high' | 'medium' | 'low' {
  const frequentlySampledTracks = [
    'Funky Drummer', 'Amen Break', 'Think', 'La Di Da Di',
    'Apache', 'Impeach the President', 'Synthetic Substitution',
    'Change the Beat', 'Bring the Noise', 'When the Levee Breaks'
  ];
  
  const moderatelySampledTracks = [
    'The Payback', 'Footsteps in the Dark', 'Nautilus',
    'Funky President', 'More Bounce to the Ounce',
    'Ain\'t No Sunshine', 'Darkest Light'
  ];
  
  if (frequentlySampledTracks.some(t => track.includes(t))) return 'high';
  if (moderatelySampledTracks.some(t => track.includes(t))) return 'medium';
  return 'low';
}

function getPreviousUsageDescription(track: string): string {
  const frequentlySampledTracks = [
    'Funky Drummer', 'Amen Break', 'Think', 'La Di Da Di',
    'Apache', 'Impeach the President', 'Synthetic Substitution',
    'Change the Beat', 'Bring the Noise', 'When the Levee Breaks'
  ];
  
  const moderatelySampledTracks = [
    'The Payback', 'Footsteps in the Dark', 'Nautilus',
    'Funky President', 'More Bounce to the Ounce',
    'Ain\'t No Sunshine', 'Darkest Light'
  ];
  
  if (frequentlySampledTracks.some(t => track.includes(t))) {
    return 'This track has been frequently sampled, which may indicate established clearance procedures but also potential fatigue from rights holders.';
  }
  if (moderatelySampledTracks.some(t => track.includes(t))) {
    return 'This track has been sampled several times, suggesting clearance is possible but may require negotiation.';
  }
  return 'This track has not been widely sampled, which may indicate fewer precedents but potentially more openness from rights holders.';
}

function getPreviousUsageMitigation(track: string): string {
  const frequentlySampledTracks = [
    'Funky Drummer', 'Amen Break', 'Think', 'La Di Da Di',
    'Apache', 'Impeach the President', 'Synthetic Substitution',
    'Change the Beat', 'Bring the Noise', 'When the Levee Breaks'
  ];
  
  const moderatelySampledTracks = [
    'The Payback', 'Footsteps in the Dark', 'Nautilus',
    'Funky President', 'More Bounce to the Ounce',
    'Ain\'t No Sunshine', 'Darkest Light'
  ];
  
  if (frequentlySampledTracks.some(t => track.includes(t))) {
    return 'Research previous clearance examples to understand typical terms and prepare a unique creative case for your usage.';
  }
  if (moderatelySampledTracks.some(t => track.includes(t))) {
    return 'Look for precedents in similar genres and prepare a professional clearance request.';
  }
  return 'Emphasize the creative and respectful use of the sample in your clearance request.';
}

