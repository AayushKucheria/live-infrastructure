'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLabById } from '../../../lib/mockData';
import { getCurrentLab, saveAbnormalityBubble, StoredAbnormalityBubble, ClarificationAnnotation } from '../../../lib/storage';
import FreeFormAbnormalityInput from '../../../components/FreeFormAbnormalityInput';
import PostFormalArtifactEditor from '../../../components/PostFormalArtifactEditor';
import AISuggestionBubbles from '../../../components/AISuggestionBubbles';
import { PRIMARY_LAB_ID } from '../../../lib/constants';

interface StructuredAbnormalityData {
  description: string;
  location: string;
  detectionMethod: string;
  timeline: string;
  urgency: 'low' | 'medium' | 'high';
  detailedFindings?: string;
  specificLocation?: string;
  sampleCount?: number;
  geneticMarkers?: string[];
}

interface AISuggestion {
  text: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export default function CreateAbnormalityBubble() {
  const params = useParams();
  const router = useRouter();
  const labId = params.labId as string;
  const [lab, setLab] = useState(getLabById(labId));
  const [freeformText, setFreeformText] = useState('');
  const [structuredData, setStructuredData] = useState<StructuredAbnormalityData>({
    description: '',
    location: '',
    detectionMethod: '',
    timeline: '',
    urgency: 'medium'
  });
  const [privacyLevel, setPrivacyLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [clarifications, setClarifications] = useState<ClarificationAnnotation[]>([]);

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
  }, [labId, router]);

  const handleSuggestionClick = (suggestionText: string) => {
    setFreeformText(prev => prev + (prev ? ' ' : '') + suggestionText);
  };

  const handleClarificationAdd = (section: string, content: string) => {
    const newClarification: ClarificationAnnotation = {
      id: `clarification-${Date.now()}`,
      section,
      content,
      createdAt: new Date().toISOString()
    };
    setClarifications(prev => [...prev, newClarification]);
  };

  const handleClarificationRemove = (id: string) => {
    setClarifications(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = () => {
    const bubble: StoredAbnormalityBubble = {
      id: `abnormality-${Date.now()}`,
      labId,
      description: structuredData.description,
      location: structuredData.location,
      detectionMethod: structuredData.detectionMethod,
      timeline: structuredData.timeline,
      urgency: structuredData.urgency,
      privacyLevel,
      createdAt: new Date().toISOString(),
      detailedFindings: structuredData.detailedFindings,
      specificLocation: structuredData.specificLocation,
      sampleCount: structuredData.sampleCount,
      geneticMarkers: structuredData.geneticMarkers,
      rawFreeformInput: freeformText,
      clarifications: clarifications.length > 0 ? clarifications : undefined
    };

    saveAbnormalityBubble(bubble);
    router.push(`/abnormality/${bubble.id}`);
  };

  if (!lab) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      <div className="px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Create Abnormality Bubble
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Describe the abnormality in your own words. AI will help structure it for sharing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Freeform Input */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Privacy Level
                </label>
                <select
                  value={privacyLevel}
                  onChange={(e) => setPrivacyLevel(e.target.value as 'high' | 'medium' | 'low')}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="high">High (bare minimum)</option>
                  <option value="medium">Medium (anonymized details)</option>
                  <option value="low">Low (full details)</option>
                </select>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {privacyLevel === 'high' && 'Only essential information will be shared'}
                  {privacyLevel === 'medium' && 'Anonymized details will be included'}
                  {privacyLevel === 'low' && 'Full details will be shared'}
                </p>
              </div>

              <FreeFormAbnormalityInput
                value={freeformText}
                onChange={setFreeformText}
                onStructuredDataChange={setStructuredData}
                onSuggestionsChange={setSuggestions}
                privacyLevel={privacyLevel}
              />

              <AISuggestionBubbles
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={!structuredData.description}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Abnormality Bubble
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right column: Preview */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)]">
            <PostFormalArtifactEditor
              structuredData={structuredData}
              labId={labId}
              privacyLevel={privacyLevel}
              onDataChange={setStructuredData}
              clarifications={clarifications}
              onClarificationAdd={handleClarificationAdd}
              onClarificationRemove={handleClarificationRemove}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
