import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractResponseText, OpenRouterMessage } from '@/app/lib/openrouter';
import { ThreatBubble } from '@/app/lib/mockData';
import { StoredThreatBubble } from '@/app/lib/storage';

export const runtime = 'nodejs';

type ThreatBubbleUnion = ThreatBubble | StoredThreatBubble;

export interface ExplainMatchRequest {
  sourceThreat: ThreatBubbleUnion;
  matchedThreat: ThreatBubbleUnion;
}

export interface ExplainMatchResponse {
  success: boolean;
  explanation?: string;
  error?: string;
}

const FAST_MODEL = 'openai/gpt-4o-mini';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key not configured' } as ExplainMatchResponse,
        { status: 500 }
      );
    }

    const body: ExplainMatchRequest = await request.json();
    
    if (!body.sourceThreat || !body.matchedThreat) {
      return NextResponse.json(
        { success: false, error: 'Source and matched threats are required' } as ExplainMatchResponse,
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert biosecurity analyst. Your task is to briefly explain why two threat reports are potential matches.
Compare the Location, Detection Method, Urgency, and Description of both threats.
Generate a concise 1-2 sentence explanation highlighting the key similarities that make this a relevant match.
Focus on shared characteristics like specific location overlap, similar symptoms/findings, or matching genetic markers.
Be direct and factual.

IMPORTANT PRIVACY RULES:
- The matched threat has a privacy level.
- If privacy level is HIGH: Do NOT mention specific locations, genetic markers, or specific organizations. Only refer to general region matches (e.g. "same region") or general method matches.
- If privacy level is MEDIUM: You can mention general findings but avoid specific genetic sequences or precise facility names.
- If privacy level is LOW: You can use all available details.
- RESPECT THESE CONSTRAINTS STRICTLY in your explanation.`;

    const userContent = `
Source Threat:
Location: ${body.sourceThreat.location}
Detection Method: ${body.sourceThreat.detectionMethod}
Urgency: ${body.sourceThreat.urgency}
Description: ${body.sourceThreat.description}
Genetic Markers: ${body.sourceThreat.geneticMarkers?.join(', ') || 'None'}

Matched Threat Candidate (Privacy Level: ${body.matchedThreat.privacyLevel || 'low'}):
Location: ${body.matchedThreat.location}
Detection Method: ${body.matchedThreat.detectionMethod}
Urgency: ${body.matchedThreat.urgency}
Description: ${body.matchedThreat.description}
Genetic Markers: ${body.matchedThreat.geneticMarkers?.join(', ') || 'None'}

Explain why this match is recommended in 1-2 sentences, respecting the privacy level of the matched threat.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ];

    const response = await callOpenRouter(messages, {
      model: FAST_MODEL,
      temperature: 0.3,
      max_tokens: 150
    });

    const explanation = extractResponseText(response);

    return NextResponse.json({
      success: true,
      explanation: explanation.trim()
    } as ExplainMatchResponse);

  } catch (error) {
    console.error('Error generating match explanation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ExplainMatchResponse,
      { status: 500 }
    );
  }
}

