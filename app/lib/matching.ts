// Simple relevance matching algorithm for threat bubbles

import { ThreatBubble } from './mockData';
import { StoredThreatBubble } from './storage';
import { getThreatBubbles } from './storage';

export type ThreatBubbleUnion = ThreatBubble | StoredThreatBubble;

interface MatchScore {
  bubble: ThreatBubbleUnion;
  score: number;
  reasons: string[];
}

export function findRelevantThreatBubbles(
  sourceBubble: ThreatBubbleUnion,
  allBubbles: ThreatBubbleUnion[],
  limit: number = 5
): ThreatBubbleUnion[] {
  // Exclude the source bubble itself
  const otherBubbles = allBubbles.filter(b => b.id !== sourceBubble.id);
  
  const scored: MatchScore[] = otherBubbles.map(bubble => {
    let score = 0;
    const reasons: string[] = [];

    // Location matching (exact or region)
    if (bubble.location.toLowerCase().includes(sourceBubble.location.toLowerCase()) ||
        sourceBubble.location.toLowerCase().includes(bubble.location.toLowerCase())) {
      score += 30;
      reasons.push('Location match');
    }

    // Detection method similarity
    if (bubble.detectionMethod.toLowerCase() === sourceBubble.detectionMethod.toLowerCase()) {
      score += 25;
      reasons.push('Same detection method');
    }

    // Urgency level match (higher urgency = higher priority)
    if (bubble.urgency === sourceBubble.urgency) {
      score += 20;
      reasons.push('Similar urgency level');
    } else if (
      (bubble.urgency === 'high' && sourceBubble.urgency !== 'low') ||
      (sourceBubble.urgency === 'high' && bubble.urgency !== 'low')
    ) {
      score += 15;
      reasons.push('High urgency relevance');
    }

    // Timeline proximity (recent threats are more relevant)
    const sourceTime = new Date(sourceBubble.createdAt).getTime();
    const bubbleTime = new Date(bubble.createdAt).getTime();
    const daysDiff = Math.abs(sourceTime - bubbleTime) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) {
      score += 20;
      reasons.push('Recent timeline');
    } else if (daysDiff <= 14) {
      score += 10;
      reasons.push('Recent timeline');
    }

    // Keyword matching in description
    const sourceWords = sourceBubble.description.toLowerCase().split(/\s+/);
    const bubbleWords = bubble.description.toLowerCase().split(/\s+/);
    const commonWords = sourceWords.filter(word => 
      word.length > 4 && bubbleWords.includes(word)
    );
    if (commonWords.length > 0) {
      score += commonWords.length * 5;
      reasons.push(`Keyword match: ${commonWords.slice(0, 2).join(', ')}`);
    }

    // Genetic markers match (if available)
    if (sourceBubble.geneticMarkers && bubble.geneticMarkers) {
      const commonMarkers = sourceBubble.geneticMarkers.filter(m => 
        bubble.geneticMarkers!.includes(m)
      );
      if (commonMarkers.length > 0) {
        score += 40;
        reasons.push(`Genetic marker match: ${commonMarkers.length} markers`);
      }
    }

    return { bubble, score, reasons };
  });

  // Sort by score descending and return top matches
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.bubble);
}

import { MOCK_THREAT_BUBBLES } from './mockData';

export function getAllThreatBubbles(): ThreatBubbleUnion[] {
  // Combine stored bubbles with mock bubbles
  const stored = getThreatBubbles();
  return [...stored, ...MOCK_THREAT_BUBBLES];
}

