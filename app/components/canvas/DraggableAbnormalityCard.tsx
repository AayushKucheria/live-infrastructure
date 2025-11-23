'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import AbnormalityBubbleCard from '../AbnormalityBubbleCard';
import { AbnormalityBubble } from '../../lib/mockData';
import { StoredAbnormalityBubble } from '../../lib/storage';

type AbnormalityBubbleUnion = AbnormalityBubble | StoredAbnormalityBubble;

interface DraggableAbnormalityCardProps {
  bubble: AbnormalityBubbleUnion;
  id: string;
  matchExplanation?: string;
  disableLink?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onCommunicate?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export default function DraggableAbnormalityCard({ 
  bubble, 
  id, 
  matchExplanation, 
  disableLink, 
  isSelected,
  onClick,
  onCommunicate,
  onDelete,
  canDelete
}: DraggableAbnormalityCardProps) {
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
      <AbnormalityBubbleCard 
        bubble={bubble} 
        showFullDetails={false} 
        matchExplanation={matchExplanation}
        disableLink={disableLink}
        isSelected={isSelected}
        onClick={onClick}
        onCommunicate={onCommunicate}
        onDelete={onDelete}
        canDelete={canDelete}
      />
    </div>
  );
}
