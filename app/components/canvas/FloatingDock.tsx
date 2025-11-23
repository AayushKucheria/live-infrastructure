'use client';

import React from 'react';
import { AbnormalityBubble } from '../../lib/mockData';
import { StoredAbnormalityBubble } from '../../lib/storage';
import DraggableAbnormalityCard from './DraggableAbnormalityCard';

type AbnormalityBubbleUnion = AbnormalityBubble | StoredAbnormalityBubble;

interface FloatingDockProps {
  abnormalities: AbnormalityBubbleUnion[];
}

export default function FloatingDock({ abnormalities }: FloatingDockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-none">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4 pointer-events-auto">
        <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 px-2">
          Abnormality Library ({abnormalities.length})
        </h3>
        
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {abnormalities.length === 0 ? (
            <div className="w-full text-center py-4 text-zinc-400 text-sm italic">
              Library empty
            </div>
          ) : (
            abnormalities.map((abnormality) => (
              <div key={abnormality.id} className="min-w-[280px] w-[280px] flex-shrink-0">
                <DraggableAbnormalityCard
                  id={abnormality.id}
                  bubble={abnormality}
                  disableLink={true}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

