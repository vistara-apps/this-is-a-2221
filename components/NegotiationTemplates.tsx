/**
 * NegotiationTemplates Component
 * 
 * This component provides templates for different negotiation scenarios
 * when contacting rights holders for sample clearance.
 */

import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, Edit2, Save } from 'lucide-react';
import { openaiService } from '@/lib/services/openai';
import { SUBSCRIPTION_LIMITS } from '@/lib/config/api';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
}

interface NegotiationTemplatesProps {
  projectName: string;
  sampleInfo: string;
  rightsHolder: string;
  subscriptionTier: 'free' | 'pro' | 'premium';
  onSelectTemplate: (content: string) => void;
}

export const NegotiationTemplates: React.FC<NegotiationTemplatesProps> = ({
  projectName,
  sampleInfo,
  rightsHolder,
  subscriptionTier,
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customizedContent, setCustomizedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get available templates based on subscription tier
  const availableTemplateCount = SUBSCRIPTION_LIMITS[subscriptionTier].negotiationTemplates;
  
  // Initialize templates
  useEffect(() => {
    const initialTemplates: Template[] = [
      {
        id: 'initial_request',
        name: 'Initial Request',
        description: 'First contact with the rights holder to request sample clearance',
        content: `
Subject: Sample Clearance Request for "${projectName}"

Dear ${rightsHolder},

I hope this email finds you well. My name is [Your Name], and I am reaching out regarding a sample clearance request for my upcoming project.

Project Details:
- Track Name: ${projectName}
- Sample Used: ${sampleInfo}
- Intended Use: [Brief description of how the sample will be used]

I am interested in obtaining proper clearance for this sample and would like to discuss the terms for licensing. I am prepared to offer [Royalty Percentage/Flat Fee] for the use of this sample.

Please let me know if you require any additional information or if there are specific procedures I should follow for this request.

Thank you for your time and consideration. I look forward to your response.

Best regards,
[Your Name]
[Your Contact Information]
        `.trim(),
      },
      {
        id: 'follow_up',
        name: 'Follow-Up',
        description: 'Follow up on an initial request that has not received a response',
        content: `
Subject: Follow-Up: Sample Clearance Request for "${projectName}"

Dear ${rightsHolder},

I hope this email finds you well. I am writing to follow up on my previous email sent on [Date] regarding a sample clearance request for my project "${projectName}".

I understand you may have a busy schedule, but I wanted to confirm that you received my initial request and inquire if you need any additional information to process this clearance.

As mentioned previously, I am seeking permission to use a sample from ${sampleInfo} in my upcoming release. I am flexible with the terms and would be happy to discuss what would work best for both parties.

Thank you for your time and consideration. I look forward to your response.

Best regards,
[Your Name]
[Your Contact Information]
        `.trim(),
      },
    ];
    
    if (subscriptionTier !== 'free') {
      initialTemplates.push({
        id: 'counter_offer',
        name: 'Counter Offer',
        description: 'Respond to a rights holder\'s terms with a counter offer',
        content: `
Subject: Re: Sample Clearance for "${projectName}" - Counter Offer

Dear ${rightsHolder},

Thank you for your response regarding my request to clear the sample from ${sampleInfo} for use in my project "${projectName}".

I appreciate the terms you've proposed, and I'm excited about the possibility of working together. After careful consideration, I would like to propose the following counter offer:

[Original Terms]
- [List their original terms]

[Counter Offer]
- [List your counter offer terms]

My counter offer is based on [provide justification, such as budget constraints, project scope, or industry standards for similar clearances].

I believe this proposal represents a fair arrangement that respects your rights while allowing me to complete my creative project. I'm open to further discussion to find terms that work for both of us.

Thank you for your consideration. I look forward to your response.

Best regards,
[Your Name]
[Your Contact Information]
        `.trim(),
      });
    }
    
    if (subscriptionTier === 'premium') {
      initialTemplates.push({
        id: 'agreement_confirmation',
        name: 'Agreement Confirmation',
        description: 'Confirm the agreed terms for sample clearance',
        content: `
Subject: Confirmation of Sample Clearance Terms for "${projectName}"

Dear ${rightsHolder},

I am writing to confirm our agreement regarding the clearance of the sample from ${sampleInfo} for use in my project "${projectName}".

As discussed, the terms of our agreement are as follows:

1. Sample: [Specific portion/timing of the sample]
2. Usage: [Specific usage rights granted]
3. Territory: [Geographic scope of the license]
4. Term: [Duration of the license]
5. Fee Structure: [Agreed payment terms]
   - [Advance payment details if applicable]
   - [Royalty percentage if applicable]
6. Credit: [How the original work will be credited]
7. Delivery: [How and when the final work will be delivered]

Please review these terms to ensure they accurately reflect our agreement. If everything is correct, please confirm by [signing and returning the attached formal agreement/replying to this email].

If you have any questions or if any adjustments are needed, please let me know at your earliest convenience.

Thank you for your cooperation throughout this process. I look forward to finalizing this agreement.

Best regards,
[Your Name]
[Your Contact Information]
        `.trim(),
      });
    }
    
    setTemplates(initialTemplates.slice(0, availableTemplateCount));
  }, [projectName, sampleInfo, rightsHolder, subscriptionTier, availableTemplateCount]);
  
  // Generate AI template
  const generateAITemplate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const content = await openaiService.generateNegotiationTemplate(
        projectName,
        sampleInfo,
        rightsHolder,
        'commercial release'
      );
      
      const aiTemplate: Template = {
        id: `ai_template_${Date.now()}`,
        name: 'AI Generated Template',
        description: 'Custom template generated based on your project details',
        content,
      };
      
      setTemplates(prev => [...prev, aiTemplate]);
      setSelectedTemplate(aiTemplate);
      setCustomizedContent(aiTemplate.content);
    } catch (error) {
      console.error('Error generating template:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle template selection
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setCustomizedContent(template.content);
    setIsEditing(false);
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(customizedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Handle use template
  const handleUseTemplate = () => {
    onSelectTemplate(customizedContent);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Negotiation Templates</h3>
        
        <button
          onClick={generateAITemplate}
          disabled={isGenerating || templates.length >= availableTemplateCount}
          className="btn-secondary text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Generate AI Template</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="text-sm text-text-secondary mb-2">
            Available Templates ({templates.length}/{availableTemplateCount})
          </div>
          
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedTemplate?.id === template.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  }
                `}
              >
                <h4 className="font-medium text-text-primary">{template.name}</h4>
                <p className="text-xs text-text-secondary mt-1">{template.description}</p>
              </div>
            ))}
            
            {templates.length < availableTemplateCount && subscriptionTier === 'free' && (
              <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <p className="text-sm text-text-secondary">
                  Upgrade to Pro for more templates
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-2">
          {selectedTemplate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-text-primary">{selectedTemplate.name}</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {isEditing ? (
                <textarea
                  value={customizedContent}
                  onChange={(e) => setCustomizedContent(e.target.value)}
                  className="input-field min-h-[300px] font-mono text-sm"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm text-text-primary overflow-auto max-h-[400px]">
                  {customizedContent}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={handleUseTemplate}
                  className="btn-primary"
                >
                  Use This Template
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-text-secondary">
                Select a template from the list to view and customize
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

