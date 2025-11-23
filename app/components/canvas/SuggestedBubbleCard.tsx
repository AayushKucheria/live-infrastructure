'use client';

import React, { useState } from 'react';
import AbnormalityBubbleCard from '../AbnormalityBubbleCard';
import { AbnormalityBubble } from '../../lib/mockData';
import { StoredAbnormalityBubble } from '../../lib/storage';

type AbnormalityBubbleUnion = AbnormalityBubble | StoredAbnormalityBubble;

interface SuggestedBubbleCardProps {
  bubble: AbnormalityBubbleUnion;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function SuggestedBubbleCard({ 
  bubble, 
  onAccept, 
  onDismiss 
}: SuggestedBubbleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Blurred/transparent overlay */}
      <div 
        className={`
          transition-all duration-300
          ${isHovered ? 'opacity-100 blur-none' : 'opacity-60 blur-sm'}
        `}
      >
        <AbnormalityBubbleCard 
          bubble={bubble} 
          showFullDetails={false}
          disableLink={true}
        />
      </div>

      {/* Action buttons - revealed on hover at bottom */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 p-3
          bg-gradient-to-t from-white/95 via-white/90 to-transparent dark:from-zinc-800/95 dark:via-zinc-800/90
          transition-opacity duration-300 pointer-events-none rounded-b-lg
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAccept();
          }}
          className="pointer-events-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors z-10"
        >
          ✓ Accept
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="pointer-events-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors z-10"
        >
          × Dismiss
        </button>
      </div>

      {/* Suggestion badge */}
      <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full shadow-md z-20">
        AI Suggestion
      </div>
    </div>
  );
}

