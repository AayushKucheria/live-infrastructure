'use client';

import Link from 'next/link';
import { AbnormalityBubble } from '../lib/mockData';
import { StoredAbnormalityBubble } from '../lib/storage';
import { getLabById } from '../lib/mockData';
import { formatRelativeTimeline } from '../lib/utils';

type AbnormalityBubbleUnion = AbnormalityBubble | StoredAbnormalityBubble;

interface AbnormalityBubbleCardProps {
  bubble: AbnormalityBubbleUnion;
  showFullDetails?: boolean;
  matchExplanation?: string;
  disableLink?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onCommunicate?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  isUserCreated?: boolean;
}

export default function AbnormalityBubbleCard({ bubble, showFullDetails = false, disableLink = false, isSelected = false, onClick, onCommunicate, onDelete, canDelete = false }: AbnormalityBubbleCardProps) {
  const lab = getLabById(bubble.labId);
  
  // Debug: Log when lab is not found
  if (!lab && typeof window !== 'undefined') {
    console.warn(`Lab not found for labId: "${bubble.labId}" in abnormality bubble: ${bubble.id}`);
  }
  
  const urgencyColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  };

  const privacyLabels = {
    high: 'High Privacy',
    medium: 'Medium Privacy',
    low: 'Low Privacy'
  };

  // Filter details based on privacy level
  const canShowDetails = bubble.privacyLevel === 'low' || showFullDetails;
  const canShowMediumDetails = bubble.privacyLevel !== 'high' || showFullDetails;

  const content = (
    <div 
        onClick={onClick}
        className={`
            bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border transition-all relative group
            ${!disableLink || onClick ? 'cursor-pointer' : ''}
            ${isSelected 
                ? 'border-indigo-500 ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-lg scale-[1.02]' 
                : 'border-zinc-200 dark:border-zinc-700 hover:shadow-md'
            }
        `}
    >
      {/* Delete button - top right */}
      {canDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
          }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors z-10"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      {/* Primary: Abnormality Description */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 flex-1 leading-tight">
            {bubble.description}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${urgencyColors[bubble.urgency]}`}>
            {bubble.urgency.toUpperCase()}
          </span>
        </div>
        
        {/* Secondary: Lab name and location */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-3">
          <span>{lab?.name || `Unknown Lab (${bubble.labId})`}</span>
          <span>•</span>
          <span>{lab?.location || 'Unknown Location'}</span>
        </div>
      </div>

      {/* Contextual Information */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Detection Method:</span>
          <span>{bubble.detectionMethod}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Location:</span>
          <span>{canShowMediumDetails && bubble.specificLocation ? bubble.specificLocation : bubble.location}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Timeline:</span>
          <span>{formatRelativeTimeline(bubble.timeline)}</span>
        </div>
        {canShowDetails && bubble.detailedFindings && (
          <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded border-l-2 border-blue-500">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-medium">Detailed Findings:</span> {bubble.detailedFindings}
            </p>
          </div>
        )}
        {canShowDetails && bubble.sampleCount && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">Samples:</span> {bubble.sampleCount}
          </div>
        )}
        {canShowDetails && bubble.geneticMarkers && bubble.geneticMarkers.length > 0 && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">Genetic Markers:</span> {bubble.geneticMarkers.join(', ')}
          </div>
        )}
      </div>

      {/* Footer with metadata */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {new Date(bubble.createdAt).toLocaleDateString()}
          </span>
          <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400">
            {privacyLabels[bubble.privacyLevel]}
          </span>
        </div>
        
        {onCommunicate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCommunicate();
            }}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded transition-colors"
          >
            <span>💬</span>
            Communicate
          </button>
        )}
      </div>
    </div>
  );

  if (disableLink) {
    return content;
  }

  return (
    <Link href={`/abnormality/${bubble.id}`}>
      {content}
    </Link>
  );
}

