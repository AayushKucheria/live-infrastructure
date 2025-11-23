'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLabById, MOCK_ABNORMALITY_BUBBLES } from '../../lib/mockData';
import { getCurrentLab, getAbnormalityBubbles, deleteAbnormalityBubble } from '../../lib/storage';
import AbnormalityBubbleCard from '../../components/AbnormalityBubbleCard';
import Link from 'next/link';
import { PRIMARY_LAB_ID } from '../../lib/constants';

export default function LabDashboard() {
  const params = useParams();
  const router = useRouter();
  const labId = params.labId as string;
  const [lab, setLab] = useState(getLabById(labId));
  const [allAbnormalityBubbles, setAllAbnormalityBubbles] = useState<any[]>([]);
  const [userCreatedBubbleIds, setUserCreatedBubbleIds] = useState<Set<string>>(new Set());

  const loadBubbles = () => {
    // Load user's abnormality bubbles from localStorage
    const userBubbles = getAbnormalityBubbles().filter(b => b.labId === labId);
    
    // Load predefined mock abnormality bubbles for this lab
    const mockBubbles = MOCK_ABNORMALITY_BUBBLES.filter(b => b.labId === labId);
    
    // Track which bubbles are user-created
    const userCreatedIds = new Set(userBubbles.map(b => b.id));
    setUserCreatedBubbleIds(userCreatedIds);
    
    // Combine both arrays
    const allBubbles = [...userBubbles, ...mockBubbles];
    setAllAbnormalityBubbles(allBubbles);
  };

  useEffect(() => {
    if (labId !== PRIMARY_LAB_ID) {
      router.replace('/');
      return;
    }

    // Verify user is joined as this lab
    const currentLab = getCurrentLab();
    if (currentLab !== PRIMARY_LAB_ID) {
      router.replace('/');
      return;
    }

    const labData = getLabById(labId);
    if (!labData) {
      router.replace('/');
      return;
    }

    setLab(labData);
    loadBubbles();
  }, [labId, router]);

  const handleDelete = (bubbleId: string) => {
    // Prevent deletion of mock bubbles
    const isMockBubble = MOCK_ABNORMALITY_BUBBLES.some(b => b.id === bubbleId);
    if (isMockBubble) {
      return;
    }

    // Verify it's a user-created bubble owned by current lab
    if (!userCreatedBubbleIds.has(bubbleId)) {
      return;
    }

    // Delete from storage
    deleteAbnormalityBubble(bubbleId);
    
    // Update state locally - remove the bubble from the list
    setAllAbnormalityBubbles(prev => prev.filter(b => b.id !== bubbleId));
    setUserCreatedBubbleIds(prev => {
      const next = new Set(prev);
      next.delete(bubbleId);
      return next;
    });
  };

  if (!lab) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                {lab.name}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                {lab.location} • {lab.type}
              </p>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('currentLab');
                  router.push('/');
                }
              }}
              className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Switch Lab
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Link
            href={`/lab/${labId}/create-abnormality`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Create Abnormality Bubble
          </Link>
        </div>

        {/* Abnormality Bubbles */}
        {allAbnormalityBubbles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Abnormality Bubbles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAbnormalityBubbles.map((bubble) => {
                const isUserCreated = userCreatedBubbleIds.has(bubble.id);
                const canDelete = isUserCreated && bubble.labId === labId;
                return (
                  <AbnormalityBubbleCard 
                    key={bubble.id} 
                    bubble={bubble} 
                    showFullDetails 
                    canDelete={canDelete}
                    isUserCreated={isUserCreated}
                    onDelete={() => handleDelete(bubble.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Info */}
        {allAbnormalityBubbles.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <p className="text-blue-800 dark:text-blue-300">
              Create your first abnormality bubble to start coordinating with other labs. 
              The system will automatically match you with relevant abnormality bubbles from other labs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

