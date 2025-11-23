// Client-side storage utilities using localStorage
import { normalizeLabId } from './mockData';
import { PRIMARY_LAB_ID } from './constants';

const STORAGE_KEYS = {
  CURRENT_LAB: 'currentLab',
  THREAT_BUBBLES: 'threatBubbles',
  COMMUNICATION_CHANNELS: 'communicationChannels'
};

function sanitizeLabId(labId?: string | null): string | null {
  if (!labId) {
    return null;
  }
  const normalized = normalizeLabId(labId);
  return normalized === PRIMARY_LAB_ID ? PRIMARY_LAB_ID : null;
}

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
    const sanitized = sanitizeLabId(labId);
    if (sanitized) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_LAB, sanitized);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_LAB);
    }
  }
}

export function getCurrentLab(): string | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_LAB);
    const sanitized = sanitizeLabId(stored);
    if (!sanitized && stored) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_LAB);
    }
    return sanitized;
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
    const normalizedBubble: StoredThreatBubble = {
      ...bubble,
      labId: normalizeLabId(bubble.labId)
    };
    const updated = [...existing.filter(b => b.id !== normalizedBubble.id), normalizedBubble];
    localStorage.setItem(STORAGE_KEYS.THREAT_BUBBLES, JSON.stringify(updated));
  }
}

export function getThreatBubbles(): StoredThreatBubble[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS.THREAT_BUBBLES);
    if (!stored) {
      return [];
    }
    const parsed: StoredThreatBubble[] = JSON.parse(stored);
    return parsed.map(bubble => ({
      ...bubble,
      labId: normalizeLabId(bubble.labId)
    }));
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

