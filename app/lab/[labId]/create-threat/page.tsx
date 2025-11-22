'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLabById } from '../../../lib/mockData';
import { getCurrentLab } from '../../../lib/storage';
import ThreatBubbleForm from '../../../components/ThreatBubbleForm';

export default function CreateThreatBubble() {
  const params = useParams();
  const router = useRouter();
  const labId = params.labId as string;
  const [lab, setLab] = useState(getLabById(labId));

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
  }, [labId, router]);

  if (!lab) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Create Threat Bubble
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Share information about a potential threat while controlling privacy levels
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <ThreatBubbleForm labId={labId} />
        </div>
      </div>
    </div>
  );
}

