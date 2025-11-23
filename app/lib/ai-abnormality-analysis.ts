// AI abnormality analysis utilities for freeform abnormality bubble creation

import { callAI, AIMessage } from './ai';

export interface StructuredAbnormalityData {
  description: string;
  location: string;
  detectionMethod: string;
  timeline: string;
  urgency: 'low' | 'medium' | 'high';
  detailedFindings?: string;
  specificLocation?: string;
  sampleCount?: number;
  geneticMarkers?: string[];
}

export interface PrivacyOrganizedContent {
  high: string; // Essential info only
  medium: string; // Adds anonymized details
  low: string; // Full technical details
}

export interface AISuggestion {
  text: string;
  category: 'detection_method' | 'timeline' | 'location' | 'findings' | 'technical' | 'other';
  priority: 'high' | 'medium' | 'low';
}

const FAST_MODEL = 'anthropic/claude-3.5-haiku'; // Fast model for real-time processing

/**
 * Analyzes freeform text input and extracts structured abnormality data
 */
export async function analyzeAbnormalityInput(freeformText: string): Promise<StructuredAbnormalityData> {
  const systemPrompt = `You are analyzing freeform text from a research lab about a potential abnormality detection. Extract structured information from the text.

Return a JSON object with these fields:
- description: A clear summary/description of the abnormality
- location: Geographic location or region (general, not specific)
- detectionMethod: How it was detected (e.g., "Wastewater monitoring", "Genomic sequencing", "Clinical surveillance", etc.)
- timeline: When it was detected or timeline information
- urgency: "low", "medium", or "high" based on the content
- detailedFindings: Optional detailed findings if mentioned
- specificLocation: Optional specific location if mentioned
- sampleCount: Optional number if mentioned
- geneticMarkers: Optional array of genetic markers if mentioned

If information is missing, use reasonable defaults or empty strings. Be concise and factual.`;

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Extract structured data from this abnormality report:\n\n${freeformText}` }
  ];

  try {
    const response = await callAI(messages, { 
      model: FAST_MODEL,
      temperature: 0.3,
      max_tokens: 1000
    });

    if (!response.content) {
      throw new Error('No content in AI response');
    }

    // Try to parse JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        description: parsed.description || '',
        location: parsed.location || '',
        detectionMethod: parsed.detectionMethod || '',
        timeline: parsed.timeline || '',
        urgency: parsed.urgency || 'medium',
        detailedFindings: parsed.detailedFindings,
        specificLocation: parsed.specificLocation,
        sampleCount: parsed.sampleCount,
        geneticMarkers: parsed.geneticMarkers || []
      };
    }

    // Fallback: return basic structure
    return {
      description: freeformText.substring(0, 200),
      location: '',
      detectionMethod: '',
      timeline: '',
      urgency: 'medium'
    };
  } catch (error) {
    console.error('Error analyzing abnormality input:', error);
    // Return fallback structure
    return {
      description: freeformText.substring(0, 200),
      location: '',
      detectionMethod: '',
      timeline: '',
      urgency: 'medium'
    };
  }
}

/**
 * Organizes content into privacy levels based on user-selected privacy level
 */
export async function organizeByPrivacyLevel(
  structuredData: StructuredAbnormalityData,
  privacyLevel: 'high' | 'medium' | 'low'
): Promise<PrivacyOrganizedContent> {
  const systemPrompt = `You are organizing abnormality information into three privacy levels for sharing:

HIGH PRIVACY: Only essential, non-sensitive information. No specific locations, no detailed findings, no technical markers.
MEDIUM PRIVACY: Adds anonymized details and general findings, but no specific technical data or exact locations.
LOW PRIVACY: Full details including specific locations, technical findings, sample counts, genetic markers.

The user has selected: ${privacyLevel.toUpperCase()} privacy level.

Organize the following abnormality data into these three levels. Return JSON with "high", "medium", and "low" keys, each containing the appropriate content for that privacy level.`;

  const dataSummary = `
Description: ${structuredData.description}
Location: ${structuredData.location}
Detection Method: ${structuredData.detectionMethod}
Timeline: ${structuredData.timeline}
Urgency: ${structuredData.urgency}
${structuredData.detailedFindings ? `Detailed Findings: ${structuredData.detailedFindings}` : ''}
${structuredData.specificLocation ? `Specific Location: ${structuredData.specificLocation}` : ''}
${structuredData.sampleCount ? `Sample Count: ${structuredData.sampleCount}` : ''}
${structuredData.geneticMarkers?.length ? `Genetic Markers: ${structuredData.geneticMarkers.join(', ')}` : ''}
`;

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Organize this abnormality data:\n\n${dataSummary}` }
  ];

  try {
    const response = await callAI(messages, {
      model: FAST_MODEL,
      temperature: 0.2,
      max_tokens: 1500
    });

    if (!response.content) {
      throw new Error('No content in AI response');
    }

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        high: parsed.high || structuredData.description,
        medium: parsed.medium || structuredData.description,
        low: parsed.low || structuredData.description
      };
    }

    // Fallback: use description for all levels
    return {
      high: structuredData.description,
      medium: structuredData.description,
      low: structuredData.description
    };
  } catch (error) {
    console.error('Error organizing by privacy level:', error);
    return {
      high: structuredData.description,
      medium: structuredData.description,
      low: structuredData.description
    };
  }
}

/**
 * Generates helpful suggestions for what the user might want to add
 */
export async function generateSuggestions(
  freeformText: string,
  structuredData: StructuredAbnormalityData
): Promise<AISuggestion[]> {
  const systemPrompt = `You are helping a researcher create an abnormality bubble report. Generate 2-4 subtle, helpful suggestions about what information might be useful to add.

Suggestions should be:
- Non-intrusive and gentle
- Specific to what's missing
- Helpful prompts to think about what to include
- Short and actionable

Return JSON array with objects: { "text": "suggestion text", "category": "detection_method|timeline|location|findings|technical|other", "priority": "high|medium|low" }`;

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Current input:\n${freeformText}\n\nExtracted data:\n${JSON.stringify(structuredData, null, 2)}\n\nGenerate helpful suggestions.` }
  ];

  try {
    const response = await callAI(messages, {
      model: FAST_MODEL,
      temperature: 0.5,
      max_tokens: 500
    });

    if (!response.content) {
      return [];
    }

    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.slice(0, 4); // Limit to 4 suggestions
    }

    return [];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}

/**
 * Integrates clarifications into structured data
 */
export async function integrateClarifications(
  structuredData: StructuredAbnormalityData,
  clarifications: Array<{ section: string; content: string }>
): Promise<StructuredAbnormalityData> {
  if (clarifications.length === 0) {
    return structuredData;
  }

  const systemPrompt = `You are integrating user clarifications into abnormality bubble data. Update the structured data with the clarifications provided. Return the updated JSON structure.`;

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { 
      role: 'user', 
      content: `Current data:\n${JSON.stringify(structuredData, null, 2)}\n\nClarifications:\n${JSON.stringify(clarifications, null, 2)}\n\nReturn updated structured data.` 
    }
  ];

  try {
    const response = await callAI(messages, {
      model: FAST_MODEL,
      temperature: 0.3,
      max_tokens: 1000
    });

    if (!response.content) {
      return structuredData;
    }

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return structuredData;
  } catch (error) {
    console.error('Error integrating clarifications:', error);
    return structuredData;
  }
}

