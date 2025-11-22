'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getThreatBubbleById } from '../../../lib/storage';
import { MOCK_THREAT_BUBBLES, getLabById } from '../../../lib/mockData';
import CommunicationChannel from '../../../components/CommunicationChannel';
import { getCurrentLab } from '../../../lib/storage';

export default function CommunicatePage() {
  const params = useParams();
  const router = useRouter();
  const threatId = params.threatId as string;
  const [threatBubble, setThreatBubble] = useState<any>(null);
  const [currentLabId, setCurrentLabId] = useState<string | null>(null);

  useEffect(() => {
    // Get current lab
    const labId = getCurrentLab();
    if (!labId) {
      router.push('/');
      return;
    }
    setCurrentLabId(labId);

    // Find threat bubble
    const stored = getThreatBubbleById(threatId);
    const mock = MOCK_THREAT_BUBBLES.find(b => b.id === threatId);
    const bubble = stored || mock;

    if (!bubble) {
      router.push('/');
      return;
    }

    // Can't communicate with own threat bubble
    if (bubble.labId === labId) {
      router.push(`/threat/${threatId}`);
      return;
    }

    setThreatBubble(bubble);
  }, [threatId, router]);

  if (!threatBubble || !currentLabId) {
    return null;
  }

  const otherLabId = threatBubble.labId;
  const otherLab = getLabById(otherLabId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push(`/threat/${threatId}`)}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-6"
        >
          ← Back to Threat Bubble
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Communication Channel
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Coordinating with <span className="font-medium">{otherLab?.name}</span> regarding their threat bubble
          </p>
        </div>

        {/* Threat Bubble Context */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Threat Bubble Context
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 mb-2">
            {threatBubble.description}
          </p>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">Location:</span> {threatBubble.location} • 
            <span className="font-medium ml-2">Method:</span> {threatBubble.detectionMethod}
          </div>
        </div>

        {/* Communication Channel Component */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <CommunicationChannel
            threatBubbleId={threatId}
            currentLabId={currentLabId}
            otherLabId={otherLabId}
          />
        </div>
      </div>
    </div>
  );
}

