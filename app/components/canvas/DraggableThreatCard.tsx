'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import ThreatBubbleCard from '../ThreatBubbleCard';
import { ThreatBubble } from '../../lib/mockData';
import { StoredThreatBubble } from '../../lib/storage';

type ThreatBubbleUnion = ThreatBubble | StoredThreatBubble;

interface DraggableThreatCardProps {
  bubble: ThreatBubbleUnion;
  id: string;
  matchExplanation?: string;
  disableLink?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onCommunicate?: () => void;
}

export default function DraggableThreatCard({ 
  bubble, 
  id, 
  matchExplanation, 
  disableLink, 
  isSelected,
  onClick,
  onCommunicate
}: DraggableThreatCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      bubble
    }
  });

  const style = {
    opacity: isDragging ? 0 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="touch-none"
    >
      <ThreatBubbleCard 
        bubble={bubble} 
        showFullDetails={false} 
        matchExplanation={matchExplanation}
        disableLink={disableLink}
        isSelected={isSelected}
        onClick={onClick}
        onCommunicate={onCommunicate}
      />
    </div>
  );
}
