// Client-side storage utilities using localStorage

const STORAGE_KEYS = {
  CURRENT_LAB: 'currentLab',
  THREAT_BUBBLES: 'threatBubbles',
  COMMUNICATION_CHANNELS: 'communicationChannels'
};

export interface ClarificationAnnotation {
  id: string;
  section: string; // Which section of the artifact this applies to
  content: string;
  createdAt: string;
}

export interface StoredThreatBubble {
  id: string;
  labId: string;
  description: string;
  location: string;
  detectionMethod: string;
  timeline: string;
  urgency: 'low' | 'medium' | 'high';
  privacyLevel: 'high' | 'medium' | 'low';
  createdAt: string;
  detailedFindings?: string;
  specificLocation?: string;
  sampleCount?: number;
  geneticMarkers?: string[];
  // New fields for AI-driven creation
  rawFreeformInput?: string; // Original freeform text input
  clarifications?: ClarificationAnnotation[]; // User-added clarifications
}

export interface StoredCommunicationChannel {
  id: string;
  threatBubbleId: string;
  participants: string[];
  messages: Array<{
    id: string;
    fromLabId: string;
    type: 'request' | 'send' | 'conditional';
    content: string;
    timestamp: string;
    conditions?: string;
  }>;
}

// Current lab storage
export function setCurrentLab(labId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CURRENT_LAB, labId);
  }
}

export function getCurrentLab(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_LAB);
  }
  return null;
}

export function clearCurrentLab(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_LAB);
  }
}

// Threat bubbles storage
export function saveThreatBubble(bubble: StoredThreatBubble): void {
  if (typeof window !== 'undefined') {
    const existing = getThreatBubbles();
    const updated = [...existing.filter(b => b.id !== bubble.id), bubble];
    localStorage.setItem(STORAGE_KEYS.THREAT_BUBBLES, JSON.stringify(updated));
  }
}

export function getThreatBubbles(): StoredThreatBubble[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS.THREAT_BUBBLES);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
}

export function getThreatBubbleById(id: string): StoredThreatBubble | undefined {
  return getThreatBubbles().find(b => b.id === id);
}

// Communication channels storage
export function saveCommunicationChannel(channel: StoredCommunicationChannel): void {
  if (typeof window !== 'undefined') {
    const existing = getCommunicationChannels();
    const updated = [...existing.filter(c => c.id !== channel.id), channel];
    localStorage.setItem(STORAGE_KEYS.COMMUNICATION_CHANNELS, JSON.stringify(updated));
  }
}

export function getCommunicationChannels(): StoredCommunicationChannel[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS.COMMUNICATION_CHANNELS);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
}

export function getCommunicationChannelById(id: string): StoredCommunicationChannel | undefined {
  return getCommunicationChannels().find(c => c.id === id);
}

export function getCommunicationChannelsByThreatBubble(threatBubbleId: string): StoredCommunicationChannel[] {
  return getCommunicationChannels().filter(c => c.threatBubbleId === threatBubbleId);
}

