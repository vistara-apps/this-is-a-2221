/**
 * Document Generator Utility
 * 
 * This utility generates various types of documents for sample clearance,
 * including clearance requests, agreements, and usage documentation.
 */

import { Project, NegotiationAttempt, SampleSegment } from '../types';

export interface DocumentOptions {
  format: 'txt' | 'pdf' | 'doc';
  includeNegotiationHistory?: boolean;
  includeRiskAssessment?: boolean;
  includeMetadata?: boolean;
  signatureDataUrl?: string;
}

export interface GeneratedDocument {
  content: string | Blob;
  filename: string;
  mimeType: string;
}

/**
 * Generate a clearance request document
 */
export function generateClearanceRequest(
  project: Project,
  segments: SampleSegment[],
  options: DocumentOptions
): GeneratedDocument {
  const content = `
SAMPLE CLEARANCE REQUEST
========================
Date: ${new Date().toLocaleDateString()}

PROJECT INFORMATION
------------------
Project Name: ${project.trackName}
Artist: [Your Artist Name]
Expected Release Date: [Release Date]

SAMPLE INFORMATION
-----------------
Original Track: ${project.identifiedSourceTrack || 'Unknown'}
Original Artist: ${segments[0]?.originalArtist || 'Unknown'}
Rights Holder: ${project.rightsHolderInfo || 'Unknown'}

SAMPLE USAGE DETAILS
------------------
${segments.map((segment, index) => `
Segment ${index + 1}:
- Start Time: ${segment.startTime.toFixed(2)} seconds
- End Time: ${segment.endTime.toFixed(2)} seconds
- Duration: ${(segment.endTime - segment.startTime).toFixed(2)} seconds
`).join('')}

PROPOSED TERMS
-------------
[Describe your proposed terms here, including royalty percentages, flat fees, etc.]

CONTACT INFORMATION
-----------------
Name: [Your Name]
Email: [Your Email]
Phone: [Your Phone]

I am requesting permission to use the above-mentioned sample in my project. I am committed to respecting your intellectual property rights and am open to discussing fair compensation for the use of this material.

Please let me know if you require any additional information to process this request.

Thank you for your consideration.

Sincerely,
[Your Name]
  `.trim();
  
  return {
    content,
    filename: `${project.trackName.replace(/\s+/g, '_')}_clearance_request.txt`,
    mimeType: 'text/plain',
  };
}

/**
 * Generate a clearance agreement document
 */
export function generateClearanceAgreement(
  project: Project,
  segments: SampleSegment[],
  options: DocumentOptions
): GeneratedDocument {
  const content = `
SAMPLE CLEARANCE AGREEMENT
=========================
Date: ${new Date().toLocaleDateString()}

PARTIES
------
Licensor: ${project.rightsHolderInfo || '[Rights Holder Name]'}
Licensee: [Your Name/Company]

SAMPLE INFORMATION
-----------------
Original Track: ${project.identifiedSourceTrack || 'Unknown'}
Original Artist: ${segments[0]?.originalArtist || 'Unknown'}
Original Release Date: [Original Release Date]
Original Label: [Original Label]

LICENSED MATERIAL
---------------
${segments.map((segment, index) => `
Segment ${index + 1}:
- Start Time: ${segment.startTime.toFixed(2)} seconds
- End Time: ${segment.endTime.toFixed(2)} seconds
- Duration: ${(segment.endTime - segment.startTime).toFixed(2)} seconds
`).join('')}

TERMS OF LICENSE
--------------
1. GRANT OF RIGHTS: Licensor grants to Licensee the non-exclusive right to use the Licensed Material in the New Composition.

2. TERRITORY: [Worldwide/Specific Territories]

3. TERM: [Perpetuity/Specific Term]

4. COMPENSATION:
   - Flat Fee: [Amount]
   - Royalty: [Percentage]% of [Net Revenue/Gross Revenue]
   - Advance: [Amount]

5. CREDIT: Licensee agrees to provide the following credit:
   "[Original Track] performed by [Original Artist], used courtesy of [Rights Holder]"

6. REPRESENTATIONS AND WARRANTIES: Licensor represents and warrants that it owns or controls the necessary rights to grant this license.

7. INDEMNIFICATION: [Standard indemnification clause]

8. GOVERNING LAW: This Agreement shall be governed by the laws of [Jurisdiction].

SIGNATURES
---------
Licensor: __________________________ Date: __________

Licensee: __________________________ Date: __________
  `.trim();
  
  return {
    content,
    filename: `${project.trackName.replace(/\s+/g, '_')}_clearance_agreement.txt`,
    mimeType: 'text/plain',
  };
}

