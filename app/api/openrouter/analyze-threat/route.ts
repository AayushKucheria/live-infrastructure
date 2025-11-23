import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractResponseText, OpenRouterMessage } from '@/app/lib/openrouter';

export const runtime = 'nodejs';

const FAST_MODEL = 'anthropic/claude-3.5-haiku';

export interface AnalyzeAbnormalityRequest {
  freeformText: string;
}

export interface AnalyzeAbnormalityResponse {
  success: boolean;
  data?: {
    description: string;
    location: string;
    detectionMethod: string;
    timeline: string;
    urgency: 'low' | 'medium' | 'high';
    detailedFindings?: string;
    specificLocation?: string;
    sampleCount?: number;
    geneticMarkers?: string[];
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key not configured' } as AnalyzeAbnormalityResponse,
        { status: 500 }
      );
    }

    const body: AnalyzeAbnormalityRequest = await request.json();
    
    if (!body.freeformText || typeof body.freeformText !== 'string') {
      return NextResponse.json(
        { success: false, error: 'freeformText is required' } as AnalyzeAbnormalityResponse,
        { status: 400 }
      );
    }

    const systemPrompt = `You are analyzing freeform text from a research lab about a potential abnormality detection. Extract structured information from the text.

Return ONLY valid JSON with these exact fields:
- description: A clear summary/description of the abnormality
- location: Geographic location or region (general, not specific)
- detectionMethod: How it was detected (e.g., "Wastewater monitoring", "Genomic sequencing", "Clinical surveillance", etc.)
- timeline: When it was detected or timeline information
- urgency: "low", "medium", or "high" based on the content
- detailedFindings: Optional detailed findings if mentioned (string or null)
- specificLocation: Optional specific location if mentioned (string or null)
- sampleCount: Optional number if mentioned (number or null)
- geneticMarkers: Optional array of genetic markers if mentioned (array of strings or null)

If information is missing, use reasonable defaults or empty strings. Be concise and factual. Return ONLY the JSON object, no other text.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Extract structured data from this abnormality report:\n\n${body.freeformText}` }
    ];

    const response = await callOpenRouter(messages, {
      model: FAST_MODEL,
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = extractResponseText(response);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        success: true,
        data: {
          description: parsed.description || '',
          location: parsed.location || '',
          detectionMethod: parsed.detectionMethod || '',
          timeline: parsed.timeline || '',
          urgency: parsed.urgency || 'medium',
          detailedFindings: parsed.detailedFindings || undefined,
          specificLocation: parsed.specificLocation || undefined,
          sampleCount: parsed.sampleCount || undefined,
          geneticMarkers: parsed.geneticMarkers || undefined
        }
      } as AnalyzeAbnormalityResponse);
    }

    // Fallback
    return NextResponse.json({
      success: true,
      data: {
        description: body.freeformText.substring(0, 200),
        location: '',
        detectionMethod: '',
        timeline: '',
        urgency: 'medium'
      }
    } as AnalyzeAbnormalityResponse);

  } catch (error) {
    console.error('Error analyzing abnormality:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      } as AnalyzeAbnormalityResponse,
      { status: 500 }
    );
  }
}

