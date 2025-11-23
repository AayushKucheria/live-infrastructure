'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getThreatBubbleById } from '../../lib/storage';
import { MOCK_THREAT_BUBBLES } from '../../lib/mockData';
import { findRelevantThreatBubbles, getAllThreatBubbles, ThreatBubbleUnion } from '../../lib/matching';
import ThreatConnectionCanvas from '../../components/canvas/ThreatConnectionCanvas';
import { getCurrentLab } from '../../lib/storage';
import Link from 'next/link';

export default function ThreatBubbleView() {
  const params = useParams();
  const router = useRouter();
  const threatId = params.threatId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    mainThreat: ThreatBubbleUnion;
    initialRelevantThreats: ThreatBubbleUnion[];
    libraryThreats: ThreatBubbleUnion[];
  } | null>(null);
  
  const [currentLabId, setCurrentLabId] = useState<string | null>(null);

  useEffect(() => {
    // Set current lab ID on mount
    const initLab = async () => {
        setCurrentLabId(getCurrentLab());
    };
    initLab();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        // Find threat bubble
        const stored = getThreatBubbleById(threatId);
        const mock = MOCK_THREAT_BUBBLES.find(b => b.id === threatId);
        const mainThreat = stored || mock;

        if (!mainThreat) {
            router.push('/');
            return;
        }

        const allBubbles = getAllThreatBubbles();
        // Find relevant bubbles (limit 5 initially)
        const initialRelevant = findRelevantThreatBubbles(mainThreat, allBubbles, 5);
        
        // Calculate library bubbles (Everything else)
        // Filter out main threat and already relevant threats
        const relevantIds = new Set(initialRelevant.map(b => b.id));
        const libraryThreats = allBubbles.filter(b => 
            b.id !== mainThreat.id && !relevantIds.has(b.id)
        );

        setData({
            mainThreat,
            initialRelevantThreats: initialRelevant,
            libraryThreats
        });
        setIsLoading(false);
    };

    fetchData();
  }, [threatId, router]);

  const handleAnalyze = async (source: ThreatBubbleUnion, target: ThreatBubbleUnion) => {
    const response = await fetch('/api/openrouter/explain-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceThreat: source,
        matchedThreat: target,
      }),
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const resData = await response.json();
    if (resData.success && resData.explanation) {
      return resData.explanation;
    }
    throw new Error('No explanation returned');
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isOwnBubble = currentLabId === data.mainThreat.labId;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-900">
      {/* Header Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Threat Analysis Canvas
          </h1>
        </div>
        
        {!isOwnBubble && currentLabId && (
           <Link
             href={`/threat/${threatId}/communicate`}
             className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
           >
             Open Communication Channel
           </Link>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <ThreatConnectionCanvas
          mainThreat={data.mainThreat}
          initialRelevantThreats={data.initialRelevantThreats}
          libraryThreats={data.libraryThreats}
          onAnalyze={handleAnalyze}
        />
      </div>
    </div>
  );
}
