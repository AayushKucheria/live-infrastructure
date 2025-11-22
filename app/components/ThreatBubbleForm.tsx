'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveThreatBubble } from '../lib/storage';
import { StoredThreatBubble } from '../lib/storage';

interface ThreatBubbleFormProps {
  labId: string;
  onSuccess?: () => void;
}

export default function ThreatBubbleForm({ labId, onSuccess }: ThreatBubbleFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    detectionMethod: '',
    timeline: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    privacyLevel: 'medium' as 'high' | 'medium' | 'low',
    detailedFindings: '',
    specificLocation: '',
    sampleCount: '',
    geneticMarkers: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bubble: StoredThreatBubble = {
      id: `threat-${Date.now()}`,
      labId,
      description: formData.description,
      location: formData.location,
      detectionMethod: formData.detectionMethod,
      timeline: formData.timeline,
      urgency: formData.urgency,
      privacyLevel: formData.privacyLevel,
      createdAt: new Date().toISOString(),
      ...(formData.detailedFindings && { detailedFindings: formData.detailedFindings }),
      ...(formData.specificLocation && { specificLocation: formData.specificLocation }),
      ...(formData.sampleCount && { sampleCount: parseInt(formData.sampleCount) }),
      ...(formData.geneticMarkers && { 
        geneticMarkers: formData.geneticMarkers.split(',').map(m => m.trim()).filter(m => m) 
      })
    };

    saveThreatBubble(bubble);
    
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(`/threat/${bubble.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Description / Summary *
        </label>
        <textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the threat or situation..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Location / Region *
          </label>
          <input
            type="text"
            id="location"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Mumbai, India"
          />
        </div>

        <div>
          <label htmlFor="detectionMethod" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Detection Method *
          </label>
          <select
            id="detectionMethod"
            required
            value={formData.detectionMethod}
            onChange={(e) => setFormData({ ...formData, detectionMethod: e.target.value })}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select method...</option>
            <option value="Wastewater monitoring">Wastewater monitoring</option>
            <option value="Genomic sequencing">Genomic sequencing</option>
            <option value="Clinical surveillance">Clinical surveillance</option>
            <option value="Airport screening">Airport screening</option>
            <option value="Modeling/forecasting">Modeling/forecasting</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="timeline" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Timeline *
        </label>
        <input
          type="text"
          id="timeline"
          required
          value={formData.timeline}
          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Detected 3 days ago"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="urgency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Urgency Level *
          </label>
          <select
            id="urgency"
            required
            value={formData.urgency}
            onChange={(e) => setFormData({ ...formData, urgency: e.target.value as 'low' | 'medium' | 'high' })}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="privacyLevel" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Privacy Level *
          </label>
          <select
            id="privacyLevel"
            required
            value={formData.privacyLevel}
            onChange={(e) => setFormData({ ...formData, privacyLevel: e.target.value as 'high' | 'medium' | 'low' })}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="high">High (bare minimum)</option>
            <option value="medium">Medium (anonymized details)</option>
            <option value="low">Low (full details)</option>
          </select>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {formData.privacyLevel === 'high' && 'Only essential information will be shared'}
            {formData.privacyLevel === 'medium' && 'Anonymized details will be included'}
            {formData.privacyLevel === 'low' && 'Full details will be shared'}
          </p>
        </div>
      </div>

      {/* Additional fields that appear based on privacy level */}
      {formData.privacyLevel !== 'high' && (
        <>
          <div>
            <label htmlFor="specificLocation" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Specific Location (optional)
            </label>
            <input
              type="text"
              id="specificLocation"
              value={formData.specificLocation}
              onChange={(e) => setFormData({ ...formData, specificLocation: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Specific hospital or facility"
            />
          </div>

          <div>
            <label htmlFor="detailedFindings" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Detailed Findings (optional)
            </label>
            <textarea
              id="detailedFindings"
              value={formData.detailedFindings}
              onChange={(e) => setFormData({ ...formData, detailedFindings: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional technical details, observations, etc."
            />
          </div>
        </>
      )}

      {formData.privacyLevel === 'low' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sampleCount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Sample Count (optional)
              </label>
              <input
                type="number"
                id="sampleCount"
                value={formData.sampleCount}
                onChange={(e) => setFormData({ ...formData, sampleCount: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Number of samples"
              />
            </div>

            <div>
              <label htmlFor="geneticMarkers" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Genetic Markers (optional)
              </label>
              <input
                type="text"
                id="geneticMarkers"
                value={formData.geneticMarkers}
                onChange={(e) => setFormData({ ...formData, geneticMarkers: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Comma-separated, e.g., MUT-2024-001, MUT-2024-002"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Threat Bubble
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

