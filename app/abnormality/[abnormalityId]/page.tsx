'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAbnormalityBubbleById } from '../../lib/storage';
import { MOCK_ABNORMALITY_BUBBLES } from '../../lib/mockData';
import { findRelevantAbnormalityBubbles, getAllAbnormalityBubbles, AbnormalityBubbleUnion } from '../../lib/matching';
import AbnormalityConnectionCanvas from '../../components/canvas/AbnormalityConnectionCanvas';
import { getCurrentLab } from '../../lib/storage';
import Link from 'next/link';

export default function AbnormalityBubbleView() {
  const params = useParams();
  const router = useRouter();
  const abnormalityId = params.abnormalityId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    mainAbnormality: AbnormalityBubbleUnion;
    initialRelevantAbnormalities: AbnormalityBubbleUnion[];
    libraryAbnormalities: AbnormalityBubbleUnion[];
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
        // Find abnormality bubble
        const stored = getAbnormalityBubbleById(abnormalityId);
        const mock = MOCK_ABNORMALITY_BUBBLES.find(b => b.id === abnormalityId);
        const mainAbnormality = stored || mock;

        if (!mainAbnormality) {
            router.push('/');
            return;
        }

        const allBubbles = getAllAbnormalityBubbles();
        // Find relevant bubbles (limit 5 initially)
        const initialRelevant = findRelevantAbnormalityBubbles(mainAbnormality, allBubbles, 5);
        
        // Calculate library bubbles (Everything else)
        // Filter out main abnormality and already relevant abnormalities
        const relevantIds = new Set(initialRelevant.map(b => b.id));
        const libraryAbnormalities = allBubbles.filter(b => 
            b.id !== mainAbnormality.id && !relevantIds.has(b.id)
        );

        setData({
            mainAbnormality,
            initialRelevantAbnormalities: initialRelevant,
            libraryAbnormalities
        });
        setIsLoading(false);
    };

    fetchData();
  }, [abnormalityId, router]);

  const handleAnalyze = async (source: AbnormalityBubbleUnion, target: AbnormalityBubbleUnion) => {
    const response = await fetch('/api/openrouter/explain-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceAbnormality: source,
        matchedAbnormality: target,
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

  const isOwnBubble = currentLabId === data.mainAbnormality.labId;

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
            Abnormality Analysis Canvas
          </h1>
        </div>
        
        {!isOwnBubble && currentLabId && (
           <Link
             href={`/abnormality/${abnormalityId}/communicate`}
             className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
           >
             Open Communication Channel
           </Link>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <AbnormalityConnectionCanvas
          mainAbnormality={data.mainAbnormality}
          initialRelevantAbnormalities={data.initialRelevantAbnormalities}
          libraryAbnormalities={data.libraryAbnormalities}
          onAnalyze={handleAnalyze}
        />
      </div>
    </div>
  );
}
