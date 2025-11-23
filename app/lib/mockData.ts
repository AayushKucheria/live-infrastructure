// Mock data for labs, situations, and threat bubbles

export interface Lab {
  id: string;
  name: string;
  situation: string;
  location: string;
  type: string;
}

export interface ThreatBubble {
  id: string;
  labId: string;
  description: string;
  location: string;
  detectionMethod: string;
  timeline: string;
  urgency: 'low' | 'medium' | 'high';
  privacyLevel: 'high' | 'medium' | 'low';
  createdAt: string;
  // Additional fields that may be filtered based on privacy level
  detailedFindings?: string;
  specificLocation?: string;
  sampleCount?: number;
  geneticMarkers?: string[];
}

export interface CommunicationChannel {
  id: string;
  threatBubbleId: string;
  participants: string[]; // labIds
  messages: Array<{
    id: string;
    fromLabId: string;
    type: 'request' | 'send' | 'conditional';
    content: string;
    timestamp: string;
    conditions?: string; // For conditional information flows
  }>;
}

// Mock labs with predefined situations
export const MOCK_LABS: Lab[] = [
  {
    id: 'india-niv',
    name: 'National Institute of Virology (NIV)',
    situation: 'Detected unusual pattern in local wastewater samples - possible novel pathogen, but not sure, don\'t want to cause panic',
    location: 'Pune, India',
    type: 'National Biosecurity Agency'
  },
  {
    id: 'uk-ukhsa',
    name: 'UK Health Security Agency (UKHSA)',
    situation: 'Has seen similar genetic markers in respiratory illness cases, but assumed it was flu variant',
    location: 'London, UK',
    type: 'National Public Health Agency'
  },
  {
    id: 'us-cdc',
    name: 'US Centers for Disease Control and Prevention (CDC)',
    situation: 'Has modeling suggesting something should be emerging but no concrete data',
    location: 'Atlanta, USA',
    type: 'National Public Health Agency'
  },
  {
    id: 'singapore-ncid',
    name: 'National Centre for Infectious Diseases (NCID)',
    situation: 'Airport screening detected unusual respiratory patterns in travelers from Southeast Asia',
    location: 'Singapore',
    type: 'National Infectious Disease Center'
  },
  {
    id: 'brazil-fiocruz',
    name: 'Fiocruz - Oswaldo Cruz Foundation',
    situation: 'Hospital network reporting increased cases of atypical pneumonia with unknown etiology',
    location: 'Rio de Janeiro, Brazil',
    type: 'National Health Research Institute'
  }
];

// Mock threat bubbles from other labs (for demonstration)
export const MOCK_THREAT_BUBBLES: ThreatBubble[] = [
  {
    id: 'threat-1',
    labId: 'uk-ukhsa',
    description: 'Unusual genetic markers detected in respiratory samples',
    location: 'United Kingdom',
    detectionMethod: 'Genomic sequencing',
    timeline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'medium',
    privacyLevel: 'medium',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Genetic markers show 85% similarity to known flu variants but with novel mutations in spike protein region',
    specificLocation: 'London hospitals',
    sampleCount: 47,
    geneticMarkers: ['MUT-2024-001', 'MUT-2024-002']
  },
  {
    id: 'threat-2',
    labId: 'singapore-ncid',
    description: 'Anomalous respiratory patterns in airport screening',
    location: 'Southeast Asia region',
    detectionMethod: 'Airport screening data',
    timeline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'high',
    privacyLevel: 'high',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'threat-3',
    labId: 'brazil-fiocruz',
    description: 'Atypical pneumonia cases with unknown etiology',
    location: 'South America',
    detectionMethod: 'Clinical surveillance',
    timeline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'high',
    privacyLevel: 'low',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Cases show rapid progression, affecting primarily adults 30-50. No response to standard antibiotics. Chest X-rays show bilateral infiltrates.',
    specificLocation: 'São Paulo metropolitan area, 3 major hospitals',
    sampleCount: 23
  }
];

// Helper function to get lab by ID
export function getLabById(labId: string): Lab | undefined {
  return MOCK_LABS.find(lab => lab.id === labId);
}

// Helper function to get threat bubbles by lab ID
export function getThreatBubblesByLabId(labId: string): ThreatBubble[] {
  return MOCK_THREAT_BUBBLES.filter(bubble => bubble.labId === labId);
}