/**
 * Generate a usage documentation report
 */
export function generateUsageDocumentation(
  project: Project,
  segments: SampleSegment[],
  negotiations: NegotiationAttempt[],
  options: DocumentOptions
): GeneratedDocument {
  let content = `
SAMPLE USAGE DOCUMENTATION
=========================
Date: ${new Date().toLocaleDateString()}

PROJECT INFORMATION
------------------
Project Name: ${project.trackName}
Artist: [Your Artist Name]
Release Date: [Release Date]

SAMPLE INFORMATION
-----------------
Original Track: ${project.identifiedSourceTrack || 'Unknown'}
Original Artist: ${segments[0]?.originalArtist || 'Unknown'}
Rights Holder: ${project.rightsHolderInfo || 'Unknown'}
Clearance Status: ${project.clearanceStatus.toUpperCase()}

SAMPLE USAGE DETAILS
------------------
${segments.map((segment, index) => `
Segment ${index + 1}:
- Start Time: ${segment.startTime.toFixed(2)} seconds
- End Time: ${segment.endTime.toFixed(2)} seconds
- Duration: ${(segment.endTime - segment.startTime).toFixed(2)} seconds
`).join('')}

CLEARANCE TERMS
-------------
[Document the final agreed terms here]

`;

  // Include negotiation history if requested
  if (options.includeNegotiationHistory && negotiations.length > 0) {
    content += `
NEGOTIATION HISTORY
-----------------
${negotiations.map((negotiation, index) => `
Communication ${index + 1}:
- Date: ${negotiation.dateSent.toLocaleDateString()}
- Contacted: ${negotiation.contactedRightsHolder}
- Status: ${negotiation.status.toUpperCase()}
${negotiation.response ? `- Response: ${negotiation.response.substring(0, 100)}...` : '- No response received'}
`).join('')}
`;
  }

  // Include risk assessment if requested
  if (options.includeRiskAssessment && project.riskScore !== undefined) {
    content += `
RISK ASSESSMENT
-------------
Risk Score: ${project.riskScore}%
Risk Level: ${project.riskScore >= 70 ? 'High' : project.riskScore >= 40 ? 'Medium' : 'Low'}
Risk Factors:
- Major label ownership
- Previous sample usage
- Artist popularity
- Track age
`;
  }

  // Include metadata if requested
  if (options.includeMetadata) {
    content += `
METADATA
-------
Project ID: ${project.projectId}
User ID: ${project.userId}
Created At: ${project.createdAt.toISOString()}
Last Updated: ${new Date().toISOString()}
`;
  }

  content += `
CERTIFICATION
-----------
I certify that all information provided in this document is true and accurate to the best of my knowledge.

Name: [Your Name]
Date: ${new Date().toLocaleDateString()}
Signature: [Signature]
`;

  return {
    content,
    filename: `${project.trackName.replace(/\s+/g, '_')}_usage_documentation.txt`,
    mimeType: 'text/plain',
  };
}

/**
 * Download a generated document
 */
export function downloadDocument(document: GeneratedDocument): void {
  const blob = document.content instanceof Blob 
    ? document.content 
    : new Blob([document.content], { type: document.mimeType });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = document.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate a PDF document (mock implementation)
 * In a real application, this would use a library like pdfmake or jsPDF
 */
export function generatePdfDocument(content: string, filename: string): GeneratedDocument {
  // This is a mock implementation
  // In a real application, you would use a library like pdfmake or jsPDF
  console.log('Generating PDF document:', filename);
  console.log('Content:', content);
  
  // For now, just return the text content
  return {
    content,
    filename,
    mimeType: 'text/plain',
  };
}

/**
 * Generate a DOC document (mock implementation)
 * In a real application, this would use a library like docx
 */
export function generateDocDocument(content: string, filename: string): GeneratedDocument {
  // This is a mock implementation
  // In a real application, you would use a library like docx
  console.log('Generating DOC document:', filename);
  console.log('Content:', content);
  
  // For now, just return the text content
  return {
    content,
    filename,
    mimeType: 'text/plain',
  };
}

