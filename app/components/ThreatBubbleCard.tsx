'use client';

import Link from 'next/link';
import { ThreatBubble } from '../lib/mockData';
import { StoredThreatBubble } from '../lib/storage';
import { getLabById } from '../lib/mockData';
import { formatRelativeTimeline } from '../lib/utils';

type ThreatBubbleUnion = ThreatBubble | StoredThreatBubble;

interface ThreatBubbleCardProps {
  bubble: ThreatBubbleUnion;
  showFullDetails?: boolean;
  matchExplanation?: string;
  disableLink?: boolean;
}

export default function ThreatBubbleCard({ bubble, showFullDetails = false, matchExplanation, disableLink = false }: ThreatBubbleCardProps) {
  const lab = getLabById(bubble.labId);
  
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
    <div className={`bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-all ${!disableLink ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {lab?.name || 'Unknown Lab'}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${urgencyColors[bubble.urgency]}`}>
              {bubble.urgency.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            {lab?.location} • {bubble.detectionMethod}
          </p>
        </div>
        <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400">
          {privacyLabels[bubble.privacyLevel]}
        </span>
      </div>

      <p className="text-zinc-700 dark:text-zinc-300 mb-4">
        {bubble.description}
      </p>

      {matchExplanation && (
        <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800/30 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-start gap-2">
            <div>
              <h4 className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-1">
                Why this might be relevant?
              </h4>
              <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                {matchExplanation}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4 text-sm">
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

      <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {new Date(bubble.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  if (disableLink) {
    return content;
  }

  return (
    <Link href={`/threat/${bubble.id}`}>
      {content}
    </Link>
  );
}

