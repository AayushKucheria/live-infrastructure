'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getThreatBubbleById } from '../../lib/storage';
import { MOCK_THREAT_BUBBLES, getLabById, ThreatBubble } from '../../lib/mockData';
import { findRelevantThreatBubbles, getAllThreatBubbles } from '../../lib/matching';
import ThreatBubbleCard from '../../components/ThreatBubbleCard';
import Link from 'next/link';
import { getCurrentLab } from '../../lib/storage';

export default function ThreatBubbleView() {
  const params = useParams();
  const router = useRouter();
  const threatId = params.threatId as string;
  const [threatBubble, setThreatBubble] = useState<ThreatBubble | null>(null);
  const [relevantBubbles, setRelevantBubbles] = useState<ThreatBubble[]>([]);
  const [currentLabId, setCurrentLabId] = useState<string | null>(null);

  useEffect(() => {
    // Get current lab
    const labId = getCurrentLab();
    setCurrentLabId(labId);

    // Find threat bubble (check stored first, then mock)
    const stored = getThreatBubbleById(threatId);
    const mock = MOCK_THREAT_BUBBLES.find(b => b.id === threatId);
    const bubble = stored || mock;

    if (!bubble) {
      router.push('/');
      return;
    }

    setThreatBubble(bubble as ThreatBubble);

    // Find relevant threat bubbles
    const allBubbles = getAllThreatBubbles();
    const relevant = findRelevantThreatBubbles(bubble as ThreatBubble, allBubbles, 5);
    setRelevantBubbles(relevant as ThreatBubble[]);
  }, [threatId, router]);

  if (!threatBubble) {
    return null;
  }

  const lab = getLabById(threatBubble.labId);
  const isOwnBubble = currentLabId === threatBubble.labId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-6"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Threat Bubble */}
          <div className="lg:col-span-2">
            <ThreatBubbleCard bubble={threatBubble} showFullDetails />
            
            {/* Communication Channel Button */}
            {!isOwnBubble && currentLabId && (
              <div className="mt-6">
                <Link
                  href={`/threat/${threatId}/communicate`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Start Communication Channel
                </Link>
              </div>
            )}
          </div>

          {/* Relevant Threat Bubbles Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 sticky top-8">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Relevant Threat Bubbles
              </h2>
              {relevantBubbles.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No relevant threat bubbles found at this time.
                </p>
              ) : (
                <div className="space-y-4">
                  {relevantBubbles.map((bubble) => (
                    <div key={bubble.id} className="border-b border-zinc-200 dark:border-zinc-700 pb-4 last:border-0 last:pb-0">
                      <Link
                        href={`/threat/${bubble.id}`}
                        className="block hover:opacity-80 transition-opacity"
                      >
                        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                          {getLabById(bubble.labId)?.name || 'Unknown Lab'}
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                          {bubble.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            bubble.urgency === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            bubble.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {bubble.urgency.toUpperCase()}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {bubble.location}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

