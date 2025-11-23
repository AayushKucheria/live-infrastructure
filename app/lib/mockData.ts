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

// Legacy lab ID aliases → current lab IDs
export const LEGACY_LAB_ID_MAP: Record<string, string> = {
  'indian-biotech': 'india-niv',
  'singapore-biosurveillance': 'singapore-ncid',
  'singapore-biosurv': 'singapore-ncid',
  'india-biotech': 'india-niv',
};

export function normalizeLabId(labId: string): string {
  return LEGACY_LAB_ID_MAP[labId] || labId;
}

// Mock threat bubbles from other labs (for demonstration)
// Note: NIV (india-niv) has no predefined bubbles - they create their own
export const MOCK_THREAT_BUBBLES: ThreatBubble[] = [
  // UK Health Security Agency (UKHSA) - 5 bubbles
  {
    id: 'threat-uk-1',
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
    id: 'threat-uk-2',
    labId: 'uk-ukhsa',
    description: 'Wastewater surveillance detects elevated pathogen levels in Manchester area',
    location: 'Manchester, United Kingdom',
    detectionMethod: 'Wastewater surveillance',
    timeline: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'low',
    privacyLevel: 'low',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Weekly wastewater samples from 12 treatment facilities show 3x baseline levels of respiratory pathogen markers. No corresponding clinical spike yet.',
    specificLocation: 'Greater Manchester wastewater treatment facilities',
    sampleCount: 12
  },
  {
    id: 'threat-uk-3',
    labId: 'uk-ukhsa',
    description: 'Hospital outbreak monitoring flags unusual cluster in Birmingham',
    location: 'Birmingham, United Kingdom',
    detectionMethod: 'Hospital outbreak monitoring',
    timeline: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'high',
    privacyLevel: 'medium',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Three hospitals reporting clusters of severe respiratory illness. 18 cases in past week, primarily elderly patients. Initial tests negative for common pathogens.',
    specificLocation: 'Birmingham NHS Trust hospitals',
    sampleCount: 18
  },
  {
    id: 'threat-uk-4',
    labId: 'uk-ukhsa',
    description: 'Environmental monitoring detects biological anomalies in Scottish Highlands',
    location: 'Scotland, United Kingdom',
    detectionMethod: 'Environmental monitoring',
    timeline: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'low',
    privacyLevel: 'high',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Air quality sensors in remote monitoring stations detecting unusual particulate matter with biological signatures. May be natural variation, monitoring continues.'
  },
  {
    id: 'threat-uk-5',
    labId: 'uk-ukhsa',
    description: 'Clinical surveillance identifies atypical presentation pattern in Wales',
    location: 'Wales, United Kingdom',
    detectionMethod: 'Clinical surveillance',
    timeline: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'medium',
    privacyLevel: 'medium',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Primary care networks reporting unusual symptom combinations in respiratory cases. Patients showing rapid onset but slower recovery than typical flu.',
    specificLocation: 'Cardiff and surrounding areas',
    sampleCount: 34
  },

  // US Centers for Disease Control and Prevention (CDC) - 6 bubbles
  {
    id: 'threat-us-1',
    labId: 'us-cdc',
    description: 'Wastewater surveillance shows elevated pathogen markers in New York City',
    location: 'New York, USA',
    detectionMethod: 'Wastewater surveillance',
    timeline: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'medium',
    privacyLevel: 'low',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'NYC wastewater monitoring network detecting 2.5x baseline levels across 5 boroughs. Genomic sequencing reveals markers not seen in routine surveillance.',
    specificLocation: 'New York City wastewater treatment plants',
    sampleCount: 15,
    geneticMarkers: ['NYC-2024-ALPHA', 'NYC-2024-BETA']
  },
  {
    id: 'threat-us-2',
    labId: 'us-cdc',
    description: 'Airport screening detects unusual respiratory patterns in travelers from multiple regions',
    location: 'California, USA',
    detectionMethod: 'Airport screening data',
    timeline: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'high',
    privacyLevel: 'high',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'LAX and SFO screening stations flagging increased respiratory symptoms in arriving passengers. Pattern suggests possible emerging concern, but no confirmed cases yet.'
  },
  {
    id: 'threat-us-3',
    labId: 'us-cdc',
    description: 'Genomic sequencing reveals novel variant in Texas hospital samples',
    location: 'Texas, USA',
    detectionMethod: 'Genomic sequencing',
    timeline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'high',
    privacyLevel: 'medium',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Sequencing of samples from Houston area hospitals shows novel genetic variant with 82% similarity to known pathogens. 12 samples sequenced, all showing consistent markers.',
    specificLocation: 'Houston metropolitan area hospitals',
    sampleCount: 12,
    geneticMarkers: ['TEX-2024-NOVEL-1', 'TEX-2024-NOVEL-2']
  },
  {
    id: 'threat-us-4',
    labId: 'us-cdc',
    description: 'Clinical surveillance network reports unusual cluster in Florida',
    location: 'Florida, USA',
    detectionMethod: 'Clinical surveillance',
    timeline: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'medium',
    privacyLevel: 'low',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Sentinel surveillance sites in Miami-Dade County reporting uptick in severe respiratory cases. Age distribution unusual - primarily affecting 25-45 age group.',
    specificLocation: 'Miami-Dade County, Florida',
    sampleCount: 28
  },
  {
    id: 'threat-us-5',
    labId: 'us-cdc',
    description: 'Environmental monitoring detects biological signatures in Pacific Northwest',
    location: 'Washington, USA',
    detectionMethod: 'Environmental monitoring',
    timeline: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'low',
    privacyLevel: 'high',
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Environmental sensors in Seattle area detecting unusual biological particulate matter. Correlation with local health data inconclusive. Monitoring ongoing.'
  },
  {
    id: 'threat-us-6',
    labId: 'us-cdc',
    description: 'Hospital outbreak monitoring flags cluster in Chicago area',
    location: 'Illinois, USA',
    detectionMethod: 'Hospital outbreak monitoring',
    timeline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'high',
    privacyLevel: 'medium',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Three major hospitals in Chicago reporting clusters of atypical pneumonia. 22 cases in past 10 days. Standard diagnostic tests returning negative results.',
    specificLocation: 'Chicago metropolitan area',
    sampleCount: 22
  },

  // National Centre for Infectious Diseases, Singapore (NCID) - 4 bubbles
  {
    id: 'threat-sg-1',
    labId: 'singapore-ncid',
    description: 'Anomalous respiratory patterns in airport screening',
    location: 'Southeast Asia region',
    detectionMethod: 'Airport screening data',
    timeline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'high',
    privacyLevel: 'high',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Changi Airport screening stations detecting elevated respiratory symptom rates in arriving passengers from multiple Southeast Asian countries.'
  },
  {
    id: 'threat-sg-2',
    labId: 'singapore-ncid',
    description: 'Wastewater surveillance detects unusual markers in Jurong district',
    location: 'Singapore',
    detectionMethod: 'Wastewater surveillance',
    timeline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'medium',
    privacyLevel: 'low',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Weekly wastewater samples from Jurong treatment facility show persistent elevation of pathogen markers. 4 consecutive weeks above baseline.',
    specificLocation: 'Jurong district, Singapore',
    sampleCount: 8
  },
  {
    id: 'threat-sg-3',
    labId: 'singapore-ncid',
    description: 'Clinical surveillance identifies unusual pattern in port area',
    location: 'Singapore',
    detectionMethod: 'Clinical surveillance',
    timeline: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'low',
    privacyLevel: 'medium',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Primary care clinics in port districts reporting unusual respiratory presentations. Cases show slower recovery than typical seasonal patterns.',
    specificLocation: 'Port areas, Singapore',
    sampleCount: 15
  },
  {
    id: 'threat-sg-4',
    labId: 'singapore-ncid',
    description: 'Genomic sequencing reveals markers in samples from multiple districts',
    location: 'Singapore',
    detectionMethod: 'Genomic sequencing',
    timeline: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'medium',
    privacyLevel: 'medium',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Sequencing of samples from routine surveillance shows consistent genetic markers across 3 districts. 78% similarity to known variants with novel mutations.',
    specificLocation: 'Central, East, and North districts',
    sampleCount: 19,
    geneticMarkers: ['SG-2024-MARKER-A', 'SG-2024-MARKER-B']
  },

  // Fiocruz, Brazil - 5 bubbles
  {
    id: 'threat-br-1',
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
  },
  {
    id: 'threat-br-2',
    labId: 'brazil-fiocruz',
    description: 'Wastewater surveillance detects elevated levels in Rio de Janeiro',
    location: 'Rio de Janeiro, Brazil',
    detectionMethod: 'Wastewater surveillance',
    timeline: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'medium',
    privacyLevel: 'low',
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Wastewater samples from 6 treatment facilities in Rio showing 2.8x baseline pathogen markers. Pattern consistent across multiple neighborhoods.',
    specificLocation: 'Rio de Janeiro wastewater facilities',
    sampleCount: 18
  },
  {
    id: 'threat-br-3',
    labId: 'brazil-fiocruz',
    description: 'Hospital outbreak monitoring flags cluster in Amazon region',
    location: 'Amazonas, Brazil',
    detectionMethod: 'Hospital outbreak monitoring',
    timeline: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'high',
    privacyLevel: 'high',
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Hospitals in Manaus reporting clusters of severe respiratory illness. Limited diagnostic capacity in region. Samples being sent to central lab for analysis.',
    specificLocation: 'Manaus, Amazonas',
    sampleCount: 14
  },
  {
    id: 'threat-br-4',
    labId: 'brazil-fiocruz',
    description: 'Genomic sequencing identifies novel variant in samples from multiple states',
    location: 'Brazil',
    detectionMethod: 'Genomic sequencing',
    timeline: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'medium',
    privacyLevel: 'medium',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Sequencing reveals consistent genetic markers in samples from São Paulo, Rio, and Belo Horizonte. 80% similarity to known pathogens with significant variations.',
    specificLocation: 'Multiple states',
    sampleCount: 31,
    geneticMarkers: ['BR-2024-VAR-1', 'BR-2024-VAR-2', 'BR-2024-VAR-3']
  },
  {
    id: 'threat-br-5',
    labId: 'brazil-fiocruz',
    description: 'Environmental monitoring detects unusual patterns in coastal regions',
    location: 'Bahia, Brazil',
    detectionMethod: 'Environmental monitoring',
    timeline: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'low',
    privacyLevel: 'high',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    detailedFindings: 'Environmental sensors in coastal monitoring stations detecting unusual biological signatures. May be related to seasonal patterns or natural variation. Ongoing investigation.'
  }
];

// Helper function to get lab by ID
export function getLabById(labId: string): Lab | undefined {
  const normalized = normalizeLabId(labId);
  return MOCK_LABS.find(lab => lab.id === normalized);
}

// Helper function to get threat bubbles by lab ID
export function getThreatBubblesByLabId(labId: string): ThreatBubble[] {
  return MOCK_THREAT_BUBBLES.filter(bubble => bubble.labId === labId);
}

