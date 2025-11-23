// Filtering utilities for abnormality bubbles

import { AbnormalityBubble } from './mockData';
import { StoredAbnormalityBubble } from './storage';
import { getLabById } from './mockData';

type AbnormalityBubbleUnion = AbnormalityBubble | StoredAbnormalityBubble;

// Lab location coordinates (approximate)
const LAB_COORDINATES: Record<string, { lat: number; lon: number; country: string; region: string }> = {
  'india-niv': { lat: 18.5204, lon: 73.8567, country: 'India', region: 'Asia' },
  'uk-ukhsa': { lat: 51.5074, lon: -0.1278, country: 'United Kingdom', region: 'Europe' },
  'us-cdc': { lat: 33.7490, lon: -84.3880, country: 'United States', region: 'Americas' },
  'singapore-ncid': { lat: 1.3521, lon: 103.8198, country: 'Singapore', region: 'Asia' },
  'brazil-fiocruz': { lat: -22.9068, lon: -43.1729, country: 'Brazil', region: 'Americas' },
};

// Haversine formula to calculate distance between two coordinates (in km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Extract country from location string
function extractCountry(location: string): string | null {
  // Try to match common patterns
  const patterns = [
    /(?:^|,\s*)(United States|USA|US)$/i,
    /(?:^|,\s*)(United Kingdom|UK)$/i,
    /(?:^|,\s*)(India)$/i,
    /(?:^|,\s*)(Singapore)$/i,
    /(?:^|,\s*)(Brazil)$/i,
    /(?:^|,\s*)(\w+)$/,
  ];
  
  for (const pattern of patterns) {
    const match = location.match(pattern);
    if (match) {
      const country = match[1];
      // Normalize
      if (country === 'USA' || country === 'US') return 'United States';
      if (country === 'UK') return 'United Kingdom';
      return country;
    }
  }
  
  return null;
}

// Get coordinates for an abnormality bubble
function getAbnormalityCoordinates(bubble: AbnormalityBubbleUnion): { lat: number; lon: number; country: string; region: string } | null {
  const lab = getLabById(bubble.labId);
  if (lab) {
    const coords = LAB_COORDINATES[lab.id];
    if (coords) return coords;
  }
  
  // Fallback: try to extract from location string
  const country = extractCountry(bubble.location);
  if (country) {
    // Find matching lab coordinates by country
    for (const [labId, coords] of Object.entries(LAB_COORDINATES)) {
      if (coords.country === country) {
        return coords;
      }
    }
  }
  
  return null;
}

export interface FilterOptions {
  geography?: {
    type: 'same-country' | 'same-region' | 'within-distance';
    distanceKm?: number; // Required if type is 'within-distance'
    referenceLocation?: string; // Location of main abnormality for comparison
    referenceLabId?: string; // Lab ID of main abnormality
  };
  urgency?: ('low' | 'medium' | 'high')[];
  privacyLevel?: ('low' | 'medium' | 'high')[];
  detectionMethod?: string[];
  dateRange?: {
    type: 'all' | 'last-days' | 'last-weeks' | 'last-months' | 'custom';
    days?: number;
    weeks?: number;
    months?: number;
    startDate?: string;
    endDate?: string;
  };
}

export function filterByGeography(
  abnormalities: AbnormalityBubbleUnion[],
  options: FilterOptions['geography']
): AbnormalityBubbleUnion[] {
  if (!options) return abnormalities;
  
  const { type, distanceKm, referenceLocation, referenceLabId } = options;
  
  if (!referenceLocation && !referenceLabId) {
    return abnormalities;
  }
  
  // Get reference coordinates
  let refCoords: { lat: number; lon: number; country: string; region: string } | null = null;
  
  if (referenceLabId) {
    refCoords = LAB_COORDINATES[referenceLabId] || null;
  }
  
  if (!refCoords && referenceLocation) {
    // Try to find coordinates from reference location
    const refCountry = extractCountry(referenceLocation);
    if (refCountry) {
      for (const coords of Object.values(LAB_COORDINATES)) {
        if (coords.country === refCountry) {
          refCoords = coords;
          break;
        }
      }
    }
  }
  
  if (!refCoords) {
    // Fallback: simple country matching
    const refCountry = referenceLocation ? extractCountry(referenceLocation) : null;
    if (refCountry && type === 'same-country') {
      return abnormalities.filter(bubble => {
        const country = extractCountry(bubble.location);
        return country === refCountry;
      });
    }
    return abnormalities;
  }
  
  return abnormalities.filter(bubble => {
    const bubbleCoords = getAbnormalityCoordinates(bubble);
    if (!bubbleCoords) return false;
    
    switch (type) {
      case 'same-country':
        return bubbleCoords.country === refCoords.country;
      
      case 'same-region':
        return bubbleCoords.region === refCoords.region;
      
      case 'within-distance':
        if (distanceKm === undefined) return false;
        const distance = calculateDistance(
          refCoords.lat,
          refCoords.lon,
          bubbleCoords.lat,
          bubbleCoords.lon
        );
        return distance <= distanceKm;
      
      default:
        return true;
    }
  });
}

