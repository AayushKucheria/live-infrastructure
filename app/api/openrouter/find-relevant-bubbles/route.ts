import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractResponseText, OpenRouterMessage } from '@/app/lib/openrouter';
import { AbnormalityBubble } from '@/app/lib/mockData';
import { StoredAbnormalityBubble } from '@/app/lib/storage';

export const runtime = 'nodejs';

type AbnormalityBubbleUnion = AbnormalityBubble | StoredAbnormalityBubble;

export interface FindRelevantBubblesRequest {
  sourceAbnormality: AbnormalityBubbleUnion;
  candidateBubbles: AbnormalityBubbleUnion[];
  limit?: number;
}

export interface RelevantBubble {
  bubble: AbnormalityBubbleUnion;
  relevanceScore: number;
  explanation: string;
}

export interface FindRelevantBubblesResponse {
  success: boolean;
  relevantBubbles?: RelevantBubble[];
  error?: string;
}

const FAST_MODEL = 'openai/gpt-4o-mini';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key not configured' } as FindRelevantBubblesResponse,
        { status: 500 }
      );
    }

    const body: FindRelevantBubblesRequest = await request.json();
    
    if (!body.sourceAbnormality || !body.candidateBubbles || !Array.isArray(body.candidateBubbles)) {
      return NextResponse.json(
        { success: false, error: 'Source abnormality and candidate bubbles array are required' } as FindRelevantBubblesResponse,
        { status: 400 }
      );
    }

    const limit = body.limit || 3;
    
    // Filter out the source abnormality from candidates
    const candidates = body.candidateBubbles.filter(b => b.id !== body.sourceAbnormality.id);
    
    if (candidates.length === 0) {
      return NextResponse.json({
        success: true,
        relevantBubbles: []
      } as FindRelevantBubblesResponse);
    }

    // Build candidate descriptions for AI analysis
    const candidateDescriptions = candidates.map((bubble, index) => {
      return `Candidate ${index + 1} (ID: ${bubble.id}):
- Location: ${bubble.location}
- Detection Method: ${bubble.detectionMethod}
- Urgency: ${bubble.urgency}
- Description: ${bubble.description}
- Timeline: ${bubble.timeline}
- Privacy Level: ${bubble.privacyLevel}
${bubble.geneticMarkers && bubble.geneticMarkers.length > 0 ? `- Genetic Markers: ${bubble.geneticMarkers.join(', ')}` : ''}
${bubble.detailedFindings ? `- Detailed Findings: ${bubble.detailedFindings}` : ''}`;
    }).join('\n\n');

    const systemPrompt = `You are an expert biosecurity analyst. Your task is to identify the most relevant abnormality reports that could be connected to a source abnormality.

Analyze each candidate abnormality and determine its relevance based on:
1. Description similarity (symptoms, patterns, findings)
2. Location relevance (same region, nearby areas, or related geographic context)
3. Detection method similarity or complementarity
4. Urgency level alignment
5. Timeline proximity or sequential patterns
6. Genetic markers overlap (if available)
7. Contextual connections (e.g., similar detection contexts, related research areas)

For each relevant candidate, provide:
- A relevance score from 0-100 (higher = more relevant)
- A brief 1-2 sentence explanation of why it's relevant

Return ONLY a valid JSON array with objects having these exact fields:
- candidateIndex: The index number (0-based) of the candidate from the list
- relevanceScore: A number from 0-100
- explanation: A 1-2 sentence explanation of relevance

Return ONLY the top ${limit} most relevant candidates, sorted by relevanceScore descending.
Return ONLY the JSON array, no other text.`;

    const userContent = `Source Abnormality:
Location: ${body.sourceAbnormality.location}
Detection Method: ${body.sourceAbnormality.detectionMethod}
Urgency: ${body.sourceAbnormality.urgency}
Description: ${body.sourceAbnormality.description}
Timeline: ${body.sourceAbnormality.timeline}
${body.sourceAbnormality.geneticMarkers && body.sourceAbnormality.geneticMarkers.length > 0 ? `Genetic Markers: ${body.sourceAbnormality.geneticMarkers.join(', ')}` : ''}
${body.sourceAbnormality.detailedFindings ? `Detailed Findings: ${body.sourceAbnormality.detailedFindings}` : ''}

Candidate Abnormalities:
${candidateDescriptions}

Identify the top ${limit} most relevant candidates and return them as a JSON array.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ];

    const response = await callOpenRouter(messages, {
      model: FAST_MODEL,
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = extractResponseText(response);
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      try {
        const parsed: Array<{ candidateIndex: number; relevanceScore: number; explanation: string }> = JSON.parse(jsonMatch[0]);
        
        // Map the results back to actual bubbles
        const relevantBubbles: RelevantBubble[] = parsed
          .filter(item => item.candidateIndex >= 0 && item.candidateIndex < candidates.length)
          .map(item => ({
            bubble: candidates[item.candidateIndex],
            relevanceScore: item.relevanceScore,
            explanation: item.explanation
          }))
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, limit);

        return NextResponse.json({
          success: true,
          relevantBubbles
        } as FindRelevantBubblesResponse);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to simple matching if AI parsing fails
        return fallbackToSimpleMatching(body.sourceAbnormality, candidates, limit);
      }
    }

    // Fallback if no JSON found
    return fallbackToSimpleMatching(body.sourceAbnormality, candidates, limit);

  } catch (error) {
    console.error('Error finding relevant bubbles:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      } as FindRelevantBubblesResponse,
      { status: 500 }
    );
  }
}

// Fallback function using simple matching logic
function fallbackToSimpleMatching(
  source: AbnormalityBubbleUnion,
  candidates: AbnormalityBubbleUnion[],
  limit: number
): NextResponse<FindRelevantBubblesResponse> {
  const scored = candidates.map(bubble => {
    let score = 0;
    
    // Location matching
    if (bubble.location.toLowerCase().includes(source.location.toLowerCase()) ||
        source.location.toLowerCase().includes(bubble.location.toLowerCase())) {
      score += 30;
    }
    
    // Detection method similarity
    if (bubble.detectionMethod.toLowerCase() === source.detectionMethod.toLowerCase()) {
      score += 25;
    }
    
    // Urgency match
    if (bubble.urgency === source.urgency) {
      score += 20;
    }
    
    // Timeline proximity
    const sourceTime = new Date(source.createdAt).getTime();
    const bubbleTime = new Date(bubble.createdAt).getTime();
    const daysDiff = Math.abs(sourceTime - bubbleTime) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) {
      score += 20;
    } else if (daysDiff <= 14) {
      score += 10;
    }
    
    // Keyword matching
    const sourceWords = source.description.toLowerCase().split(/\s+/);
    const bubbleWords = bubble.description.toLowerCase().split(/\s+/);
    const commonWords = sourceWords.filter(word => 
      word.length > 4 && bubbleWords.includes(word)
    );
    score += commonWords.length * 5;
    
    // Genetic markers
    if (source.geneticMarkers && bubble.geneticMarkers) {
      const commonMarkers = source.geneticMarkers.filter(m => 
        bubble.geneticMarkers!.includes(m)
      );
      if (commonMarkers.length > 0) {
        score += 40;
      }
    }
    
    return {
      bubble,
      relevanceScore: Math.min(score, 100),
      explanation: `Relevant based on ${score > 50 ? 'strong' : 'moderate'} similarity in location, detection method, or timeline.`
    };
  });

  const relevantBubbles = scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);

  return NextResponse.json({
    success: true,
    relevantBubbles
  } as FindRelevantBubblesResponse);
}

