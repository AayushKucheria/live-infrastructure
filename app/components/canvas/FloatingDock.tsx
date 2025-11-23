'use client';

import React, { useState } from 'react';
import { AbnormalityBubble } from '../../lib/mockData';
import { StoredAbnormalityBubble } from '../../lib/storage';
import DraggableAbnormalityCard from './DraggableAbnormalityCard';
import CompactAbnormalityCard from './CompactAbnormalityCard';
import AbnormalityBubbleCard from '../AbnormalityBubbleCard';
import { useDraggable } from '@dnd-kit/core';

type AbnormalityBubbleUnion = AbnormalityBubble | StoredAbnormalityBubble;

interface FloatingDockProps {
  abnormalities: AbnormalityBubbleUnion[];
}

function DraggableCompactCard({ 
  id, 
  bubble, 
  onExpand 
}: { 
  id: string; 
  bubble: AbnormalityBubbleUnion; 
  onExpand: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { bubble }
  });

  const style = {
    opacity: isDragging ? 0 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const handleClick = (e?: React.MouseEvent) => {
    // Only expand on click, not on drag start
    if (!isDragging) {
      e?.stopPropagation();
      onExpand();
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className="touch-none"
    >
      <div {...listeners}>
        <CompactAbnormalityCard
          bubble={bubble}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}

export default function FloatingDock({ abnormalities }: FloatingDockProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const handleCardClick = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const handleCloseExpanded = () => {
    setExpandedCardId(null);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full pointer-events-none">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-700 shadow-lg pointer-events-auto">
          <div className="px-4 py-2">
            <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              Abnormality Library ({abnormalities.length})
            </h3>
            
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {abnormalities.length === 0 ? (
                <div className="w-full text-center py-3 text-zinc-400 text-xs italic">
                  Library empty
                </div>
              ) : (
                abnormalities.map((abnormality) => (
                  <div key={abnormality.id} className="min-w-[280px] w-[280px] flex-shrink-0">
                    <DraggableCompactCard
                      id={abnormality.id}
                      bubble={abnormality}
                      onExpand={() => handleCardClick(abnormality.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded card modal/overlay */}
      {expandedCardId && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseExpanded}
        >
          <div 
            className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Abnormality Details
              </h2>
              <button
                onClick={handleCloseExpanded}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const expandedBubble = abnormalities.find(b => b.id === expandedCardId);
                return expandedBubble ? (
                  <AbnormalityBubbleCard 
                    bubble={expandedBubble} 
                    showFullDetails={true}
                    disableLink={true}
                  />
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