export function filterByUrgency(
  abnormalities: AbnormalityBubbleUnion[],
  urgencyLevels?: ('low' | 'medium' | 'high')[]
): AbnormalityBubbleUnion[] {
  if (!urgencyLevels || urgencyLevels.length === 0) return abnormalities;
  
  return abnormalities.filter(bubble => urgencyLevels.includes(bubble.urgency));
}

export function filterByPrivacy(
  abnormalities: AbnormalityBubbleUnion[],
  privacyLevels?: ('low' | 'medium' | 'high')[]
): AbnormalityBubbleUnion[] {
  if (!privacyLevels || privacyLevels.length === 0) return abnormalities;
  
  return abnormalities.filter(bubble => privacyLevels.includes(bubble.privacyLevel));
}

export function filterByDetectionMethod(
  abnormalities: AbnormalityBubbleUnion[],
  methods?: string[]
): AbnormalityBubbleUnion[] {
  if (!methods || methods.length === 0) return abnormalities;
  
  return abnormalities.filter(bubble => methods.includes(bubble.detectionMethod));
}

export function filterByDateRange(
  abnormalities: AbnormalityBubbleUnion[],
  dateRange?: FilterOptions['dateRange']
): AbnormalityBubbleUnion[] {
  if (!dateRange || dateRange.type === 'all') return abnormalities;
  
  const now = new Date();
  let cutoffDate: Date;
  
  switch (dateRange.type) {
    case 'last-days':
      if (!dateRange.days) return abnormalities;
      cutoffDate = new Date(now.getTime() - dateRange.days * 24 * 60 * 60 * 1000);
      break;
    
    case 'last-weeks':
      if (!dateRange.weeks) return abnormalities;
      cutoffDate = new Date(now.getTime() - dateRange.weeks * 7 * 24 * 60 * 60 * 1000);
      break;
    
    case 'last-months':
      if (!dateRange.months) return abnormalities;
      cutoffDate = new Date(now.getTime() - dateRange.months * 30 * 24 * 60 * 60 * 1000);
      break;
    
    case 'custom':
      if (!dateRange.startDate || !dateRange.endDate) return abnormalities;
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return abnormalities.filter(bubble => {
        const bubbleDate = new Date(bubble.createdAt);
        return bubbleDate >= start && bubbleDate <= end;
      });
    
    default:
      return abnormalities;
  }
  
  return abnormalities.filter(bubble => {
    const bubbleDate = new Date(bubble.createdAt);
    return bubbleDate >= cutoffDate;
  });
}

export function applyAllFilters(
  abnormalities: AbnormalityBubbleUnion[],
  filters: FilterOptions
): AbnormalityBubbleUnion[] {
  let filtered = [...abnormalities];
  
  if (filters.geography) {
    filtered = filterByGeography(filtered, filters.geography);
  }
  
  if (filters.urgency && filters.urgency.length > 0) {
    filtered = filterByUrgency(filtered, filters.urgency);
  }
  
  if (filters.privacyLevel && filters.privacyLevel.length > 0) {
    filtered = filterByPrivacy(filtered, filters.privacyLevel);
  }
  
  if (filters.detectionMethod && filters.detectionMethod.length > 0) {
    filtered = filterByDetectionMethod(filtered, filters.detectionMethod);
  }
  
  if (filters.dateRange && filters.dateRange.type !== 'all') {
    filtered = filterByDateRange(filtered, filters.dateRange);
  }
  
  return filtered;
}

// Helper to count active filters
export function countActiveFilters(filters: FilterOptions): number {
  let count = 0;
  
  if (filters.geography) count++;
  if (filters.urgency && filters.urgency.length > 0) count++;
  if (filters.privacyLevel && filters.privacyLevel.length > 0) count++;
  if (filters.detectionMethod && filters.detectionMethod.length > 0) count++;
  if (filters.dateRange && filters.dateRange.type !== 'all') count++;
  
  return count;
}

