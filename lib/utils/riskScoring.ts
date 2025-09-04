/**
 * Risk Scoring Utility
 * 
 * This utility provides functions for calculating risk scores for sample clearance
 * based on various factors like label ownership, track age, artist popularity, etc.
 */

interface RiskFactor {
  name: string;
  weight: number;
  score: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
  mitigation?: string;
}

interface RiskAssessmentResult {
  totalScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  factors: RiskFactor[];
  potentialIssues: string[];
  mitigationStrategies: string[];
}

/**
 * Calculate risk score based on various factors
 */
export function calculateRiskScore(
  sourceTrack: string,
  originalArtist: string,
  rightsHolder: string,
  releaseYear: number,
  label: string
): RiskAssessmentResult {
  // Calculate individual risk factors
  const labelFactor = assessLabelRisk(label);
  const ageFactor = assessAgeRisk(releaseYear);
  const popularityFactor = assessPopularityRisk(originalArtist);
  const usageFactor = assessPreviousUsageRisk(sourceTrack);
  
  // Combine all factors
  const factors = [labelFactor, ageFactor, popularityFactor, usageFactor];
  
  // Calculate weighted average
  const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
  const weightedScore = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0) / totalWeight;
  
  // Round to nearest integer
  const totalScore = Math.round(weightedScore);
  
  // Determine risk level
  const riskLevel = totalScore >= 70 ? 'high' : totalScore >= 40 ? 'medium' : 'low';
  
  // Generate potential issues
  const potentialIssues = generatePotentialIssues(riskLevel, factors);
  
  // Generate mitigation strategies
  const mitigationStrategies = factors
    .filter(factor => factor.mitigation)
    .map(factor => factor.mitigation as string);
  
  return {
    totalScore,
    riskLevel,
    factors,
    potentialIssues,
    mitigationStrategies,
  };
}

/**
 * Assess risk based on label ownership
 */
function assessLabelRisk(label: string): RiskFactor {
  const majorLabels = [
    'Universal', 'Sony', 'Warner', 'EMI', 'Columbia', 'Atlantic',
    'Interscope', 'Capitol', 'Def Jam', 'RCA', 'Republic', 'Polydor'
  ];
  
  const isMajorLabel = majorLabels.some(major => label.includes(major));
  
  return {
    name: 'Label Ownership',
    weight: 3,
    score: isMajorLabel ? 80 : 40,
    impact: isMajorLabel ? 'high' : 'medium',
    description: isMajorLabel
      ? 'The sample is owned by a major label, which typically have stricter clearance processes and higher fees.'
      : 'The sample is owned by an independent label, which may be more flexible with clearance terms.',
    mitigation: isMajorLabel
      ? 'Consider budgeting for higher licensing fees or exploring alternative samples.'
      : 'Reach out directly to the label with a personalized approach.',
  };
}

/**
 * Assess risk based on track age
 */
function assessAgeRisk(releaseYear: number): RiskFactor {
  const currentYear = new Date().getFullYear();
  const age = currentYear - releaseYear;
  
  let score: number;
  let impact: 'high' | 'medium' | 'low';
  let description: string;
  let mitigation: string;
  
  if (age >= 70) {
    score = 20;
    impact = 'low';
    description = 'The track may be approaching public domain in some jurisdictions.';
    mitigation = 'Research public domain status in your jurisdiction, as this may simplify clearance.';
  } else if (age >= 50) {
    score = 30;
    impact = 'low';
    description = 'The track has established clearance precedents and may have more accessible rights holders.';
    mitigation = 'Look for previous clearance examples to establish reasonable terms.';
  } else if (age >= 30) {
    score = 40;
    impact = 'medium';
    description = 'The track is well-established but still actively protected.';
    mitigation = 'Approach with standard clearance procedures and reasonable offer terms.';
  } else if (age >= 10) {
    score = 60;
    impact = 'medium';
    description = 'The track is relatively recent and likely actively managed by rights holders.';
    mitigation = 'Prepare a compelling case for your creative use and be ready to negotiate terms.';
  } else {
    score = 75;
    impact = 'high';
    description = 'The track is very recent and may have heightened protection from rights holders.';
    mitigation = 'Consider offering higher royalty percentages or creative control to increase chances of approval.';
  }
  
  return {
    name: 'Track Age',
    weight: 2,
    score,
    impact,
    description,
    mitigation,
  };
}

