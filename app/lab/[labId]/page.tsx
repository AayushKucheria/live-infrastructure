'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLabById, MOCK_LABS, MOCK_THREAT_BUBBLES } from '../../lib/mockData';
import { getCurrentLab, getThreatBubbles } from '../../lib/storage';
import ThreatBubbleCard from '../../components/ThreatBubbleCard';
import Link from 'next/link';

export default function LabDashboard() {
  const params = useParams();
  const router = useRouter();
  const labId = params.labId as string;
  const [lab, setLab] = useState(getLabById(labId));
  const [allThreatBubbles, setAllThreatBubbles] = useState<any[]>([]);

  useEffect(() => {
    // Verify user is joined as this lab
    const currentLab = getCurrentLab();
    if (currentLab !== labId) {
      router.push('/');
      return;
    }

    const labData = getLabById(labId);
    if (!labData) {
      router.push('/');
      return;
    }

    setLab(labData);
    
    // Load user's threat bubbles from localStorage
    const userBubbles = getThreatBubbles().filter(b => b.labId === labId);
    
    // Load predefined mock threat bubbles for this lab
    const mockBubbles = MOCK_THREAT_BUBBLES.filter(b => b.labId === labId);
    
    // Combine both arrays
    const allBubbles = [...userBubbles, ...mockBubbles];
    setAllThreatBubbles(allBubbles);
  }, [labId, router]);

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
            href={`/lab/${labId}/create-threat`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Create Threat Bubble
          </Link>
        </div>

        {/* Threat Bubbles */}
        {allThreatBubbles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Threat Bubbles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allThreatBubbles.map((bubble) => (
                <ThreatBubbleCard key={bubble.id} bubble={bubble} showFullDetails />
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        {allThreatBubbles.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <p className="text-blue-800 dark:text-blue-300">
              Create your first threat bubble to start coordinating with other labs. 
              The system will automatically match you with relevant threat bubbles from other labs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

