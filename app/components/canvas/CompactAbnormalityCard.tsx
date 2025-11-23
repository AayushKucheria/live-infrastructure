'use client';

import React from 'react';
import { AbnormalityBubble } from '../../lib/mockData';
import { StoredAbnormalityBubble } from '../../lib/storage';
import { getLabById } from '../../lib/mockData';

type AbnormalityBubbleUnion = AbnormalityBubble | StoredAbnormalityBubble;

interface CompactAbnormalityCardProps {
  bubble: AbnormalityBubbleUnion;
  onClick?: (e?: React.MouseEvent) => void;
}

export default function CompactAbnormalityCard({ bubble, onClick }: CompactAbnormalityCardProps) {
  const lab = getLabById(bubble.labId);
  
  const urgencyColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-zinc-800 rounded-lg p-5 shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer h-full flex flex-col min-h-[150px]"
    >
      {/* Header with urgency badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-3 flex-1 leading-snug">
          {bubble.description}
        </h4>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${urgencyColors[bubble.urgency]}`}>
          {bubble.urgency.toUpperCase()}
        </span>
      </div>
      
      {/* Compact info */}
      <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1.5 mt-auto">
        <div className="line-clamp-1">
          {lab?.name || `Unknown Lab (${bubble.labId})`}
        </div>
        <div className="line-clamp-1">
          {bubble.detectionMethod}
        </div>
        {bubble.location && (
          <div className="line-clamp-1">
            {bubble.location}
          </div>
        )}
      </div>
    </div>
  );
}