/**
 * Assess risk based on artist popularity
 */
function assessPopularityRisk(artist: string): RiskFactor {
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
  
  let score: number;
  let impact: 'high' | 'medium' | 'low';
  let description: string;
  let mitigation: string;
  
  if (veryPopularArtists.some(a => artist.includes(a))) {
    score = 85;
    impact = 'high';
    description = 'The artist is highly popular with significant commercial value and likely strict sample clearance policies.';
    mitigation = 'Be prepared for higher licensing fees and consider legal representation for negotiations.';
  } else if (popularArtists.some(a => artist.includes(a))) {
    score = 65;
    impact = 'medium';
    description = 'The artist is well-known with established commercial value and standard clearance procedures.';
    mitigation = 'Approach with professional clearance request and reasonable offer terms.';
  } else {
    score = 35;
    impact = 'low';
    description = 'The artist is less mainstream, which may simplify the clearance process.';
    mitigation = 'Direct contact with the artist or their management may yield more favorable terms.';
  }
  
  return {
    name: 'Artist Popularity',
    weight: 2.5,
    score,
    impact,
    description,
    mitigation,
  };
}

/**
 * Assess risk based on previous sample usage
 */
function assessPreviousUsageRisk(track: string): RiskFactor {
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
  
  let score: number;
  let impact: 'high' | 'medium' | 'low';
  let description: string;
  let mitigation: string;
  
  if (frequentlySampledTracks.some(t => track.includes(t))) {
    score = 70;
    impact = 'high';
    description = 'This track has been frequently sampled, which may indicate established clearance procedures but also potential fatigue from rights holders.';
    mitigation = 'Research previous clearance examples to understand typical terms and prepare a unique creative case for your usage.';
  } else if (moderatelySampledTracks.some(t => track.includes(t))) {
    score = 50;
    impact = 'medium';
    description = 'This track has been sampled several times, suggesting clearance is possible but may require negotiation.';
    mitigation = 'Look for precedents in similar genres and prepare a professional clearance request.';
  } else {
    score = 30;
    impact = 'low';
    description = 'This track has not been widely sampled, which may indicate fewer precedents but potentially more openness from rights holders.';
    mitigation = 'Emphasize the creative and respectful use of the sample in your clearance request.';
  }
  
  return {
    name: 'Previous Sample Usage',
    weight: 2.5,
    score,
    impact,
    description,
    mitigation,
  };
}

/**
 * Generate potential issues based on risk level and factors
 */
function generatePotentialIssues(riskLevel: 'high' | 'medium' | 'low', factors: RiskFactor[]): string[] {
  const highImpactFactors = factors.filter(factor => factor.impact === 'high');
  
  if (riskLevel === 'high') {
    return [
      'Major label ownership may require higher licensing fees',
      'Popular track with previous clearance challenges',
      'Multiple rights holders may complicate negotiations',
      ...highImpactFactors.map(factor => `${factor.name} presents significant challenges: ${factor.description}`),
    ];
  } else if (riskLevel === 'medium') {
    return [
      'Some negotiation may be required for favorable terms',
      'Rights holder may request creative control over usage',
      'Approval process may take several weeks',
      ...highImpactFactors.map(factor => `${factor.name} presents challenges: ${factor.description}`),
    ];
  } else {
    return [
      'Standard clearance process should be straightforward',
      'Reasonable licensing fees expected',
      'Quick turnaround time likely',
    ];
  }
}

/**
 * Get risk level color
 */
export function getRiskLevelColor(score: number): { level: string; color: string; bg: string } {
  if (score >= 70) return { level: 'High', color: 'text-red-500', bg: 'bg-red-100' };
  if (score >= 40) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
  return { level: 'Low', color: 'text-green-500', bg: 'bg-green-100' };
}

