import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractResponseText, OpenRouterMessage } from '@/app/lib/openrouter';

export const runtime = 'nodejs';

const FAST_MODEL = 'anthropic/claude-3.5-haiku';

export interface GenerateSuggestionsRequest {
  freeformText: string;
  structuredData: {
    description: string;
    location: string;
    detectionMethod: string;
    timeline: string;
    urgency: 'low' | 'medium' | 'high';
  };
}

export interface GenerateSuggestionsResponse {
  success: boolean;
  suggestions?: Array<{
    text: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key not configured' } as GenerateSuggestionsResponse,
        { status: 500 }
      );
    }

    const body: GenerateSuggestionsRequest = await request.json();
    
    if (!body.freeformText || !body.structuredData) {
      return NextResponse.json(
        { success: false, error: 'freeformText and structuredData are required' } as GenerateSuggestionsResponse,
        { status: 400 }
      );
    }

    const systemPrompt = `You are helping a researcher create a threat bubble report. Generate 2-4 subtle, helpful suggestions about what information might be useful to add.

Suggestions should be:
- Non-intrusive and gentle
- Specific to what's missing
- Helpful prompts to think about what to include
- Short and actionable (one sentence each)

Return ONLY a valid JSON array with objects having these exact fields:
- text: The suggestion text (string)
- category: One of "detection_method", "timeline", "location", "findings", "technical", "other" (string)
- priority: One of "high", "medium", "low" (string)

Return ONLY the JSON array, no other text.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Current input:\n${body.freeformText}\n\nExtracted data:\n${JSON.stringify(body.structuredData, null, 2)}\n\nGenerate helpful suggestions.` 
      }
    ];

    const response = await callOpenRouter(messages, {
      model: FAST_MODEL,
      temperature: 0.5,
      max_tokens: 500
    });

    const content = extractResponseText(response);
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        success: true,
        suggestions: parsed.slice(0, 4) // Limit to 4
      } as GenerateSuggestionsResponse);
    }

    return NextResponse.json({
      success: true,
      suggestions: []
    } as GenerateSuggestionsResponse);

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      } as GenerateSuggestionsResponse,
      { status: 500 }
    );
  }
}

